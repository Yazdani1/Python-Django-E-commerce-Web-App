from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Banner",
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
                ("title", models.CharField(max_length=255)),
                ("subtitle", models.CharField(blank=True, default="", max_length=500)),
                ("image", models.ImageField(upload_to="banners/")),
                ("link_url", models.CharField(blank=True, default="", max_length=500)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "Banner",
                "verbose_name_plural": "Banners",
                "ordering": ["order", "created_at"],
                "abstract": False,
            },
        ),
    ]
