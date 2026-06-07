from django.urls import path

from .views import CheckoutView, OrderDetailView, OrderListView, OrderStatusUpdateView

app_name = "orders"

urlpatterns = [
    path("", OrderListView.as_view(), name="order-list"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("<int:order_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("<int:order_id>/status/", OrderStatusUpdateView.as_view(), name="order-status"),
]
