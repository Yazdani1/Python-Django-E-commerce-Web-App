import factory

from apps.users.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    phone_number = ""
    is_active = True

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        raw = extracted or "TestPass123!"
        self.set_password(raw)
        if create:
            self.save(update_fields=["password"])


class AdminUserFactory(UserFactory):
    is_staff = True
    is_superuser = True
