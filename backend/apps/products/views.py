from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.mixins import SuccessResponseMixin

from .models import Product
from .serializers import ProductReadSerializer, ProductWriteSerializer


class ProductViewSet(SuccessResponseMixin, viewsets.ModelViewSet):
    """
    list, retrieve   — public (AllowAny)
    create, update,
    partial_update,
    destroy          — admin only (IsAdminUser)

    Admins see all products; public callers see only active ones.
    lookup_field = "slug" so URLs are /products/<slug>/ not /products/<pk>/.
    Images are accepted as multipart uploads.
    """

    lookup_field = "slug"
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ProductWriteSerializer
        return ProductReadSerializer

    def get_queryset(self):
        if getattr(self.request.user, "is_staff", False):
            return Product.objects.select_related("category").all()
        return Product.objects.select_related("category").filter(is_active=True)

    # ── Read ──────────────────────────────────────────────────────────────────

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, context={"request": request})
        return self.success_response(data=serializer.data)

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = ProductReadSerializer(instance, context={"request": request})
        return self.success_response(data=serializer.data)

    # ── Write ─────────────────────────────────────────────────────────────────

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return self.success_response(
            data=ProductReadSerializer(product, context={"request": request}).data,
            message="Product created successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def update(self, request: Request, *args, **kwargs) -> Response:
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return self.success_response(
            data=ProductReadSerializer(product, context={"request": request}).data,
            message="Product updated successfully.",
        )

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        instance.delete()
        return self.success_response(message="Product deleted successfully.")
