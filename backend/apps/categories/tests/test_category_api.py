"""
Category API tests.
Every endpoint has: happy path, permission check, validation/error path.
"""

from rest_framework import status
from rest_framework.test import APIClient

import pytest

from apps.categories.tests.factories import CategoryFactory, InactiveCategoryFactory
from apps.users.tests.factories import AdminUserFactory, UserFactory


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def admin(db):
    return AdminUserFactory()


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def admin_client(admin):
    client = APIClient()
    client.force_authenticate(user=admin)
    return client


LIST_URL = "/api/v1/categories/"
DETAIL_URL = "/api/v1/categories/{slug}/"


def detail(slug: str) -> str:
    return DETAIL_URL.format(slug=slug)


# ── List ───────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestCategoryList:
    def test_list_unauthenticated_succeeds(self, api_client, db) -> None:
        CategoryFactory.create_batch(3)
        response = api_client.get(LIST_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_list_returns_only_active_for_public(self, api_client, db) -> None:
        CategoryFactory.create_batch(2)
        InactiveCategoryFactory()
        response = api_client.get(LIST_URL)
        results = response.data["results"]
        assert len(results) == 2
        assert all(c["is_active"] for c in results)

    def test_list_admin_sees_inactive(self, admin_client, db) -> None:
        CategoryFactory()
        InactiveCategoryFactory()
        response = admin_client.get(LIST_URL)
        assert len(response.data["results"]) == 2

    def test_list_response_fields(self, api_client, db) -> None:
        CategoryFactory()
        response = api_client.get(LIST_URL)
        item = response.data["results"][0]
        for field in ("id", "name", "slug", "description", "is_active", "created_at"):
            assert field in item


# ── Retrieve ───────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestCategoryRetrieve:
    def test_retrieve_unauthenticated_succeeds(self, api_client, db) -> None:
        cat = CategoryFactory()
        response = api_client.get(detail(cat.slug))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["slug"] == cat.slug

    def test_retrieve_not_found(self, api_client, db) -> None:
        response = api_client.get(detail("does-not-exist"))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_inactive_hidden_from_public(self, api_client, db) -> None:
        cat = InactiveCategoryFactory()
        response = api_client.get(detail(cat.slug))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_inactive_visible_to_admin(self, admin_client, db) -> None:
        cat = InactiveCategoryFactory()
        response = admin_client.get(detail(cat.slug))
        assert response.status_code == status.HTTP_200_OK


# ── Create ─────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestCategoryCreate:
    def test_create_success(self, admin_client) -> None:
        payload = {"name": "Electronics", "description": "All things electronic."}
        response = admin_client.post(LIST_URL, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["data"]["name"] == "Electronics"

    def test_create_auto_generates_slug(self, admin_client) -> None:
        response = admin_client.post(LIST_URL, {"name": "Home & Garden"}, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["data"]["slug"] == "home-garden"

    def test_create_custom_slug_respected(self, admin_client) -> None:
        payload = {"name": "Books", "slug": "books-and-media"}
        response = admin_client.post(LIST_URL, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["data"]["slug"] == "books-and-media"

    def test_create_duplicate_name_rejected(self, admin_client, db) -> None:
        CategoryFactory(name="Electronics")
        response = admin_client.post(LIST_URL, {"name": "Electronics"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_missing_name_rejected(self, admin_client) -> None:
        response = admin_client.post(LIST_URL, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_non_admin_forbidden(self, auth_client) -> None:
        response = auth_client.post(LIST_URL, {"name": "Electronics"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_unauthenticated_returns_401(self, api_client) -> None:
        response = api_client.post(LIST_URL, {"name": "Electronics"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── Update ─────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestCategoryUpdate:
    def test_full_update_success(self, admin_client, db) -> None:
        cat = CategoryFactory(name="Old Name")
        payload = {"name": "New Name", "description": "Updated.", "is_active": True}
        response = admin_client.put(detail(cat.slug), payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["name"] == "New Name"

    def test_partial_update_preserves_slug(self, admin_client, db) -> None:
        cat = CategoryFactory()
        original_slug = cat.slug
        response = admin_client.patch(
            detail(cat.slug), {"name": "Renamed"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["slug"] == original_slug

    def test_partial_update_slug_can_change(self, admin_client, db) -> None:
        cat = CategoryFactory()
        response = admin_client.patch(
            detail(cat.slug), {"slug": "brand-new-slug"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["slug"] == "brand-new-slug"

    def test_update_non_admin_forbidden(self, auth_client, db) -> None:
        cat = CategoryFactory()
        response = auth_client.patch(
            detail(cat.slug), {"name": "Hacked"}, format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_unauthenticated_returns_401(self, api_client, db) -> None:
        cat = CategoryFactory()
        response = api_client.patch(detail(cat.slug), {"name": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── Delete ─────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestCategoryDelete:
    def test_delete_success(self, admin_client, db) -> None:
        cat = CategoryFactory()
        response = admin_client.delete(detail(cat.slug))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_delete_non_admin_forbidden(self, auth_client, db) -> None:
        cat = CategoryFactory()
        response = auth_client.delete(detail(cat.slug))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_unauthenticated_returns_401(self, api_client, db) -> None:
        cat = CategoryFactory()
        response = api_client.delete(detail(cat.slug))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_removes_from_db(self, admin_client, db) -> None:
        from apps.categories.models import Category

        cat = CategoryFactory()
        admin_client.delete(detail(cat.slug))
        assert not Category.objects.filter(pk=cat.pk).exists()
