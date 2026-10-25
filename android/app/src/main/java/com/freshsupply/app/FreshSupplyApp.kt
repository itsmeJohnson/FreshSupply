package com.freshsupply.app

import android.app.Application
import com.freshsupply.app.data.local.FreshSupplyDatabase
import com.freshsupply.app.data.local.UserPreferences
import com.freshsupply.app.data.remote.ApiClient
import com.freshsupply.app.data.repository.*

class FreshSupplyApp : Application() {
    lateinit var database: FreshSupplyDatabase
        private set

    lateinit var userPreferences: UserPreferences
        private set

    lateinit var authRepository: AuthRepository
        private set

    lateinit var productRepository: ProductRepository
        private set

    lateinit var cartRepository: CartRepository
        private set

    lateinit var orderRepository: OrderRepository
        private set

    override fun onCreate() {
        super.onCreate()

        database = FreshSupplyDatabase.getDatabase(this)
        userPreferences = UserPreferences(this)

        val apiService = ApiClient.create(this)

        authRepository = AuthRepository(apiService, userPreferences)
        productRepository = ProductRepository(apiService, database)
        cartRepository = CartRepository(apiService)
        orderRepository = OrderRepository(apiService)
    }
}
