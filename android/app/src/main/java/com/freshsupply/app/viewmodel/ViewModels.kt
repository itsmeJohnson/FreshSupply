package com.freshsupply.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freshsupply.app.data.model.*
import com.freshsupply.app.data.repository.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate

// 1. Auth ViewModel
class AuthViewModel(private val authRepo: AuthRepository) : ViewModel() {
    val isLoggedIn: StateFlow<Boolean> = authRepo.isLoggedIn.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        false
    )

    val businessName: StateFlow<String?> = authRepo.businessName.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        null
    )

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun clearError() {
        _error.value = null
    }

    fun login(email: String, pass: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            val res = authRepo.login(email, pass)
            _loading.value = false
            res.onSuccess {
                onSuccess()
            }.onFailure {
                _error.value = it.message ?: "Login failed"
            }
        }
    }

    fun register(
        email: String,
        pass: String,
        businessName: String,
        contactPerson: String,
        phone: String,
        gstNumber: String?,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            val res = authRepo.register(email, pass, businessName, contactPerson, phone, gstNumber)
            _loading.value = false
            res.onSuccess {
                onSuccess()
            }.onFailure {
                _error.value = it.message ?: "Registration failed"
            }
        }
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            authRepo.logout()
            onLoggedOut()
        }
    }
}

// 2. Catalogue ViewModel
class CatalogueViewModel(private val productRepo: ProductRepository) : ViewModel() {
    val categories: StateFlow<List<Category>> = productRepo.cachedCategories.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    private val _featuredProducts = MutableStateFlow<List<Product>>(emptyList())
    val featuredProducts: StateFlow<List<Product>> = _featuredProducts.asStateFlow()

    private val _selectedCategorySlug = MutableStateFlow<String?>(null)
    val selectedCategorySlug: StateFlow<String?> = _selectedCategorySlug.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _selectedProduct = MutableStateFlow<Product?>(null)
    val selectedProduct: StateFlow<Product?> = _selectedProduct.asStateFlow()

    init {
        loadInitialData()
    }

    fun loadInitialData() {
        viewModelScope.launch {
            _loading.value = true
            productRepo.syncCategories()
            loadProducts()
            loadFeatured()
            _loading.value = false
        }
    }

    fun selectCategory(slug: String?) {
        _selectedCategorySlug.value = slug
        loadProducts()
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
        loadProducts()
    }

    fun loadProducts() {
        viewModelScope.launch {
            val res = productRepo.syncProducts(
                category = _selectedCategorySlug.value,
                search = _searchQuery.value.takeIf { it.isNotBlank() }
            )
            res.onSuccess {
                _products.value = it
            }
        }
    }

    private fun loadFeatured() {
        viewModelScope.launch {
            val res = productRepo.syncProducts(featured = true)
            res.onSuccess {
                _featuredProducts.value = it
            }
        }
    }

    fun openProductDetails(product: Product) {
        _selectedProduct.value = product
    }

    fun closeProductDetails() {
        _selectedProduct.value = null
    }
}

// 3. Cart ViewModel
class CartViewModel(
    private val cartRepo: CartRepository,
    private val orderRepo: OrderRepository
) : ViewModel() {
    private val _cartData = MutableStateFlow(CartData())
    val cartData: StateFlow<CartData> = _cartData.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _addresses = MutableStateFlow<List<Address>>(emptyList())
    val addresses: StateFlow<List<Address>> = _addresses.asStateFlow()

    private val _selectedAddress = MutableStateFlow<Address?>(null)
    val selectedAddress: StateFlow<Address?> = _selectedAddress.asStateFlow()

    private val _deliveryDate = MutableStateFlow("2026-10-26")
    val deliveryDate: StateFlow<String> = _deliveryDate.asStateFlow()

    private val _deliverySlot = MutableStateFlow("Early Morning (05:00 AM - 08:00 AM)")
    val deliverySlot: StateFlow<String> = _deliverySlot.asStateFlow()

    private val _poReference = MutableStateFlow("")
    val poReference: StateFlow<String> = _poReference.asStateFlow()

    private val _orderNotes = MutableStateFlow("")
    val orderNotes: StateFlow<String> = _orderNotes.asStateFlow()

    private val _checkoutError = MutableStateFlow<String?>(null)
    val checkoutError: StateFlow<String?> = _checkoutError.asStateFlow()

    private val _lastPlacedOrder = MutableStateFlow<Order?>(null)
    val lastPlacedOrder: StateFlow<Order?> = _lastPlacedOrder.asStateFlow()

    init {
        refreshCart()
        loadAddresses()
    }

    fun refreshCart() {
        viewModelScope.launch {
            _loading.value = true
            val res = cartRepo.getCart()
            _loading.value = false
            res.onSuccess {
                _cartData.value = it
            }
        }
    }

    fun updateQuantity(productId: Int, newQuantity: Int) {
        viewModelScope.launch {
            cartRepo.updateItem(productId, newQuantity)
            refreshCart()
        }
    }

    fun addToCart(product: Product, quantity: Int? = null) {
        viewModelScope.launch {
            val qty = quantity ?: product.minOrderQty
            cartRepo.updateItem(product.id, qty)
            refreshCart()
        }
    }

    fun loadAddresses() {
        viewModelScope.launch {
            val res = orderRepo.getAddresses()
            res.onSuccess {
                _addresses.value = it
                if (_selectedAddress.value == null) {
                    _selectedAddress.value = it.find { a -> a.isDefault } ?: it.firstOrNull()
                }
            }
        }
    }

    fun selectAddress(address: Address) {
        _selectedAddress.value = address
    }

    fun setDeliverySlot(slot: String) {
        _deliverySlot.value = slot
    }

    fun setDeliveryDate(date: String) {
        _deliveryDate.value = date
    }

    fun setPoReference(po: String) {
        _poReference.value = po
    }

    fun setOrderNotes(notes: String) {
        _orderNotes.value = notes
    }

    fun clearCheckoutError() {
        _checkoutError.value = null
    }

    fun submitOrder(onSuccess: (Order) -> Unit) {
        val addr = _selectedAddress.value
        if (addr == null) {
            _checkoutError.value = "Please select or add a delivery receiving address"
            return
        }

        val items = _cartData.value.items
        if (items.isEmpty()) {
            _checkoutError.value = "Your wholesale cart is empty"
            return
        }

        // Validate client-side MOQs as well
        val moqViolation = items.find { it.quantity < it.minOrderQty }
        if (moqViolation != null) {
            _checkoutError.value = "MOQ for ${moqViolation.name} is ${moqViolation.minOrderQty} ${moqViolation.unit}"
            return
        }

        viewModelScope.launch {
            _loading.value = true
            _checkoutError.value = null

            val req = CreateOrderRequest(
                deliveryAddressId = addr.id,
                deliveryDate = _deliveryDate.value,
                deliverySlot = _deliverySlot.value,
                poReference = _poReference.value.takeIf { it.isNotBlank() },
                notes = _orderNotes.value.takeIf { it.isNotBlank() },
                items = items.map { CreateOrderItemRequest(it.productId, it.quantity) }
            )

            val res = orderRepo.placeOrder(req)
            _loading.value = false

            res.onSuccess { order ->
                _lastPlacedOrder.value = order
                refreshCart()
                onSuccess(order)
            }.onFailure {
                _checkoutError.value = it.message ?: "Failed to place order"
            }
        }
    }
}

// 4. Order ViewModel
class OrderViewModel(
    private val orderRepo: OrderRepository,
    private val cartRepo: CartRepository
) : ViewModel() {
    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _currentOrderDetail = MutableStateFlow<OrderDetail?>(null)
    val currentOrderDetail: StateFlow<OrderDetail?> = _currentOrderDetail.asStateFlow()

    init {
        loadOrders()
    }

    fun loadOrders(status: String? = null) {
        viewModelScope.launch {
            _loading.value = true
            val res = orderRepo.getOrders(status)
            _loading.value = false
            res.onSuccess {
                _orders.value = it
            }
        }
    }

    fun loadOrderDetail(id: Int) {
        viewModelScope.launch {
            _loading.value = true
            val res = orderRepo.getOrderDetail(id)
            _loading.value = false
            res.onSuccess {
                _currentOrderDetail.value = it
            }
        }
    }

    fun cancelOrder(id: Int, reason: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            val res = orderRepo.cancelOrder(id, reason)
            _loading.value = false
            res.onSuccess {
                loadOrderDetail(id)
                loadOrders()
                onSuccess()
            }
        }
    }

    fun repeatOrder(items: List<OrderItem>, onDone: () -> Unit) {
        viewModelScope.launch {
            for (it in items) {
                cartRepo.updateItem(it.productId, it.quantity)
            }
            onDone()
        }
    }
}
