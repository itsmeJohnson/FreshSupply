package com.freshsupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.freshsupply.app.data.model.Category
import com.freshsupply.app.data.model.Product
import com.freshsupply.app.ui.components.OrderStatusBadge
import com.freshsupply.app.ui.components.ProductCard
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.AuthViewModel
import com.freshsupply.app.viewmodel.CartViewModel
import com.freshsupply.app.viewmodel.CatalogueViewModel
import com.freshsupply.app.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    authViewModel: AuthViewModel,
    catalogueViewModel: CatalogueViewModel,
    cartViewModel: CartViewModel,
    orderViewModel: OrderViewModel,
    onNavigateToCatalogue: (String?) -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToOrderDetail: (Int) -> Unit
) {
    val businessName by authViewModel.businessName.collectAsState()
    val categories by catalogueViewModel.categories.collectAsState()
    val featuredProducts by catalogueViewModel.featuredProducts.collectAsState()
    val cartData by cartViewModel.cartData.collectAsState()
    val orders by orderViewModel.orders.collectAsState()

    val activeOrder = orders.firstOrNull { it.status != "delivered" && it.status != "cancelled" }

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = CardBackground,
                    titleContentColor = MainText
                ),
                title = {
                    Column {
                        Text(
                            text = "FreshSupply",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp,
                            color = PrimaryGreen
                        )
                        Text(
                            text = businessName ?: "Restaurant Partner",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = SecondaryText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToCart) {
                        BadgedBox(
                            badge = {
                                if (cartData.items.isNotEmpty()) {
                                    Badge(containerColor = PrimaryGreen) {
                                        Text(
                                            text = cartData.items.size.toString(),
                                            color = White,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = "Cart",
                                tint = DarkGreen
                            )
                        }
                    }
                }
            )
        },
        containerColor = MainBackground
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // 1. Search Bar Trigger
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToCatalogue(null) },
                        shape = RoundedCornerShape(10.dp),
                        color = White,
                        border = androidx.compose.foundation.BorderStroke(1.dp, Borders),
                        shadowElevation = 1.dp
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
                                tint = SecondaryText,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Search wholesale vegetables, grains, spices...",
                                fontSize = 13.sp,
                                color = SecondaryText
                            )
                        }
                    }
                }
            }

            // 2. Early Morning Wholesale Dispatch Notice
            item {
                Surface(
                    color = SoftMint,
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, LightGreen),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalShipping,
                            contentDescription = "Delivery",
                            tint = PrimaryGreen,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Next Morning Direct Hub Delivery",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = DarkGreen
                            )
                            Text(
                                text = "Daily route dispatch 05:00 AM – 08:00 AM • Free above ₹5,000",
                                fontSize = 11.sp,
                                color = SecondaryText
                            )
                        }
                    }
                }
            }

            // 3. Active Order Teaser Card (if any)
            if (activeOrder != null) {
                item {
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clickable { onNavigateToOrderDetail(activeOrder.id) },
                        colors = CardDefaults.cardColors(containerColor = White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = activeOrder.orderNumber,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = DarkGreen
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    OrderStatusBadge(activeOrder.status)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Scheduled: ${activeOrder.deliveryDate} • ${activeOrder.deliverySlot}",
                                    fontSize = 11.sp,
                                    color = SecondaryText
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.ChevronRight,
                                contentDescription = "View",
                                tint = SecondaryText
                            )
                        }
                    }
                }
            }

            // 4. Categories Shortcuts
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Wholesale Categories",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 15.sp,
                        color = MainText
                    )
                    Text(
                        text = "View All",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = PrimaryGreen,
                        modifier = Modifier.clickable { onNavigateToCatalogue(null) }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(categories) { cat ->
                        CategoryHomeItem(
                            category = cat,
                            onClick = { onNavigateToCatalogue(cat.slug) }
                        )
                    }
                }
            }

            // 5. Featured Wholesale Products
            item {
                Spacer(modifier = Modifier.height(20.dp))
                Text(
                    text = "High-Volume Kitchen Essentials",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 15.sp,
                    color = MainText,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(10.dp))
            }

            // Grid items
            val chunked = featuredProducts.chunked(2)
            items(chunked) { pair ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(modifier = Modifier.weight(1f)) {
                        ProductCard(
                            product = pair[0],
                            onProductClick = { catalogueViewModel.openProductDetails(pair[0]) },
                            onAddToCart = { cartViewModel.addToCart(it) }
                        )
                    }

                    if (pair.size > 1) {
                        Box(modifier = Modifier.weight(1f)) {
                            ProductCard(
                                product = pair[1],
                                onProductClick = { catalogueViewModel.openProductDetails(pair[1]) },
                                onAddToCart = { cartViewModel.addToCart(it) }
                            )
                        }
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

@Composable
fun CategoryHomeItem(
    category: Category,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(80.dp)
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(Color(0xFFE8EFEA))
        ) {
            AsyncImage(
                model = category.imageUrl ?: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=160",
                contentDescription = category.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = category.name,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = MainText,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
