from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.mixins import SuccessResponseMixin

from .models import Banner
from .serializers import BannerSerializer, BannerWriteSerializer


class BannerViewSet(SuccessResponseMixin, viewsets.ModelViewSet):
    """
    list, retrieve — public (AllowAny)
    create, update, partial_update, destroy — admin only (IsAdminUser)
    """

    queryset = Banner.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return BannerWriteSerializer
        return BannerSerializer

    def get_queryset(self):
        if self.action == "list" and not getattr(self.request.user, "is_staff", False):
            return Banner.objects.filter(is_active=True)
        return Banner.objects.all()

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.get_queryset()
        serializer = BannerSerializer(queryset, many=True, context={"request": request})
        return self.success_response(data=serializer.data)

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = BannerSerializer(instance, context={"request": request})
        return self.success_response(data=serializer.data)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = BannerWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        banner = serializer.save()
        return self.success_response(
            data=BannerSerializer(banner, context={"request": request}).data,
            message="Banner created successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def update(self, request: Request, *args, **kwargs) -> Response:
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = BannerWriteSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        banner = serializer.save()
        return self.success_response(
            data=BannerSerializer(banner, context={"request": request}).data,
            message="Banner updated successfully.",
        )

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        instance.delete()
        return self.success_response(message="Banner deleted successfully.")
