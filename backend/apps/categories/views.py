from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.mixins import SuccessResponseMixin

from .models import Category
from .serializers import CategoryReadSerializer, CategoryWriteSerializer


class CategoryViewSet(SuccessResponseMixin, viewsets.ModelViewSet):
    """
    list, retrieve   — public (AllowAny)
    create, update,
    partial_update,
    destroy          — admin only (IsAdminUser / is_staff=True)

    Admins also see inactive categories; public callers see only active ones.
    lookup_field = "slug" so URLs are /categories/<slug>/ not /categories/<pk>/.
    """

    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CategoryWriteSerializer
        return CategoryReadSerializer

    def get_queryset(self):
        if getattr(self.request.user, "is_staff", False):
            return Category.objects.all()
        return Category.objects.filter(is_active=True)

    # ── Read ──────────────────────────────────────────────────────────────────

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            # StandardResultsPagination already returns the success envelope
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return self.success_response(data=serializer.data)

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return self.success_response(data=serializer.data)

    # ── Write ─────────────────────────────────────────────────────────────────

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return self.success_response(
            data=CategoryReadSerializer(category).data,
            message="Category created successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def update(self, request: Request, *args, **kwargs) -> Response:
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return self.success_response(
            data=CategoryReadSerializer(category).data,
            message="Category updated successfully.",
        )

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        instance.delete()
        return self.success_response(message="Category deleted successfully.")
