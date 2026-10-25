package com.freshsupply.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.freshsupply.app.data.model.Order
import com.freshsupply.app.ui.screens.*
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.*

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Main : Screen("main")
    object Cart : Screen("cart")
    object Checkout : Screen("checkout")
    object OrderConfirmation : Screen("order_confirmation")
    object OrderDetail : Screen("order_detail/{orderId}") {
        fun createRoute(orderId: Int) = "order_detail/$orderId"
    }
}

sealed class BottomTab(val route: String, val title: String, val icon: ImageVector) {
    object Home : BottomTab("tab_home", "Home", Icons.Default.Home)
    object Catalogue : BottomTab("tab_catalogue", "Catalogue", Icons.Default.Storefront)
    object Orders : BottomTab("tab_orders", "Orders", Icons.Default.ReceiptLong)
    object Profile : BottomTab("tab_profile", "Profile", Icons.Default.Business)
}

@Composable
fun FreshSupplyNavGraph(
    authViewModel: AuthViewModel,
    catalogueViewModel: CatalogueViewModel,
    cartViewModel: CartViewModel,
    orderViewModel: OrderViewModel
) {
    val navController = rememberNavController()
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState()

    val startDestination = if (isLoggedIn) Screen.Main.route else Screen.Login.route

    var confirmedOrder by remember { mutableStateOf<Order?>(null) }

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                authViewModel = authViewModel,
                onLoginSuccess = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                authViewModel = authViewModel,
                onRegisterSuccess = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }

        composable(Screen.Main.route) {
            MainContainerScreen(
                authViewModel = authViewModel,
                catalogueViewModel = catalogueViewModel,
                cartViewModel = cartViewModel,
                orderViewModel = orderViewModel,
                onNavigateToCart = { navController.navigate(Screen.Cart.route) },
                onNavigateToOrderDetail = { orderId -> navController.navigate(Screen.OrderDetail.createRoute(orderId)) },
                onLoggedOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Main.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Cart.route) {
            CartScreen(
                cartViewModel = cartViewModel,
                onNavigateToCheckout = { navController.navigate(Screen.Checkout.route) },
                onNavigateBack = { navController.popBackStack() },
                onExploreCatalogue = { navController.popBackStack() }
            )
        }

        composable(Screen.Checkout.route) {
            CheckoutScreen(
                cartViewModel = cartViewModel,
                onOrderPlaced = { order ->
                    confirmedOrder = order
                    navController.navigate(Screen.OrderConfirmation.route) {
                        popUpTo(Screen.Cart.route) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.OrderConfirmation.route) {
            confirmedOrder?.let { ord ->
                OrderConfirmationScreen(
                    order = ord,
                    onViewOrder = { orderId ->
                        navController.navigate(Screen.OrderDetail.createRoute(orderId)) {
                            popUpTo(Screen.Main.route)
                        }
                    },
                    onBackHome = {
                        navController.navigate(Screen.Main.route) {
                            popUpTo(Screen.Main.route) { inclusive = true }
                        }
                    }
                )
            }
        }

        composable(
            route = Screen.OrderDetail.route,
            arguments = listOf(navArgument("orderId") { type = NavType.IntType })
        ) { backStackEntry ->
            val orderId = backStackEntry.arguments?.getInt("orderId") ?: 0
            OrderDetailScreen(
                orderId = orderId,
                orderViewModel = orderViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCart = { navController.navigate(Screen.Cart.route) }
            )
        }
    }
}

@Composable
fun MainContainerScreen(
    authViewModel: AuthViewModel,
    catalogueViewModel: CatalogueViewModel,
    cartViewModel: CartViewModel,
    orderViewModel: OrderViewModel,
    onNavigateToCart: () -> Unit,
    onNavigateToOrderDetail: (Int) -> Unit,
    onLoggedOut: () -> Unit
) {
    val bottomTabs = listOf(
        BottomTab.Home,
        BottomTab.Catalogue,
        BottomTab.Orders,
        BottomTab.Profile
    )
    var currentTab by remember { mutableStateOf<BottomTab>(BottomTab.Home) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = CardBackground,
                contentColor = MainText
            ) {
                bottomTabs.forEach { tab ->
                    val isSelected = currentTab.route == tab.route
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentTab = tab },
                        icon = { Icon(imageVector = tab.icon, contentDescription = tab.title) },
                        label = {
                            Text(
                                text = tab.title,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryGreen,
                            selectedTextColor = DarkGreen,
                            indicatorColor = SoftMint
                        )
                    )
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (currentTab) {
                BottomTab.Home -> HomeScreen(
                    authViewModel = authViewModel,
                    catalogueViewModel = catalogueViewModel,
                    cartViewModel = cartViewModel,
                    orderViewModel = orderViewModel,
                    onNavigateToCatalogue = { slug ->
                        catalogueViewModel.selectCategory(slug)
                        currentTab = BottomTab.Catalogue
                    },
                    onNavigateToCart = onNavigateToCart,
                    onNavigateToOrders = { currentTab = BottomTab.Orders },
                    onNavigateToOrderDetail = onNavigateToOrderDetail
                )
                BottomTab.Catalogue -> CatalogueScreen(
                    catalogueViewModel = catalogueViewModel,
                    cartViewModel = cartViewModel,
                    onNavigateToCart = onNavigateToCart,
                    onNavigateBack = { currentTab = BottomTab.Home }
                )
                BottomTab.Orders -> OrdersScreen(
                    orderViewModel = orderViewModel,
                    onNavigateToDetail = onNavigateToOrderDetail,
                    onNavigateBack = { currentTab = BottomTab.Home }
                )
                BottomTab.Profile -> ProfileScreen(
                    authViewModel = authViewModel,
                    cartViewModel = cartViewModel,
                    onNavigateToOrders = { currentTab = BottomTab.Orders },
                    onLoggedOut = onLoggedOut
                )
            }
        }
    }
}
