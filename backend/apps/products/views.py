from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from apps.core.mixins import SuccessResponseMixin
from apps.core.pagination import ProductResultsPagination

from .filters import ProductFilter
from .models import Product
from .serializers import ProductReadSerializer, ProductWriteSerializer


class ProductViewSet(SuccessResponseMixin, viewsets.ModelViewSet):
    """
    list, retrieve   — public (AllowAny)
    create, update,
    partial_update,
    destroy          — admin only (IsAdminUser)

    Search:  ?search=keyword          (name, description)
    Filter:  ?category=electronics    (category slug)
             ?min_price=10&max_price=100
    Sort:    ?ordering=price           (ascending)
             ?ordering=-price          (descending)
             ?ordering=-created_at     (newest)
    Page:    ?page=2&page_size=10
    """

    lookup_field = "slug"
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = ProductResultsPagination

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at", "name"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "related"):
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

    @action(detail=True, methods=["get"], url_path="related")
    def related(self, request: Request, slug: str = None) -> Response:
        """Return up to 4 active products in the same category, excluding this product."""
        instance = self.get_object()
        qs = (
            Product.objects.select_related("category")
            .filter(is_active=True, category=instance.category)
            .exclude(pk=instance.pk)[:4]
        )
        serializer = ProductReadSerializer(qs, many=True, context={"request": request})
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
