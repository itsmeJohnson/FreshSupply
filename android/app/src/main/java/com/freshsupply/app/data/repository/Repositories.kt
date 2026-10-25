package com.freshsupply.app.data.repository

import com.freshsupply.app.data.local.*
import com.freshsupply.app.data.model.*
import com.freshsupply.app.data.remote.FreshSupplyApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class AuthRepository(
    private val api: FreshSupplyApiService,
    private val prefs: UserPreferences
) {
    val isLoggedIn: Flow<Boolean> = prefs.authToken.map { !it.isNullOrEmpty() }
    val businessName: Flow<String?> = prefs.businessName

    suspend fun login(email: String, pass: String): Result<Customer> {
        return try {
            val res = api.login(LoginRequest(email.trim(), pass))
            if (res.success && res.data != null) {
                prefs.saveAuth(
                    token = res.data.token,
                    customerId = res.data.customer.id,
                    businessName = res.data.customer.businessName,
                    email = res.data.customer.email
                )
                Result.success(res.data.customer)
            } else {
                Result.failure(Exception(res.error ?: "Authentication failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        email: String,
        pass: String,
        businessName: String,
        contactPerson: String,
        phone: String,
        gstNumber: String?
    ): Result<Customer> {
        return try {
            val req = RegisterRequest(
                email = email.trim(),
                password = pass,
                businessName = businessName.trim(),
                contactPerson = contactPerson.trim(),
                phone = phone.trim(),
                gstNumber = gstNumber?.trim()
            )
            val res = api.register(req)
            if (res.success && res.data != null) {
                prefs.saveAuth(
                    token = res.data.token,
                    customerId = res.data.customer.id,
                    businessName = res.data.customer.businessName,
                    email = res.data.customer.email
                )
                Result.success(res.data.customer)
            } else {
                Result.failure(Exception(res.error ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        prefs.clear()
    }
}

class ProductRepository(
    private val api: FreshSupplyApiService,
    private val db: FreshSupplyDatabase
) {
    val cachedProducts: Flow<List<Product>> = db.productDao().getAllProducts().map { list ->
        list.map { it.toDomain() }
    }

    val cachedCategories: Flow<List<Category>> = db.categoryDao().getAllCategories().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun syncCategories(): Result<List<Category>> {
        return try {
            val res = api.getCategories()
            if (res.success && res.data != null) {
                db.categoryDao().clearCategories()
                db.categoryDao().insertCategories(res.data.map { CategoryEntity.fromDomain(it) })
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Failed to fetch categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun syncProducts(
        category: String? = null,
        search: String? = null,
        featured: Boolean = false
    ): Result<List<Product>> {
        return try {
            val res = api.getProducts(
                category = category,
                search = search,
                featured = if (featured) "true" else null
            )
            if (res.success && res.data != null) {
                if (category == null && search.isNullOrEmpty()) {
                    db.productDao().insertProducts(res.data.map { ProductEntity.fromDomain(it) })
                }
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Failed to fetch products"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProductDetail(id: Int): Result<Product> {
        return try {
            val res = api.getProductDetail(id)
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Product not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class CartRepository(private val api: FreshSupplyApiService) {
    suspend fun getCart(): Result<CartData> {
        return try {
            val res = api.getCart()
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Failed to load cart"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateItem(productId: Int, quantity: Int): Result<Unit> {
        return try {
            if (quantity <= 0) {
                val res = api.removeFromCart(productId)
                if (res.success) Result.success(Unit) else Result.failure(Exception(res.error))
            } else {
                val res = api.addToCart(AddToCartRequest(productId, quantity))
                if (res.success) Result.success(Unit) else Result.failure(Exception(res.error))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun clearCart(): Result<Unit> {
        return try {
            val res = api.clearCart()
            if (res.success) Result.success(Unit) else Result.failure(Exception(res.error))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class OrderRepository(private val api: FreshSupplyApiService) {
    suspend fun getAddresses(): Result<List<Address>> {
        return try {
            val res = api.getAddresses()
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Failed to load addresses"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addAddress(address: Address): Result<Address> {
        return try {
            val res = api.addAddress(address)
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Failed to add address"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun placeOrder(req: CreateOrderRequest): Result<Order> {
        return try {
            val res = api.createOrder(req)
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Order submission rejected by server"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getOrders(status: String? = null): Result<List<Order>> {
        return try {
            val res = api.getOrders(status)
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Failed to fetch orders"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getOrderDetail(id: Int): Result<OrderDetail> {
        return try {
            val res = api.getOrderDetail(id)
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Order not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun cancelOrder(id: Int, reason: String): Result<Order> {
        return try {
            val res = api.cancelOrder(id, mapOf("reason" to reason))
            if (res.success && res.data != null) {
                Result.success(res.data)
            } else {
                Result.failure(Exception(res.error ?: "Cancellation rejected by policy"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
