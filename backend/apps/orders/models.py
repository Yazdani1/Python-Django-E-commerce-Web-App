from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Order(TimeStampedModel):
    """
    Snapshot of a checkout. Product info is copied into OrderItem so the order
    remains accurate even if the product is later edited or deleted.
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self) -> str:
        return f"Order #{self.pk} — {self.user.email} ({self.status})"


class OrderItem(TimeStampedModel):
    """
    Immutable snapshot of a product line at checkout time.
    Stores product name, SKU, and unit_price so the order is accurate even if
    the product is later modified.
    """

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    # Nullable FK — product stays linked for reporting but won't block order history
    # if the product is ever deleted.
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=20)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product_name} @ ${self.unit_price}"

    @property
    def line_total(self):
        return self.unit_price * self.quantity
