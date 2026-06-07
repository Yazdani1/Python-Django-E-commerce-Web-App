from django.db.models import Sum
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart
from apps.categories.models import Category
from apps.core.mixins import SuccessResponseMixin
from apps.orders.models import Order
from apps.products.models import Product
from apps.users.models import User


class AdminStatsView(SuccessResponseMixin, APIView):
    """
    GET /admin/stats/

    Aggregates across the whole DB via Django ORM:
    - COUNT(users)      → Django evaluates as SELECT COUNT(*) FROM users_user
    - COUNT(products)   → SELECT COUNT(*) FROM products_product
    - COUNT(orders)     → SELECT COUNT(*) FROM orders_order
    - COUNT(categories) → SELECT COUNT(*) FROM categories_category
    - SUM(total_amount) → SELECT SUM(total_amount) FROM orders_order WHERE status != 'CANCELLED'
    - COUNT(pending)    → COUNT with status filter
    All run as separate, cheap aggregate queries — no full table scans.
    """

    permission_classes = [IsAdminUser]

    def get(self, request: Request) -> Response:
        total_revenue = (
            Order.objects.exclude(status=Order.Status.CANCELLED)
            .aggregate(revenue=Sum("total_amount"))["revenue"]
            or 0
        )

        data = {
            "total_users": User.objects.count(),
            "total_products": Product.objects.count(),
            "total_orders": Order.objects.count(),
            "total_categories": Category.objects.count(),
            "total_revenue": str(total_revenue),
            "pending_orders": Order.objects.filter(status=Order.Status.PENDING).count(),
            "active_carts": Cart.objects.count(),
        }

        return self.success_response(data=data)
