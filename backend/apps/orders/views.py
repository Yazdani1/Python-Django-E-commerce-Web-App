from decimal import Decimal

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import AppError
from apps.core.mixins import SuccessResponseMixin
from apps.core.pagination import StandardResultsPagination

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer, UpdateOrderStatusSerializer


class CheckoutView(SuccessResponseMixin, APIView):
    """
    POST /orders/checkout/

    Transactional checkout:
      1. Validate cart is not empty
      2. Validate all items have sufficient stock
      3. Create Order + OrderItems (copy product snapshot)
      4. Reduce stock_quantity for each product
      5. Clear the cart
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request: Request) -> Response:
        from apps.cart.models import Cart

        try:
            cart = Cart.objects.prefetch_related(
                "items__product"
            ).get(user=request.user)
        except Cart.DoesNotExist:
            raise AppError("Your cart is empty.", status.HTTP_400_BAD_REQUEST)

        items = list(cart.items.all())
        if not items:
            raise AppError("Your cart is empty.", status.HTTP_400_BAD_REQUEST)

        # Validate stock before touching anything
        for item in items:
            if item.product.stock_quantity < item.quantity:
                raise AppError(
                    f"Insufficient stock for '{item.product.name}'. "
                    f"Available: {item.product.stock_quantity}.",
                    status.HTTP_400_BAD_REQUEST,
                )

        total = Decimal("0.00")
        order = Order.objects.create(user=request.user, total_amount=total)

        # Record initial PENDING status timestamp
        OrderStatusHistory.objects.create(order=order, status=Order.Status.PENDING)

        order_items = []
        for item in items:
            order_items.append(
                OrderItem(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    product_sku=item.product.sku,
                    unit_price=item.product.price,
                    quantity=item.quantity,
                )
            )
            total += item.product.price * item.quantity
            # Reduce stock atomically
            item.product.__class__.objects.filter(pk=item.product.pk).update(
                stock_quantity=item.product.stock_quantity - item.quantity
            )

        OrderItem.objects.bulk_create(order_items)
        order.total_amount = total
        order.save(update_fields=["total_amount"])

        # Clear cart
        cart.items.all().delete()

        return self.success_response(
            data=OrderSerializer(order).data,
            message="Order placed successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class OrderListView(SuccessResponseMixin, APIView):
    """GET /orders/ — authenticated user sees own orders; admin sees all."""

    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get(self, request: Request) -> Response:
        if request.user.is_staff:
            qs = Order.objects.prefetch_related("items", "status_history").all()
        else:
            qs = Order.objects.prefetch_related("items", "status_history").filter(
                user=request.user
            )

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        if page is not None:
            return paginator.get_paginated_response(OrderSerializer(page, many=True).data)
        return self.success_response(data=OrderSerializer(qs, many=True).data)


class OrderDetailView(SuccessResponseMixin, APIView):
    """GET /orders/{id}/ — owner or admin can retrieve."""

    permission_classes = [IsAuthenticated]

    def get(self, request: Request, order_id: int) -> Response:
        try:
            if request.user.is_staff:
                order = Order.objects.prefetch_related("items", "status_history").get(
                    pk=order_id
                )
            else:
                order = Order.objects.prefetch_related("items", "status_history").get(
                    pk=order_id, user=request.user
                )
        except Order.DoesNotExist:
            raise AppError("Order not found.", status.HTTP_404_NOT_FOUND)
        return self.success_response(data=OrderSerializer(order).data)


class OrderStatusUpdateView(SuccessResponseMixin, APIView):
    """PATCH /orders/{id}/status/ — admin only."""

    permission_classes = [IsAdminUser]

    def patch(self, request: Request, order_id: int) -> Response:
        try:
            order = Order.objects.prefetch_related("status_history").get(pk=order_id)
        except Order.DoesNotExist:
            raise AppError("Order not found.", status.HTTP_404_NOT_FOUND)
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status"])
        OrderStatusHistory.objects.create(order=order, status=order.status)
        return self.success_response(
            data=OrderSerializer(order).data,
            message="Order status updated.",
        )
