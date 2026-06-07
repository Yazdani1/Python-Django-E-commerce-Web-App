"""
User API views.
Only the currently authenticated user's own profile is exposed here.
Admin-level user management belongs in the Django admin or a separate admin app.
"""

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.views import APIView

from apps.core.mixins import SuccessResponseMixin

from .serializers import (
    ChangePasswordSerializer,
    UserCreateSerializer,
    UserReadSerializer,
    UserUpdateSerializer,
)


class RegisterView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> None:
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return self.success_response(
            data=UserReadSerializer(user).data,
            message="Account created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class MeView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> None:
        return self.success_response(data=UserReadSerializer(request.user).data)

    def patch(self, request: Request) -> None:
        serializer = UserUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self.success_response(
            data=UserReadSerializer(request.user).data,
            message="Profile updated.",
        )


class ChangePasswordView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> None:
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return self.success_response(message="Password changed successfully.")
