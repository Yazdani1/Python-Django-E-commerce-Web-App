from rest_framework import serializers

from apps.products.serializers import ProductReadSerializer

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductReadSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "line_total"]

    def get_line_total(self, obj: CartItem) -> str:
        return str(obj.line_total)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "total_items", "subtotal"]

    def get_subtotal(self, obj: Cart) -> str:
        return str(obj.subtotal)


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate_product_id(self, value: int) -> int:
        from apps.products.models import Product

        if not Product.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError("Product not found or unavailable.")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
