"""
Category serializers.

Two serializers keep read and write concerns separate:

  CategoryReadSerializer  — public, all fields read-only, returned for every
                            GET response and as the response body after a write.

  CategoryWriteSerializer — admin-only input; slug is optional (auto-generated
                            from name on create, preserved as-is on update if
                            the caller does not supply a new value).

Slug uniqueness is enforced by the model's unique=True constraint; DRF adds a
UniqueValidator automatically and excludes the current instance on PATCH/PUT so
a category can be updated without changing its slug.
"""

from django.utils.text import slugify

from rest_framework import serializers

from .models import Category


class CategoryReadSerializer(serializers.ModelSerializer):
    """Read-only snapshot — safe to return to any caller."""

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class CategoryWriteSerializer(serializers.ModelSerializer):
    """
    Admin-only write serializer.
    slug: optional — omit to auto-generate from name on create,
          or supply to set/override explicitly.
    """

    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = ["name", "slug", "description", "is_active"]

    def validate(self, attrs: dict) -> dict:
        if not attrs.get("slug"):
            if self.instance:
                # PATCH/PUT without a new slug — keep the existing one
                attrs["slug"] = self.instance.slug
            else:
                # POST without a slug — derive from name
                attrs["slug"] = slugify(attrs.get("name", ""))
        return attrs
