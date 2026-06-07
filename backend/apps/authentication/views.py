"""
JWT Authentication views: login, refresh, logout.
Thin wrappers around simplejwt — no business logic here.
"""

from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.mixins import SuccessResponseMixin

from .serializers import LoginSerializer


def _get_tokens_for_user(user) -> dict:
    """Generate access + refresh token pair for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class LoginView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"success": False, "message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return self.success_response(
            data=_get_tokens_for_user(user),
            message="Login successful.",
        )


class TokenRefreshView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            refresh = RefreshToken(refresh_token)
            return self.success_response(
                data={"access": str(refresh.access_token)},
                message="Token refreshed.",
            )
        except TokenError as exc:
            return Response(
                {"success": False, "message": str(exc)},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh_token).blacklist()
            return self.success_response(message="Logged out successfully.")
        except TokenError as exc:
            return Response(
                {"success": False, "message": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
