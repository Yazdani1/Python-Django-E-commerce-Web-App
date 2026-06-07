"""
Authentication serializers for login input validation.
Token generation is handled by simplejwt; these only validate credentials.
"""

from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
