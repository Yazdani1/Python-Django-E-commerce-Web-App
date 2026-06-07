"""
Authentication API tests — login, refresh, logout.
Every endpoint has: happy path, auth/permission check, validation error path.
"""

from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

import pytest

from apps.users.tests.factories import UserFactory


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db):
    return UserFactory()


def get_tokens_for_user(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


# ── Login ──────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestLoginView:
    url = "/api/v1/auth/login/"

    def test_login_success(self, api_client: APIClient, user) -> None:
        response = api_client.post(
            self.url,
            {"email": user.email, "password": "TestPass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert "access" in response.data["data"]
        assert "refresh" in response.data["data"]

    def test_login_wrong_password(self, api_client: APIClient, user) -> None:
        response = api_client.post(
            self.url,
            {"email": user.email, "password": "WrongPassword!"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["success"] is False

    def test_login_nonexistent_user(self, api_client: APIClient) -> None:
        response = api_client.post(
            self.url,
            {"email": "nobody@example.com", "password": "any"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_inactive_user(self, api_client: APIClient, db) -> None:
        inactive_user = UserFactory(is_active=False)
        response = api_client.post(
            self.url,
            {"email": inactive_user.email, "password": "TestPass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_email(self, api_client: APIClient) -> None:
        response = api_client.post(
            self.url, {"password": "TestPass123!"}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_missing_password(self, api_client: APIClient, user) -> None:
        response = api_client.post(self.url, {"email": user.email}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ── Token Refresh ──────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestTokenRefreshView:
    url = "/api/v1/auth/refresh/"

    def test_refresh_success(self, api_client: APIClient, user) -> None:
        tokens = get_tokens_for_user(user)
        response = api_client.post(
            self.url, {"refresh": tokens["refresh"]}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data["data"]

    def test_refresh_invalid_token(self, api_client: APIClient) -> None:
        response = api_client.post(
            self.url, {"refresh": "not-a-valid-token"}, format="json"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["success"] is False

    def test_refresh_missing_token(self, api_client: APIClient) -> None:
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ── Logout ─────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestLogoutView:
    url = "/api/v1/auth/logout/"

    def test_logout_success(self, api_client: APIClient, user) -> None:
        tokens = get_tokens_for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(
            self.url, {"refresh": tokens["refresh"]}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_logout_missing_refresh_token(self, api_client: APIClient, user) -> None:
        tokens = get_tokens_for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_logout_unauthenticated(self, api_client: APIClient) -> None:
        response = api_client.post(self.url, {"refresh": "any-token"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
