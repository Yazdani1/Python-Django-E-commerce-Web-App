"""
Root URL configuration.
All app-level URLs are namespaced and mounted here.
"""

from django.contrib import admin
from django.urls import include, path

API_V1 = "api/v1/"

urlpatterns = [
    path("admin/", admin.site.urls),
    path(API_V1 + "auth/", include("apps.authentication.urls", namespace="auth")),
    path(API_V1 + "users/", include("apps.users.urls", namespace="users")),
    path(
        API_V1 + "categories/", include("apps.categories.urls", namespace="categories")
    ),
    path(API_V1 + "products/", include("apps.products.urls", namespace="products")),
]
