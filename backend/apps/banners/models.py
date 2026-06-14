from django.db import models

from apps.core.models import TimeStampedModel


class Banner(TimeStampedModel):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=500, blank=True, default="")
    image = models.ImageField(upload_to="banners/")
    link_url = models.CharField(max_length=500, blank=True, default="")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "created_at"]
        verbose_name = "Banner"
        verbose_name_plural = "Banners"

    def __str__(self) -> str:
        return self.title
