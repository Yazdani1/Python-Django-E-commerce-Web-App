"""
Custom User model — always define this before the first migration.
Uses email as the primary login identifier instead of username.

AbstractBaseUser (not AbstractUser) is intentional: AbstractUser forces a
username field we don't want. AbstractBaseUser gives us a clean slate while
PermissionsMixin adds Django's group/permission system.
"""

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.validators import RegexValidator
from django.db import models

from apps.core.models import TimeStampedModel

_phone_regex = RegexValidator(
    regex=r"^(\+?[\d\s\-().]{7,20})?$",
    message="Enter a valid phone number (7–20 digits, optional + prefix).",
)


class UserManager(BaseUserManager):
    """Manager that uses email (not username) as the unique identifier."""

    def create_user(self, email: str, password: str = None, **extra_fields) -> "User":
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields) -> "User":
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        default="",
        validators=[_phone_regex],
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta(TimeStampedModel.Meta):
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.email
