"""
Management command: seed the database with categories, products, images, and banners.

Usage:
    python manage.py seed_data            # add missing records only (safe to re-run)
    python manage.py seed_data --clear    # delete everything first
    python manage.py seed_data --no-images  # skip image downloads (faster)
"""

import urllib.request
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.banners.models import Banner
from apps.categories.models import Category
from apps.products.models import Product, ProductImage

# ── Banner seeds ─────────────────────────────────────────────────────────────
# Each tuple: (picsum_seed, title, subtitle)
BANNER_SEEDS = [
    (
        "electronics-banner",
        "Next-Gen Tech, Delivered",
        "Explore the latest gadgets, headphones, and smart devices — all with free shipping.",
    ),
    (
        "fashion-banner",
        "Style That Speaks",
        "Premium fashion and footwear curated for every season and occasion.",
    ),
    (
        "home-decor-banner",
        "Transform Your Space",
        "Discover home goods, lighting, and decor that make every room feel intentional.",
    ),
    (
        "fitness-banner",
        "Level Up Your Fitness",
        "High-performance gear and equipment to fuel your training every day.",
    ),
]

# ── Product image seeds ───────────────────────────────────────────────────────
# Each list: [primary_seed, gallery_1, gallery_2, gallery_3, gallery_4]
PRODUCT_IMAGE_SEEDS: dict[str, list[str]] = {
    "Wireless Bluetooth Headphones": [
        "headphones-1", "headphones-2", "headphones-3", "headphones-4", "audio-tech-5"
    ],
    "Mechanical Gaming Keyboard": [
        "keyboard-1", "keyboard-2", "keyboard-3", "gaming-desk-4", "tech-rgb-5"
    ],
    "4K Webcam Pro": [
        "webcam-1", "camera-2", "webcam-3", "streaming-4", "tech-setup-5"
    ],
    "Smart Watch Series X": [
        "watch-1", "watch-2", "watch-3", "wearable-4", "smartwatch-5"
    ],
    "Portable Bluetooth Speaker": [
        "speaker-1", "speaker-2", "audio-3", "outdoor-speaker-4", "music-5"
    ],
    "Wireless Ergonomic Mouse": [
        "mouse-1", "desk-2", "tech-3", "ergonomic-4", "workspace-5"
    ],
    "USB-C Hub Pro": [
        "hub-1", "cables-2", "tech-4", "accessories-5", "laptop-setup-6"
    ],
    "Classic Leather Sneakers": [
        "shoes-1", "sneakers-2", "fashion-3", "shoes-detail-4", "lifestyle-shoes-5"
    ],
    "Premium Denim Jacket": [
        "jacket-1", "denim-2", "fashion-4", "jacket-detail-3", "style-outdoor-5"
    ],
    "Leather Crossbody Bag": [
        "bag-1", "handbag-2", "fashion-5", "bag-detail-3", "leather-close-4"
    ],
    "Running Shoes Ultra": [
        "running-1", "athletic-2", "shoes-3", "run-track-4", "sport-shoes-5"
    ],
    "Merino Wool Sweater": [
        "sweater-1", "knit-2", "fashion-6", "wool-close-3", "cozy-style-4"
    ],
    "Canvas Tote Bag": [
        "tote-1", "canvas-2", "bag-3", "market-tote-4", "eco-bag-5"
    ],
    "Pour-Over Coffee Maker": [
        "coffee-1", "brew-2", "kitchen-3", "pour-over-4", "cafe-home-5"
    ],
    "Ceramic Table Lamp": [
        "lamp-1", "lighting-2", "home-3", "lamp-close-4", "interior-light-5"
    ],
    "Bamboo Cutting Board Set": [
        "kitchen-1", "bamboo-2", "cooking-3", "board-detail-4", "kitchen-prep-5"
    ],
    "Indoor Plant Pot Collection": [
        "plants-1", "pots-2", "garden-3", "plant-detail-4", "indoor-green-5"
    ],
    "Scented Soy Candle Set": [
        "candle-1", "candles-2", "home-4", "candle-close-3", "cozy-home-5"
    ],
    "Minimalist Wall Clock": [
        "clock-1", "decor-2", "home-5", "clock-detail-3", "minimal-wall-4"
    ],
    "Yoga Mat Premium": [
        "yoga-1", "fitness-2", "mat-3", "yoga-pose-4", "exercise-floor-5"
    ],
    "Adjustable Dumbbell Set": [
        "dumbbells-1", "gym-2", "fitness-3", "weights-4", "home-gym-5"
    ],
    "Resistance Bands Kit": [
        "bands-1", "workout-2", "fitness-4", "bands-stretch-3", "resistance-use-5"
    ],
    "Foam Roller Pro": [
        "foam-1", "recovery-2", "sports-3", "foam-use-4", "stretching-5"
    ],
    "Stainless Steel Water Bottle": [
        "bottle-1", "hydration-2", "sports-4", "bottle-close-3", "outdoors-water-5"
    ],
    "Clean Code — Robert C. Martin": [
        "book-1", "coding-2", "read-3", "desk-book-4", "dev-shelf-5"
    ],
    "The Pragmatic Programmer": [
        "book-2", "programming-2", "read-4", "library-desk-3", "code-book-5"
    ],
    "Atomic Habits": [
        "book-3", "habit-2", "self-3", "productivity-desk-4", "reading-nook-5"
    ],
    "Vitamin C Serum 20%": [
        "serum-1", "skincare-2", "beauty-3", "serum-bottle-4", "skincare-flat-5"
    ],
    "Electric Sonic Toothbrush": [
        "brush-1", "dental-2", "health-3", "toothbrush-4", "bathroom-5"
    ],
    "Aromatherapy Diffuser": [
        "diffuser-1", "aroma-2", "wellness-3", "diffuser-mist-4", "relax-home-5"
    ],
}

CATEGORIES = [
    {"name": "Electronics", "description": "Gadgets, devices, and tech accessories."},
    {"name": "Fashion", "description": "Clothing, shoes, and accessories for all styles."},
    {"name": "Home & Garden", "description": "Everything for your home and outdoor spaces."},
    {"name": "Sports & Fitness", "description": "Equipment and gear for an active lifestyle."},
    {"name": "Books", "description": "Fiction, non-fiction, and educational titles."},
    {"name": "Beauty & Health", "description": "Skincare, wellness, and personal care products."},
]

PRODUCTS = [
    # ── Electronics (7) ──────────────────────────────────────────────────────
    {
        "name": "Wireless Bluetooth Headphones",
        "category": "Electronics",
        "price": Decimal("89.99"),
        "stock_quantity": 50,
        "description": "Premium noise-cancelling headphones with 30-hour battery life, foldable design, and deep bass. Works with iPhone and Android. Includes carrying case.",
    },
    {
        "name": "Mechanical Gaming Keyboard",
        "category": "Electronics",
        "price": Decimal("109.00"),
        "stock_quantity": 35,
        "description": "RGB backlit mechanical keyboard with tactile blue switches, N-key rollover, and aluminium top plate. Satisfying click every keystroke.",
    },
    {
        "name": "4K Webcam Pro",
        "category": "Electronics",
        "price": Decimal("149.99"),
        "stock_quantity": 20,
        "description": "Ultra HD 4K webcam with built-in ring light, dual microphone, and auto-focus. Perfect for streaming, video calls, and content creation.",
    },
    {
        "name": "Smart Watch Series X",
        "category": "Electronics",
        "price": Decimal("199.00"),
        "stock_quantity": 40,
        "description": "Heart rate monitor, built-in GPS, sleep tracking, and 5-day battery in a slim aluminium case. Water resistant to 50m.",
    },
    {
        "name": "Portable Bluetooth Speaker",
        "category": "Electronics",
        "price": Decimal("59.99"),
        "stock_quantity": 60,
        "description": "360 degree surround sound speaker with IP67 waterproof rating, 12-hour playtime, and USB-C fast charging. Drop-proof too.",
    },
    {
        "name": "Wireless Ergonomic Mouse",
        "category": "Electronics",
        "price": Decimal("44.99"),
        "stock_quantity": 75,
        "description": "Vertical ergonomic design reduces wrist strain by 57%. Silent click, 2.4 GHz wireless, and up to 6-month battery life.",
    },
    {
        "name": "USB-C Hub Pro",
        "category": "Electronics",
        "price": Decimal("49.99"),
        "stock_quantity": 90,
        "description": "7-in-1 USB-C hub with 4K HDMI, 100W PD charging, 3x USB-A 3.0, SD & microSD card readers. Slim aluminium shell.",
    },
    # ── Fashion (6) ──────────────────────────────────────────────────────────
    {
        "name": "Classic Leather Sneakers",
        "category": "Fashion",
        "price": Decimal("79.95"),
        "stock_quantity": 80,
        "description": "Minimalist white leather sneakers with memory foam insole and durable rubber sole. Pairs with everything — fits true to size.",
    },
    {
        "name": "Premium Denim Jacket",
        "category": "Fashion",
        "price": Decimal("64.99"),
        "stock_quantity": 45,
        "description": "Lightly washed denim jacket with two chest pockets, adjustable cuffs, and a relaxed vintage fit. 100% cotton denim.",
    },
    {
        "name": "Leather Crossbody Bag",
        "category": "Fashion",
        "price": Decimal("54.50"),
        "stock_quantity": 30,
        "description": "Full-grain genuine leather bag with adjustable strap, YKK zip closure, and two interior pockets. Aged brown or black.",
    },
    {
        "name": "Running Shoes Ultra",
        "category": "Fashion",
        "price": Decimal("124.00"),
        "stock_quantity": 55,
        "description": "Lightweight road-running shoes with responsive foam midsole, breathable mesh upper, and heel crash pad. Drop 8 mm.",
    },
    {
        "name": "Merino Wool Sweater",
        "category": "Fashion",
        "price": Decimal("89.00"),
        "stock_quantity": 40,
        "description": "100% extra-fine merino wool crewneck sweater. Naturally temperature-regulating, odour-resistant, and machine washable.",
    },
    {
        "name": "Canvas Tote Bag",
        "category": "Fashion",
        "price": Decimal("24.99"),
        "stock_quantity": 120,
        "description": "Heavy-duty 12 oz canvas tote with reinforced handles, inside zip pocket, and a capacity of 25 litres. Great for groceries or commuting.",
    },
    # ── Home & Garden (6) ────────────────────────────────────────────────────
    {
        "name": "Pour-Over Coffee Maker",
        "category": "Home & Garden",
        "price": Decimal("39.99"),
        "stock_quantity": 70,
        "description": "Borosilicate glass pour-over with permanent stainless steel filter and heat-resistant wooden collar. Makes 600 ml per brew.",
    },
    {
        "name": "Ceramic Table Lamp",
        "category": "Home & Garden",
        "price": Decimal("49.00"),
        "stock_quantity": 25,
        "description": "Hand-thrown ceramic base with a hand-stitched linen shade. Warm 3000K bulb included. Perfect bedside or desk lamp.",
    },
    {
        "name": "Bamboo Cutting Board Set",
        "category": "Home & Garden",
        "price": Decimal("29.95"),
        "stock_quantity": 90,
        "description": "Set of 3 FSC-certified organic bamboo boards in S/M/L. Juice groove on large board, non-slip rubber feet on all.",
    },
    {
        "name": "Indoor Plant Pot Collection",
        "category": "Home & Garden",
        "price": Decimal("34.99"),
        "stock_quantity": 60,
        "description": "Set of 5 matte terracotta-glaze ceramic pots in graduating sizes (6-14 cm). Each has a drainage hole and matching saucer.",
    },
    {
        "name": "Scented Soy Candle Set",
        "category": "Home & Garden",
        "price": Decimal("32.00"),
        "stock_quantity": 85,
        "description": "Set of 4 hand-poured soy wax candles: Vanilla & Sandalwood, Fresh Linen, Eucalyptus Mint, and Amber. 40-hour burn time each.",
    },
    {
        "name": "Minimalist Wall Clock",
        "category": "Home & Garden",
        "price": Decimal("27.99"),
        "stock_quantity": 50,
        "description": "30 cm silent sweep wall clock with a solid walnut frame and white dial. No ticking — battery included.",
    },
    # ── Sports & Fitness (5) ─────────────────────────────────────────────────
    {
        "name": "Yoga Mat Premium",
        "category": "Sports & Fitness",
        "price": Decimal("45.00"),
        "stock_quantity": 100,
        "description": "6mm thick non-slip TPE yoga mat with printed alignment lines, textured surface on both sides, and a carrying strap. 183 x 61 cm.",
    },
    {
        "name": "Adjustable Dumbbell Set",
        "category": "Sports & Fitness",
        "price": Decimal("189.99"),
        "stock_quantity": 15,
        "description": "Space-saving 5-52.5 lb adjustable dumbbells with easy quick-lock dial system. Replaces 15 pairs of dumbbells.",
    },
    {
        "name": "Resistance Bands Kit",
        "category": "Sports & Fitness",
        "price": Decimal("24.99"),
        "stock_quantity": 120,
        "description": "5-band set ranging 10-50 lbs with padded handles, ankle straps, and a door anchor. Great for home gym workouts.",
    },
    {
        "name": "Foam Roller Pro",
        "category": "Sports & Fitness",
        "price": Decimal("28.00"),
        "stock_quantity": 80,
        "description": "High-density EPP foam roller with tri-zone textured surface for targeted myofascial release and deep tissue massage.",
    },
    {
        "name": "Stainless Steel Water Bottle",
        "category": "Sports & Fitness",
        "price": Decimal("34.99"),
        "stock_quantity": 150,
        "description": "32 oz double-wall vacuum insulated bottle — keeps drinks cold 24 hrs or hot 12 hrs. Leakproof lid, BPA-free.",
    },
    # ── Books (3) ────────────────────────────────────────────────────────────
    {
        "name": "Clean Code — Robert C. Martin",
        "category": "Books",
        "price": Decimal("34.99"),
        "stock_quantity": 40,
        "description": "A handbook of agile software craftsmanship. Covers naming, functions, comments, formatting, and refactoring. Essential for every developer.",
    },
    {
        "name": "The Pragmatic Programmer",
        "category": "Books",
        "price": Decimal("39.95"),
        "stock_quantity": 35,
        "description": "20th anniversary edition. Packed with practical advice on career, testing, DRY principles, tracer bullets, and more.",
    },
    {
        "name": "Atomic Habits",
        "category": "Books",
        "price": Decimal("18.99"),
        "stock_quantity": 70,
        "description": "James Clear's #1 NYT bestseller on building good habits and breaking bad ones using tiny daily improvements.",
    },
    # ── Beauty & Health (3) ──────────────────────────────────────────────────
    {
        "name": "Vitamin C Serum 20%",
        "category": "Beauty & Health",
        "price": Decimal("22.99"),
        "stock_quantity": 150,
        "description": "Stabilised 20% L-ascorbic acid with hyaluronic acid and vitamin E. Brightens skin, fades dark spots, boosts collagen. 30 ml.",
    },
    {
        "name": "Electric Sonic Toothbrush",
        "category": "Beauty & Health",
        "price": Decimal("49.99"),
        "stock_quantity": 60,
        "description": "31,000 brush strokes per minute with 5 cleaning modes, 2-minute smart timer, and 4-week battery life. Dentist-recommended.",
    },
    {
        "name": "Aromatherapy Diffuser",
        "category": "Beauty & Health",
        "price": Decimal("35.00"),
        "stock_quantity": 45,
        "description": "300 ml ultrasonic cool-mist diffuser with 7-colour ambient LED, 3 mist modes, and auto shut-off. Runs up to 8 hours.",
    },
]


def _download_image(seed: str, width: int = 800, height: int = 600) -> bytes | None:
    url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read()
    except Exception:
        return None


class Command(BaseCommand):
    help = "Seed the database with 30 sample products (5 images each), categories, and 4 banners."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing records before seeding.",
        )
        parser.add_argument(
            "--no-images",
            action="store_true",
            help="Skip downloading images (faster, records will have no image).",
        )

    def handle(self, *args, **options) -> None:
        skip_images: bool = options["no_images"]

        if options["clear"]:
            Banner.objects.all().delete()
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(
                self.style.WARNING("Cleared banners, products, images, and categories.")
            )

        # ── Categories ────────────────────────────────────────────────────────
        cat_map: dict[str, Category] = {}
        self.stdout.write("\n--- Categories ---")
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
            label = "created" if created else "exists"
            self.stdout.write(f"  [{label}] {cat.name}")

        # ── Products ──────────────────────────────────────────────────────────
        self.stdout.write("\n--- Products ---")
        created_count = 0
        skipped_count = 0

        for p_data in PRODUCTS:
            category = cat_map.get(p_data["category"])
            product, created = Product.objects.get_or_create(
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

            if not created:
                skipped_count += 1
                self.stdout.write(f"  [skip]    {p_data['name']}")
                continue

            created_count += 1

            if skip_images:
                self.stdout.write(f"  [created] {p_data['name']} (no images)")
                continue

            seeds = PRODUCT_IMAGE_SEEDS.get(p_data["name"], [slugify(p_data["name"])])
            slug = slugify(p_data["name"])

            # Primary image
            primary_bytes = _download_image(seeds[0])
            if primary_bytes:
                product.image.save(f"{slug}.jpg", ContentFile(primary_bytes), save=True)

            # Gallery images (seeds[1:] = up to 4 extra images)
            for i, seed in enumerate(seeds[1:], start=1):
                img_bytes = _download_image(seed)
                if img_bytes:
                    img = ProductImage(product=product, order=i)
                    img.image.save(
                        f"{slug}-gallery-{i}.jpg",
                        ContentFile(img_bytes),
                        save=True,
                    )

            gallery_count = len(seeds) - 1
            self.stdout.write(
                f"  [created] {p_data['name']} "
                f"(1 primary + {gallery_count} gallery images)"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nProducts: {created_count} created, {skipped_count} already existed."
            )
        )

        # ── Banners ───────────────────────────────────────────────────────────
        self.stdout.write("\n--- Banners ---")
        banner_count = 0

        for order, (seed, title, subtitle) in enumerate(BANNER_SEEDS, start=1):
            if Banner.objects.filter(title=title).exists():
                self.stdout.write(f"  [skip]    Banner: {title}")
                continue

            banner = Banner.objects.create(
                title=title,
                subtitle=subtitle,
                order=order,
                is_active=True,
            )

            if not skip_images:
                # Wide landscape format for hero slider
                img_bytes = _download_image(seed, width=1600, height=700)
                if img_bytes:
                    banner.image.save(f"banner-{order}.jpg", ContentFile(img_bytes), save=True)
                    self.stdout.write(f"  [created] Banner {order}: {title}")
                else:
                    self.stdout.write(
                        self.style.WARNING(f"  [created] Banner {order}: {title} (no image)")
                    )
            else:
                self.stdout.write(f"  [created] Banner {order}: {title} (no image)")

            banner_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Banners: {banner_count} created.\n")
        )
