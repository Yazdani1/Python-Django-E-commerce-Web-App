from rest_framework import serializers

from .models import Banner


class BannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "subtitle",
            "image_url",
            "link_url",
            "order",
            "is_active",
            "created_at",
        ]

    def get_image_url(self, obj: Banner) -> str | None:
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class BannerWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=True)

    class Meta:
        model = Banner
        fields = ["title", "subtitle", "image", "link_url", "order", "is_active"]
