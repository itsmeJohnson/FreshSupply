package com.freshsupply.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.room.*
import com.freshsupply.app.data.model.Category
import com.freshsupply.app.data.model.Product
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// DataStore Extension
val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "freshsupply_prefs")

class UserPreferences(private val context: Context) {
    companion object {
        val TOKEN_KEY = stringPreferencesKey("auth_token")
        val CUSTOMER_ID_KEY = intPreferencesKey("customer_id")
        val BUSINESS_NAME_KEY = stringPreferencesKey("business_name")
        val EMAIL_KEY = stringPreferencesKey("customer_email")
    }

    val authToken: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }
    val businessName: Flow<String?> = context.dataStore.data.map { it[BUSINESS_NAME_KEY] }
    val customerEmail: Flow<String?> = context.dataStore.data.map { it[EMAIL_KEY] }

    suspend fun saveAuth(token: String, customerId: Int, businessName: String, email: String) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
            prefs[CUSTOMER_ID_KEY] = customerId
            prefs[BUSINESS_NAME_KEY] = businessName
            prefs[EMAIL_KEY] = email
        }
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }
}

// Room Entities
@Entity(tableName = "cached_products")
data class ProductEntity(
    @PrimaryKey val id: Int,
    val sku: String,
    val name: String,
    val description: String?,
    val categoryId: Int,
    val categoryName: String?,
    val imageUrl: String?,
    val unit: String,
    val packSize: String,
    val minOrderQty: Int,
    val price: Double,
    val stockQuantity: Int,
    val isActive: Boolean,
    val isFeatured: Boolean
) {
    fun toDomain() = Product(
        id = id,
        sku = sku,
        name = name,
        description = description,
        categoryId = categoryId,
        categoryName = categoryName,
        imageUrl = imageUrl,
        unit = unit,
        packSize = packSize,
        minOrderQty = minOrderQty,
        price = price,
        stockQuantity = stockQuantity,
        isActive = isActive,
        isFeatured = isFeatured
    )

    companion object {
        fun fromDomain(p: Product) = ProductEntity(
            id = p.id,
            sku = p.sku,
            name = p.name,
            description = p.description,
            categoryId = p.categoryId,
            categoryName = p.categoryName,
            imageUrl = p.imageUrl,
            unit = p.unit,
            packSize = p.packSize,
            minOrderQty = p.minOrderQty,
            price = p.price,
            stockQuantity = p.stockQuantity,
            isActive = p.isActive,
            isFeatured = p.isFeatured
        )
    }
}

@Entity(tableName = "cached_categories")
data class CategoryEntity(
    @PrimaryKey val id: Int,
    val name: String,
    val slug: String,
    val description: String?,
    val imageUrl: String?,
    val sortOrder: Int
) {
    fun toDomain() = Category(
        id = id,
        name = name,
        slug = slug,
        description = description,
        imageUrl = imageUrl,
        sortOrder = sortOrder
    )

    companion object {
        fun fromDomain(c: Category) = CategoryEntity(
            id = c.id,
            name = c.name,
            slug = c.slug,
            description = c.description,
            imageUrl = c.imageUrl,
            sortOrder = c.sortOrder
        )
    }
}

// Room DAOs
@Dao
interface ProductDao {
    @Query("SELECT * FROM cached_products WHERE isActive = 1 ORDER BY isFeatured DESC, id ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM cached_products WHERE categoryId = :catId AND isActive = 1")
    fun getProductsByCategory(catId: Int): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<ProductEntity>)

    @Query("DELETE FROM cached_products")
    suspend fun clearProducts()
}

@Dao
interface CategoryDao {
    @Query("SELECT * FROM cached_categories ORDER BY sortOrder ASC")
    fun getAllCategories(): Flow<List<CategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategories(categories: List<CategoryEntity>)

    @Query("DELETE FROM cached_categories")
    suspend fun clearCategories()
}

// Room Database
@Database(entities = [ProductEntity::class, CategoryEntity::class], version = 1, exportSchema = false)
abstract class FreshSupplyDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun categoryDao(): CategoryDao

    companion object {
        @Volatile
        private var INSTANCE: FreshSupplyDatabase? = null

        fun getDatabase(context: Context): FreshSupplyDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FreshSupplyDatabase::class.java,
                    "freshsupply_cache_db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
