package com.freshsupply.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.freshsupply.app.ui.navigation.FreshSupplyNavGraph
import com.freshsupply.app.ui.theme.FreshSupplyTheme
import com.freshsupply.app.viewmodel.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val app = application as FreshSupplyApp

        val authViewModel by viewModels<AuthViewModel> {
            object : ViewModelProvider.Factory {
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return AuthViewModel(app.authRepository) as T
                }
            }
        }

        val catalogueViewModel by viewModels<CatalogueViewModel> {
            object : ViewModelProvider.Factory {
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return CatalogueViewModel(app.productRepository) as T
                }
            }
        }

        val cartViewModel by viewModels<CartViewModel> {
            object : ViewModelProvider.Factory {
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return CartViewModel(app.cartRepository, app.orderRepository) as T
                }
            }
        }

        val orderViewModel by viewModels<OrderViewModel> {
            object : ViewModelProvider.Factory {
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return OrderViewModel(app.orderRepository, app.cartRepository) as T
                }
            }
        }

        setContent {
            FreshSupplyTheme {
                FreshSupplyNavGraph(
                    authViewModel = authViewModel,
                    catalogueViewModel = catalogueViewModel,
                    cartViewModel = cartViewModel,
                    orderViewModel = orderViewModel
                )
            }
        }
    }
}
