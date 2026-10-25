package com.freshsupply.app.data.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val error: String? = null,
    val data: T? = null
)

data class Customer(
    val id: Int,
    val email: String,
    @SerializedName("business_name") val businessName: String,
    @SerializedName("contact_person") val contactPerson: String,
    val phone: String,
    @SerializedName("gst_number") val gstNumber: String? = null
)

data class Address(
    val id: Int = 0,
    @SerializedName("customer_id") val customerId: Int = 0,
    val label: String = "Kitchen / Receiving Bay",
    @SerializedName("address_line1") val addressLine1: String,
    @SerializedName("address_line2") val addressLine2: String? = null,
    val landmark: String? = null,
    val city: String = "Bangalore",
    val state: String = "Karnataka",
    @SerializedName("postal_code") val postalCode: String,
    @SerializedName("is_default") val isDefault: Boolean = false,
    @SerializedName("contact_phone") val contactPhone: String? = null
)

data class Category(
    val id: Int,
    val name: String,
    val slug: String,
    val description: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("sort_order") val sortOrder: Int = 0,
    @SerializedName("product_count") val productCount: String? = null
)

data class Product(
    val id: Int,
    val sku: String,
    val name: String,
    val description: String? = null,
    @SerializedName("category_id") val categoryId: Int,
    @SerializedName("category_name") val categoryName: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    val unit: String,
    @SerializedName("pack_size") val packSize: String,
    @SerializedName("min_order_qty") val minOrderQty: Int,
    val price: Double,
    @SerializedName("stock_quantity") val stockQuantity: Int,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("is_featured") val isFeatured: Boolean = false
)

data class CartItem(
    val id: Int = 0,
    @SerializedName("product_id") val productId: Int,
    val name: String,
    val sku: String,
    val unit: String,
    @SerializedName("pack_size") val packSize: String,
    @SerializedName("min_order_qty") val minOrderQty: Int,
    val price: Double,
    @SerializedName("stock_quantity") val stockQuantity: Int,
    @SerializedName("image_url") val imageUrl: String? = null,
    val quantity: Int,
    @SerializedName("line_total") val lineTotal: Double,
    @SerializedName("has_stock") val hasStock: Boolean = true,
    @SerializedName("meets_moq") val meetsMoq: Boolean = true
)

data class CartSummary(
    val itemCount: Int = 0,
    val subtotal: Double = 0.0,
    val taxAmount: Double = 0.0,
    val deliveryCharge: Double = 0.0,
    val totalAmount: Double = 0.0,
    val freeDeliveryThreshold: Double = 5000.0
)

data class CartData(
    val items: List<CartItem> = emptyList(),
    val summary: CartSummary = CartSummary()
)

data class Order(
    val id: Int,
    @SerializedName("order_number") val orderNumber: String,
    @SerializedName("customer_id") val customerId: Int,
    @SerializedName("contact_person") val contactPerson: String,
    @SerializedName("contact_phone") val contactPhone: String,
    @SerializedName("po_reference") val poReference: String? = null,
    @SerializedName("delivery_date") val deliveryDate: String,
    @SerializedName("delivery_slot") val deliverySlot: String,
    val subtotal: Double,
    @SerializedName("tax_amount") val taxAmount: Double,
    @SerializedName("delivery_charge") val deliveryCharge: Double,
    @SerializedName("total_amount") val totalAmount: Double,
    val status: String,
    @SerializedName("cancellation_reason") val cancellationReason: String? = null,
    val notes: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("item_count") val itemCount: Int = 0,
    @SerializedName("address_snapshot") val addressSnapshot: Address? = null
)

data class OrderItem(
    val id: Int,
    @SerializedName("product_id") val productId: Int,
    @SerializedName("product_name_snapshot") val productName: String,
    @SerializedName("sku_snapshot") val sku: String,
    @SerializedName("unit_snapshot") val unit: String,
    @SerializedName("pack_size_snapshot") val packSize: String,
    @SerializedName("unit_price") val unitPrice: Double,
    val quantity: Int,
    @SerializedName("line_total") val lineTotal: Double,
    @SerializedName("image_url") val imageUrl: String? = null
)

data class OrderStatusHistory(
    val id: Int,
    val status: String,
    val notes: String? = null,
    @SerializedName("updated_by_type") val updatedByType: String,
    @SerializedName("created_at") val createdAt: String
)

data class OrderDetail(
    val order: Order,
    val items: List<OrderItem>,
    val history: List<OrderStatusHistory>
)

// Request payloads
data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(
    val email: String,
    val password: String,
    val businessName: String,
    val contactPerson: String,
    val phone: String,
    val gstNumber: String? = null
)
data class AddToCartRequest(val productId: Int, val quantity: Int)
data class CreateOrderItemRequest(val productId: Int, val quantity: Int)
data class CreateOrderRequest(
    val deliveryAddressId: Int,
    val deliveryDate: String,
    val deliverySlot: String,
    val poReference: String? = null,
    val notes: String? = null,
    val items: List<CreateOrderItemRequest>
)
data class AuthData(val token: String, val customer: Customer)
