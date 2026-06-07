import uuid

from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


def _generate_sku() -> str:
    """Return a unique SKU like SKU-A1B2C3D4."""
    return f"SKU-{uuid.uuid4().hex[:8].upper()}"


class Product(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(max_length=20, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    is_active = models.BooleanField(default=True)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.sku})"

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.sku:
            self.sku = _generate_sku()
        super().save(*args, **kwargs)
