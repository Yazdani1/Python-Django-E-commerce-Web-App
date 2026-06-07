from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import AppError
from apps.core.mixins import SuccessResponseMixin
from apps.products.models import Product

from .models import Cart, CartItem
from .serializers import (
    AddToCartSerializer,
    CartSerializer,
    UpdateCartItemSerializer,
)


def _get_or_create_cart(user) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def _serialize_cart(cart: Cart, request: Request) -> dict:
    return CartSerializer(cart, context={"request": request}).data


class CartView(SuccessResponseMixin, APIView):
    """
    GET  /cart/          — return current user's cart
    POST /cart/          — add a product (or increment qty if already in cart)
    DELETE /cart/        — clear all items from cart
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        cart = _get_or_create_cart(request.user)
        return self.success_response(data=_serialize_cart(cart, request))

    def post(self, request: Request) -> Response:
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = Product.objects.get(pk=serializer.validated_data["product_id"])
        qty = serializer.validated_data["quantity"]
        cart = _get_or_create_cart(request.user)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": qty},
        )
        if not created:
            item.quantity += qty
            item.save(update_fields=["quantity"])

        cart.refresh_from_db()
        msg = "Product added to cart." if created else "Cart item quantity updated."
        return self.success_response(
            data=_serialize_cart(cart, request),
            message=msg,
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request: Request) -> Response:
        cart = _get_or_create_cart(request.user)
        cart.items.all().delete()
        return self.success_response(message="Cart cleared.")


class CartItemView(SuccessResponseMixin, APIView):
    """
    PATCH  /cart/items/{item_id}/   — update quantity
    DELETE /cart/items/{item_id}/   — remove item
    """

    permission_classes = [IsAuthenticated]

    def _get_item(self, item_id: int, user) -> CartItem:
        try:
            return CartItem.objects.select_related("cart").get(
                pk=item_id, cart__user=user
            )
        except CartItem.DoesNotExist:
            raise AppError("Cart item not found.", status.HTTP_404_NOT_FOUND)

    def patch(self, request: Request, item_id: int) -> Response:
        item = self._get_item(item_id, request.user)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item.quantity = serializer.validated_data["quantity"]
        item.save(update_fields=["quantity"])
        cart = _get_or_create_cart(request.user)
        return self.success_response(
            data=_serialize_cart(cart, request),
            message="Quantity updated.",
        )

    def delete(self, request: Request, item_id: int) -> Response:
        item = self._get_item(item_id, request.user)
        item.delete()
        cart = _get_or_create_cart(request.user)
        return self.success_response(
            data=_serialize_cart(cart, request),
            message="Item removed from cart.",
        )
