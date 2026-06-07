"""
Management command: seed the database with categories and products for testing.

Usage:
    python manage.py seed_data           # add missing records only (safe to re-run)
    python manage.py seed_data --clear   # delete all products & categories first
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.categories.models import Category
from apps.products.models import Product

CATEGORIES = [
    {"name": "Electronics", "description": "Gadgets, devices, and tech accessories."},
    {"name": "Fashion", "description": "Clothing, shoes, and accessories for all styles."},
    {"name": "Home & Garden", "description": "Everything for your home and outdoor spaces."},
    {"name": "Sports & Fitness", "description": "Equipment and gear for an active lifestyle."},
    {"name": "Books", "description": "Fiction, non-fiction, and educational titles."},
    {"name": "Beauty & Health", "description": "Skincare, wellness, and personal care products."},
]

PRODUCTS = [
    # ── Electronics ──────────────────────────────────────────────────────────
    {
        "name": "Wireless Bluetooth Headphones",
        "category": "Electronics",
        "price": Decimal("89.99"),
        "stock_quantity": 50,
        "description": "Premium noise-cancelling headphones with 30-hour battery life and foldable design.",
    },
    {
        "name": "Mechanical Gaming Keyboard",
        "category": "Electronics",
        "price": Decimal("109.00"),
        "stock_quantity": 35,
        "description": "RGB backlit mechanical keyboard with blue switches and N-key rollover.",
    },
    {
        "name": "4K Webcam Pro",
        "category": "Electronics",
        "price": Decimal("149.99"),
        "stock_quantity": 20,
        "description": "Ultra HD webcam with built-in ring light and auto-focus for streaming and video calls.",
    },
    {
        "name": "Smart Watch Series X",
        "category": "Electronics",
        "price": Decimal("199.00"),
        "stock_quantity": 40,
        "description": "Heart rate monitor, GPS, sleep tracking, and 5-day battery in a slim aluminium case.",
    },
    {
        "name": "Portable Bluetooth Speaker",
        "category": "Electronics",
        "price": Decimal("59.99"),
        "stock_quantity": 60,
        "description": "Waterproof 360° sound speaker with 12-hour playtime and USB-C charging.",
    },
    # ── Fashion ───────────────────────────────────────────────────────────────
    {
        "name": "Classic Leather Sneakers",
        "category": "Fashion",
        "price": Decimal("79.95"),
        "stock_quantity": 80,
        "description": "Minimalist white leather sneakers with cushioned insole — fits true to size.",
    },
    {
        "name": "Premium Denim Jacket",
        "category": "Fashion",
        "price": Decimal("64.99"),
        "stock_quantity": 45,
        "description": "Washed denim jacket with two chest pockets and a relaxed vintage fit.",
    },
    {
        "name": "Leather Crossbody Bag",
        "category": "Fashion",
        "price": Decimal("54.50"),
        "stock_quantity": 30,
        "description": "Genuine leather bag with adjustable strap, zip closure, and two inner pockets.",
    },
    {
        "name": "Running Shoes Ultra",
        "category": "Fashion",
        "price": Decimal("124.00"),
        "stock_quantity": 55,
        "description": "Lightweight road-running shoes with responsive foam midsole and breathable mesh upper.",
    },
    # ── Home & Garden ─────────────────────────────────────────────────────────
    {
        "name": "Pour-Over Coffee Maker",
        "category": "Home & Garden",
        "price": Decimal("39.99"),
        "stock_quantity": 70,
        "description": "Borosilicate glass pour-over with stainless steel filter and wooden handle collar.",
    },
    {
        "name": "Ceramic Table Lamp",
        "category": "Home & Garden",
        "price": Decimal("49.00"),
        "stock_quantity": 25,
        "description": "Hand-painted ceramic base with linen shade — warm 3000K colour temperature.",
    },
    {
        "name": "Bamboo Cutting Board Set",
        "category": "Home & Garden",
        "price": Decimal("29.95"),
        "stock_quantity": 90,
        "description": "Set of 3 FSC-certified bamboo boards with juice groove and non-slip feet.",
    },
    {
        "name": "Indoor Plant Pot Collection",
        "category": "Home & Garden",
        "price": Decimal("34.99"),
        "stock_quantity": 60,
        "description": "Set of 5 matte ceramic pots in graduating sizes — drainage hole included.",
    },
    # ── Sports & Fitness ──────────────────────────────────────────────────────
    {
        "name": "Yoga Mat Premium",
        "category": "Sports & Fitness",
        "price": Decimal("45.00"),
        "stock_quantity": 100,
        "description": "6mm thick non-slip TPE yoga mat with alignment lines and carrying strap.",
    },
    {
        "name": "Adjustable Dumbbell Set",
        "category": "Sports & Fitness",
        "price": Decimal("189.99"),
        "stock_quantity": 15,
        "description": "Space-saving 5–52.5 lb adjustable dumbbells with quick-lock dial system.",
    },
    {
        "name": "Resistance Bands Kit",
        "category": "Sports & Fitness",
        "price": Decimal("24.99"),
        "stock_quantity": 120,
        "description": "5-band set (10–50 lbs) with handles, ankle straps, and door anchor.",
    },
    # ── Books ─────────────────────────────────────────────────────────────────
    {
        "name": "Clean Code — Robert C. Martin",
        "category": "Books",
        "price": Decimal("34.99"),
        "stock_quantity": 40,
        "description": "A handbook of agile software craftsmanship covering naming, functions, and refactoring.",
    },
    {
        "name": "The Pragmatic Programmer",
        "category": "Books",
        "price": Decimal("39.95"),
        "stock_quantity": 35,
        "description": "20th anniversary edition covering career tips, testing, and DRY principles.",
    },
    # ── Beauty & Health ───────────────────────────────────────────────────────
    {
        "name": "Vitamin C Serum 20%",
        "category": "Beauty & Health",
        "price": Decimal("22.99"),
        "stock_quantity": 150,
        "description": "Brightening vitamin C + hyaluronic acid serum for all skin types — 30 ml.",
    },
    {
        "name": "Electric Sonic Toothbrush",
        "category": "Beauty & Health",
        "price": Decimal("49.99"),
        "stock_quantity": 60,
        "description": "31,000 strokes/min with 5 cleaning modes, 2-min timer, and 4-week battery.",
    },
    {
        "name": "Aromatherapy Diffuser",
        "category": "Beauty & Health",
        "price": Decimal("35.00"),
        "stock_quantity": 45,
        "description": "300 ml ultrasonic diffuser with 7-colour LED and auto shut-off — runs 8 hours.",
    },
    {
        "name": "Wireless Ergonomic Mouse",
        "category": "Electronics",
        "price": Decimal("44.99"),
        "stock_quantity": 75,
        "description": "Vertical ergonomic design with silent clicks, 2.4 GHz dongle, and 6-month battery.",
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample categories and products."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing products and categories before seeding.",
        )

    def handle(self, *args, **options) -> None:
        if options["clear"]:
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared all products and categories."))

        # ── Categories ────────────────────────────────────────────────────────
        cat_map: dict[str, Category] = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "slug": slugify(cat_data["name"]),
                    "description": cat_data["description"],
                    "is_active": True,
                },
            )
            cat_map[cat.name] = cat
            status = "created" if created else "already exists"
            self.stdout.write(f"  Category '{cat.name}' — {status}")

        # ── Products ──────────────────────────────────────────────────────────
        created_count = 0
        skipped_count = 0
        for p_data in PRODUCTS:
            category = cat_map.get(p_data["category"])
            _, created = Product.objects.get_or_create(
                name=p_data["name"],
                defaults={
                    "slug": slugify(p_data["name"]),
                    "description": p_data["description"],
                    "price": p_data["price"],
                    "stock_quantity": p_data["stock_quantity"],
                    "category": category,
                    "is_active": True,
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  Product '{p_data['name']}' — created")
            else:
                skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_count} product(s) created, {skipped_count} already existed."
            )
        )
