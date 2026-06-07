from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "product_sku", "unit_price", "quantity", "line_total")

    def line_total(self, obj: OrderItem) -> str:
        return f"${obj.line_total:.2f}"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_amount", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email",)
    readonly_fields = ("total_amount", "created_at", "updated_at")
    inlines = [OrderItemInline]
