from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Cart(TimeStampedModel):
    """One cart per authenticated user, created on first add-to-cart."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Cart"
        verbose_name_plural = "Carts"

    def __str__(self) -> str:
        return f"Cart({self.user.email})"

    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())


class CartItem(TimeStampedModel):
    """A single product line inside a cart. Duplicate products are prevented by unique_together."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        unique_together = [["cart", "product"]]

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product.name}"

    @property
    def line_total(self):
        return self.product.price * self.quantity
