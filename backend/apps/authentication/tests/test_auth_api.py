"""
Authentication API tests — login, refresh, logout flows.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db) -> User:
    return User.objects.create_user(email="auth@example.com", password="StrongPass123!")


@pytest.mark.django_db
class TestLoginView:
    url = "/api/v1/auth/login/"

    def test_login_success(self, api_client: APIClient, user: User) -> None:
        response = api_client.post(
            self.url,
            {"email": user.email, "password": "StrongPass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data["data"]
        assert "refresh" in response.data["data"]

    def test_login_wrong_password(self, api_client: APIClient, user: User) -> None:
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
