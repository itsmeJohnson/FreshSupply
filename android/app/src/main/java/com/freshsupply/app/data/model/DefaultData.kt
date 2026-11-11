package com.freshsupply.app.data.model

object DefaultData {
    val categories = listOf(
        Category(
            id = 1,
            name = "Fresh Vegetables & Greens",
            slug = "vegetables-greens",
            description = "Farm-direct sorted vegetables, root produce, and fresh leafy culinary greens.",
            imageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600",
            sortOrder = 1,
            productCount = "5"
        ),
        Category(
            id = 2,
            name = "Bulk Grains & Rice",
            slug = "grains-rice",
            description = "Aged basmati rice, raw sona masoori, and commercial flours in 25kg & 50kg bags.",
            imageUrl = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
            sortOrder = 2,
            productCount = "2"
        ),
        Category(
            id = 3,
            name = "Lentils & Pulses",
            slug = "pulses-lentils",
            description = "Unpolished protein-rich toor, moong, and urad dals for commercial catering.",
            imageUrl = "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600",
            sortOrder = 3,
            productCount = "2"
        ),
        Category(
            id = 4,
            name = "Cooking Oils & Ghee",
            slug = "cooking-oils",
            description = "High-smoke point cooking oils in 15-litre bulk commercial tins and cans.",
            imageUrl = "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600",
            sortOrder = 4,
            productCount = "2"
        ),
        Category(
            id = 5,
            name = "Whole & Ground Spices",
            slug = "commercial-spices",
            description = "Direct-source high-aroma whole chillies, turmeric, cumin, and master garam masala blends.",
            imageUrl = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
            sortOrder = 5,
            productCount = "1"
        ),
        Category(
            id = 6,
            name = "Commercial Packaging",
            slug = "packaging-supplies",
            description = "Virgin kraft takeaway bags, delivery containers, and moisture-barrier food liners.",
            imageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
            sortOrder = 6,
            productCount = "1"
        )
    )

    val products = listOf(
        Product(
            id = 1,
            sku = "VEG-TOM-HYB",
            name = "Tomato (Hybrid Grade-A)",
            description = "Uniform red, firm ripe commercial tomatoes. Ideal for purées, gravies, and fresh slicing.",
            categoryId = 1,
            categoryName = "Fresh Vegetables & Greens",
            imageUrl = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
            unit = "Kg",
            packSize = "25 Kg Plastic Crate",
            minOrderQty = 25,
            price = 38.00,
            stockQuantity = 1450,
            isActive = true,
            isFeatured = true
        ),
        Product(
            id = 2,
            sku = "VEG-ONI-NSK",
            name = "Premium Grade-A Red Onions",
            description = "Export-grade dry-cured red onions with high pungent solids. 55mm to 65mm calibrated diameter.",
            categoryId = 1,
            categoryName = "Fresh Vegetables & Greens",
            imageUrl = "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600",
            unit = "Kg",
            packSize = "50 Kg Mesh Bag",
            minOrderQty = 50,
            price = 22.00,
            stockQuantity = 3200,
            isActive = true,
            isFeatured = true
        ),
        Product(
            id = 3,
            sku = "VEG-POT-HSN",
            name = "Potato (Hassan Jyoti Fresh)",
            description = "Low-sugar sorting for restaurant deep frying and curry production. Free of green spots.",
            categoryId = 1,
            categoryName = "Fresh Vegetables & Greens",
            imageUrl = "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600",
            unit = "Kg",
            packSize = "50 Kg Jute Gunny Bag",
            minOrderQty = 50,
            price = 26.00,
            stockQuantity = 2800,
            isActive = true,
            isFeatured = true
        ),
        Product(
            id = 4,
            sku = "VEG-CAR-OTY",
            name = "Ooty Fresh Orange Carrots",
            description = "Crisp, sweet, washed whole table carrots. Sorted for culinary processing.",
            categoryId = 1,
            categoryName = "Fresh Vegetables & Greens",
            imageUrl = "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600",
            unit = "Kg",
            packSize = "15 Kg Crate",
            minOrderQty = 15,
            price = 42.00,
            stockQuantity = 650,
            isActive = true,
            isFeatured = true
        ),
        Product(
            id = 5,
            sku = "VEG-CUC-ENG",
            name = "English Greenhouse Seedless Cucumbers",
            description = "Uniform straight cucumbers with thin tender skin. Hydroponic greenhouse grown.",
            categoryId = 1,
            categoryName = "Fresh Vegetables & Greens",
            imageUrl = "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600",
            unit = "Kg",
            packSize = "20 Kg Corrugated Box",
            minOrderQty = 20,
            price = 32.00,
            stockQuantity = 480,
            isActive = true,
            isFeatured = false
        ),
        Product(
            id = 6,
            sku = "GRN-RICE-1121",
            name = "Classic Basmati Rice (1121 Sella)",
            description = "Double-polished aged aromatic 1121 sella basmati with 8.4mm average uncooked grain length.",
            categoryId = 2,
            categoryName = "Bulk Grains & Rice",
            imageUrl = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
            unit = "Bag",
            packSize = "25 Kg Non-Woven Bag",
            minOrderQty = 2,
            price = 2450.00,
            stockQuantity = 350,
            isActive = true,
            isFeatured = true
        ),
        Product(
            id = 7,
            sku = "PLS-TOOR-DES",
            name = "Premium Desi Toor Dal (Polished)",
            description = "A-Grade machine cleaned pigeon pea split lentils. Fast cooking with rich aroma.",
            categoryId = 3,
            categoryName = "Lentils & Pulses",
            imageUrl = "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600",
            unit = "Bag",
            packSize = "25 Kg Bag",
            minOrderQty = 1,
            price = 3850.00,
            stockQuantity = 260,
            isActive = true,
            isFeatured = true
        ),
        Product(
            id = 8,
            sku = "OIL-SUN-15L",
            name = "Refined Sunflower Cooking Oil",
            description = "Triple-refined clear edible cooking oil enriched with Vitamins A & D.",
            categoryId = 4,
            categoryName = "Cooking Oils & Ghee",
            imageUrl = "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600",
            unit = "Tin",
            packSize = "15 Litre Metal Tin",
            minOrderQty = 2,
            price = 1680.00,
            stockQuantity = 210,
            isActive = true,
            isFeatured = true
        )
    )

    val addresses = listOf(
        Address(
            id = 1,
            customerId = 1,
            label = "Main Kitchen / Receiving Bay",
            addressLine1 = "42, Brigade Road, Commercial Hub",
            addressLine2 = "Ground Floor Goods Entrance",
            landmark = "Opposite Metro Station",
            city = "Bangalore",
            state = "Karnataka",
            postalCode = "560025",
            isDefault = true,
            contactPhone = "+91 98450 12345"
        )
    )

    val orders = listOf(
        Order(
            id = 101,
            orderNumber = "FS-ORD-2026-8491",
            customerId = 1,
            contactPerson = "Chef Vikram Sen",
            contactPhone = "+91 98450 12345",
            poReference = "PO-TB-8491",
            deliveryDate = "2026-11-12",
            deliverySlot = "Early Morning (05:00 AM - 08:00 AM)",
            subtotal = 14142.85,
            taxAmount = 707.15,
            deliveryCharge = 0.0,
            totalAmount = 14850.00,
            status = "in_transit",
            createdAt = "2026-11-11T04:30:00Z",
            itemCount = 4
        ),
        Order(
            id = 100,
            orderNumber = "FS-ORD-2026-8314",
            customerId = 1,
            contactPerson = "Chef Vikram Sen",
            contactPhone = "+91 98450 12345",
            poReference = "PO-TB-8314",
            deliveryDate = "2026-11-08",
            deliverySlot = "Early Morning (05:00 AM - 08:00 AM)",
            subtotal = 27047.62,
            taxAmount = 1352.38,
            deliveryCharge = 0.0,
            totalAmount = 28400.00,
            status = "delivered",
            createdAt = "2026-11-08T05:00:00Z",
            itemCount = 2
        )
    )

    fun filterProducts(categorySlug: String?, search: String?, featured: Boolean): List<Product> {
        var list = products
        if (categorySlug != null) {
            val cat = categories.find { it.slug == categorySlug }
            if (cat != null) {
                list = list.filter { it.categoryId == cat.id }
            }
        }
        if (featured) {
            list = list.filter { it.isFeatured }
        }
        if (!search.isNullOrBlank()) {
            val q = search.trim().lowercase()
            list = list.filter {
                it.name.lowercase().contains(q) || it.sku.lowercase().contains(q)
            }
        }
        return list
    }
}
