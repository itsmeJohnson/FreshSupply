package com.freshsupply.app.data.remote

import android.content.Context
import com.freshsupply.app.data.local.UserPreferences
import com.freshsupply.app.data.model.*
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import com.freshsupply.app.BuildConfig
import java.util.concurrent.TimeUnit

interface FreshSupplyApiService {
    // Auth
    @POST("auth/customer/login")
    suspend fun login(@Body req: LoginRequest): ApiResponse<AuthData>

    @POST("auth/customer/register")
    suspend fun register(@Body req: RegisterRequest): ApiResponse<AuthData>

    @GET("auth/customer/me")
    suspend fun getProfile(): ApiResponse<Map<String, Any>>

    // Categories
    @GET("categories")
    suspend fun getCategories(): ApiResponse<List<Category>>

    // Products
    @GET("products")
    suspend fun getProducts(
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("featured") featured: String? = null,
        @Query("sort") sort: String? = null
    ): ApiResponse<List<Product>>

    @GET("products/{id}")
    suspend fun getProductDetail(@Path("id") id: Int): ApiResponse<Product>

    // Cart
    @GET("cart")
    suspend fun getCart(): ApiResponse<CartData>

    @POST("cart/items")
    suspend fun addToCart(@Body req: AddToCartRequest): ApiResponse<Any>

    @DELETE("cart/items/{productId}")
    suspend fun removeFromCart(@Path("productId") productId: Int): ApiResponse<Any>

    @DELETE("cart")
    suspend fun clearCart(): ApiResponse<Any>

    // Addresses
    @GET("customers/addresses")
    suspend fun getAddresses(): ApiResponse<List<Address>>

    @POST("customers/addresses")
    suspend fun addAddress(@Body address: Address): ApiResponse<Address>

    // Orders
    @POST("orders")
    suspend fun createOrder(@Body req: CreateOrderRequest): ApiResponse<Order>

    @GET("orders")
    suspend fun getOrders(@Query("status") status: String? = null): ApiResponse<List<Order>>

    @GET("orders/{id}")
    suspend fun getOrderDetail(@Path("id") id: Int): ApiResponse<OrderDetail>

    @POST("orders/{id}/cancel")
    suspend fun cancelOrder(
        @Path("id") id: Int,
        @Body body: Map<String, String>
    ): ApiResponse<Order>
}

class AuthInterceptor(private val userPreferences: UserPreferences) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking {
            userPreferences.authToken.firstOrNull()
        }

        val requestBuilder = chain.request().newBuilder()
        if (!token.isNullOrEmpty()) {
            requestBuilder.addHeader("Authorization", "Bearer $token")
        }

        return chain.proceed(requestBuilder.build())
    }
}

object ApiClient {
    fun create(context: Context, baseUrl: String = BuildConfig.BASE_URL): FreshSupplyApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val userPrefs = UserPreferences(context)

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(userPrefs))
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FreshSupplyApiService::class.java)
    }
}
