"""
Authentication API tests — login, refresh, logout, register, profile.
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


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def get_tokens_for_user(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


# ── Register (auth prefix alias) ───────────────────────────────────────────────
@pytest.mark.django_db
class TestRegisterViaAuth:
    url = "/api/v1/auth/register/"

    def test_register_success(self, api_client: APIClient) -> None:
        payload = {
            "email": "authregister@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "first_name": "Auth",
            "last_name": "User",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["data"]["email"] == "authregister@example.com"

    def test_register_duplicate_email(self, api_client: APIClient, user) -> None:
        payload = {
            "email": user.email,
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client: APIClient) -> None:
        payload = {
            "email": "new@example.com",
            "password": "StrongPass123!",
            "password_confirm": "WrongPass!",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ── Profile (auth prefix alias) ────────────────────────────────────────────────
@pytest.mark.django_db
class TestProfileViaAuth:
    url = "/api/v1/auth/profile/"

    def test_get_profile_authenticated(self, auth_client: APIClient, user) -> None:
        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["email"] == user.email
        assert "phone_number" in response.data["data"]

    def test_get_profile_unauthenticated(self, api_client: APIClient) -> None:
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, auth_client: APIClient) -> None:
        response = auth_client.patch(
            self.url, {"phone_number": "+1-800-555-0100"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["phone_number"] == "+1-800-555-0100"


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
