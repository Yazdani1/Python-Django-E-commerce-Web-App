from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("line_total",)

    def line_total(self, obj: CartItem) -> str:
        return f"${obj.line_total:.2f}"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "total_items", "subtotal", "created_at")
    inlines = [CartItemInline]
    readonly_fields = ("total_items", "subtotal")
