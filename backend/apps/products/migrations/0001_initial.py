import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("categories", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255, unique=True)),
                (
                    "slug",
                    models.SlugField(blank=True, max_length=280, unique=True),
                ),
                (
                    "sku",
                    models.CharField(blank=True, max_length=20, unique=True),
                ),
                ("description", models.TextField(blank=True, default="")),
                (
                    "price",
                    models.DecimalField(decimal_places=2, max_digits=10),
                ),
                (
                    "stock_quantity",
                    models.PositiveIntegerField(default=0),
                ),
                (
                    "image",
                    models.ImageField(
                        blank=True, null=True, upload_to="products/"
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                (
                    "category",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="products",
                        to="categories.category",
                    ),
                ),
            ],
            options={
                "verbose_name": "Product",
                "verbose_name_plural": "Products",
                "ordering": ["name"],
                "abstract": False,
            },
        ),
    ]
