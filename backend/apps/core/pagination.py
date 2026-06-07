"""
Reusable pagination classes.
Add new page-size variants here rather than duplicating inline.
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsPagination(PageNumberPagination):
    """Default: 20 items/page, client can request up to 100."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data: list) -> Response:
        return Response(
            {
                "success": True,
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )


class LargeResultsPagination(PageNumberPagination):
    """For admin/export endpoints that need larger pages."""

    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 500
