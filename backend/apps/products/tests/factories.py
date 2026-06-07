from decimal import Decimal

from django.utils.text import slugify

import factory

from apps.categories.tests.factories import CategoryFactory
from apps.products.models import Product


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    name = factory.Sequence(lambda n: f"Product {n}")
    slug = factory.LazyAttribute(lambda o: slugify(o.name))
    sku = factory.Sequence(lambda n: f"SKU-{str(n).zfill(8).upper()}")
    description = factory.Faker("paragraph")
    price = factory.LazyFunction(lambda: Decimal("29.99"))
    stock_quantity = 10
    category = factory.SubFactory(CategoryFactory)
    is_active = True


class InactiveProductFactory(ProductFactory):
    is_active = False
