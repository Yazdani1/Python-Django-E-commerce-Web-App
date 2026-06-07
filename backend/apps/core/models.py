"""
Abstract base model that every concrete model in this project inherits from.
Provides audit fields (created_at, updated_at) automatically.
"""

from django.db import models


class TimeStampedModel(models.Model):
    """Mixin that adds created_at and updated_at to any model."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
