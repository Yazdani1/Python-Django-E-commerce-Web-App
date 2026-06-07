from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "category",
        "price",
        "stock_quantity",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "category")
    search_fields = ("name", "sku", "slug")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("sku", "created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "slug", "sku", "category", "is_active")}),
        ("Details", {"fields": ("description", "price", "stock_quantity", "image")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
