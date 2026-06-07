from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class Category(TimeStampedModel):
    """
    Product category.
    slug is auto-generated from name on first save if not supplied;
    admins can override it explicitly via the API or admin panel.
    """

    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        # Fallback: auto-slug when saving through admin panel or shell
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
