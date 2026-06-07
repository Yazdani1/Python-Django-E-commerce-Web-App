from django.utils.text import slugify

import factory

from apps.categories.models import Category


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")
    slug = factory.LazyAttribute(lambda o: slugify(o.name))
    description = factory.Faker("paragraph")
    is_active = True


class InactiveCategoryFactory(CategoryFactory):
    is_active = False
