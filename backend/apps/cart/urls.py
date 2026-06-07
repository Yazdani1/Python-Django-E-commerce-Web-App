from django.urls import path

from .views import CartItemView, CartView

app_name = "cart"

urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("items/<int:item_id>/", CartItemView.as_view(), name="cart-item"),
]
