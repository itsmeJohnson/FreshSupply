package com.freshsupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.freshsupply.app.data.model.CartItem
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.CartViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    cartViewModel: CartViewModel,
    onNavigateToCheckout: () -> Unit,
    onNavigateBack: () -> Unit,
    onExploreCatalogue: () -> Unit
) {
    val cartData by cartViewModel.cartData.collectAsState()
    val loading by cartViewModel.loading.collectAsState()

    val items = cartData.items
    val summary = cartData.summary

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CardBackground),
                title = {
                    Text(
                        text = "Wholesale Procurement Cart",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 17.sp,
                        color = MainText
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        containerColor = MainBackground
    ) { padding ->
        if (items.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = "Empty",
                        modifier = Modifier.size(64.dp),
                        tint = SecondaryText
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Your Wholesale Cart is Empty",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MainText
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Explore restaurant essentials and bulk packs to begin ordering.",
                        fontSize = 13.sp,
                        color = SecondaryText,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = onExploreCatalogue,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                    ) {
                        Text(text = "Explore Catalogue", fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Free delivery banner
                    item {
                        val neededForFree = summary.freeDeliveryThreshold - summary.subtotal
                        Surface(
                            color = if (neededForFree <= 0) Color(0xFFDCFCE7) else SoftMint,
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (neededForFree <= 0) Color(0xFFBBF7D0) else LightGreen),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = if (neededForFree <= 0) Icons.Default.CheckCircle else Icons.Default.LocalShipping,
                                    contentDescription = "Delivery",
                                    tint = if (neededForFree <= 0) Color(0xFF166534) else PrimaryGreen,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (neededForFree <= 0) {
                                        "Eligible for Free Direct Hub Delivery!"
                                    } else {
                                        "Add ₹${String.format("%.0f", neededForFree)} more for FREE direct delivery"
                                    },
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (neededForFree <= 0) Color(0xFF166534) else DarkGreen
                                )
                            }
                        }
                    }

                    // Cart item cards
                    items(items) { item ->
                        CartItemCard(
                            item = item,
                            onIncrement = { cartViewModel.updateQuantity(item.productId, item.quantity + 1) },
                            onDecrement = {
                                if (item.quantity > 1) {
                                    cartViewModel.updateQuantity(item.productId, item.quantity - 1)
                                } else {
                                    cartViewModel.updateQuantity(item.productId, 0)
                                }
                            }
                        )
                    }

                    // Financial Summary Card
                    item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Payment & Tax Breakdown",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MainText
                                )
                                Spacer(modifier = Modifier.height(10.dp))

                                SummaryRow(label = "Subtotal (${items.size} SKUs)", value = "₹${String.format("%.2f", summary.subtotal)}")
                                SummaryRow(label = "GST (5% Authoritative)", value = "₹${String.format("%.2f", summary.taxAmount)}")
                                SummaryRow(
                                    label = "Delivery Charges",
                                    value = if (summary.deliveryCharge == 0.0) "FREE" else "₹${String.format("%.2f", summary.deliveryCharge)}",
                                    isFree = summary.deliveryCharge == 0.0
                                )

                                Divider(modifier = Modifier.padding(vertical = 10.dp), color = Borders)

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Estimated Total",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = MainText
                                    )
                                    Text(
                                        text = "₹${String.format("%.2f", summary.totalAmount)}",
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = DarkGreen
                                    )
                                }
                            }
                        }
                    }
                }

                // Bottom Checkout Action Bar
                Surface(
                    color = White,
                    shadowElevation = 8.dp,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Borders),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Total Payable", fontSize = 11.sp, color = SecondaryText)
                            Text(
                                text = "₹${String.format("%.2f", summary.totalAmount)}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = DarkGreen
                            )
                        }

                        Button(
                            onClick = onNavigateToCheckout,
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.height(48.dp)
                        ) {
                            Text(
                                text = "Checkout (${items.size} items)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Icon(imageVector = Icons.Default.ArrowForward, contentDescription = "Checkout", modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemCard(
    item: CartItem,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF1F5F2))
                ) {
                    AsyncImage(
                        model = item.imageUrl ?: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=160",
                        contentDescription = item.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = MainText,
                        maxLines = 2
                    )
                    Text(
                        text = "${item.sku} • ${item.unit}",
                        fontSize = 11.sp,
                        color = SecondaryText,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "₹${String.format("%.2f", item.price)} / unit",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = DarkGreen
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Stepper and line total
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Stepper
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .border(1.dp, Borders, RoundedCornerShape(8.dp))
                        .padding(horizontal = 4.dp, vertical = 2.dp)
                ) {
                    IconButton(
                        onClick = onDecrement,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(14.dp))
                    }

                    Text(
                        text = item.quantity.toString(),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(horizontal = 10.dp)
                    )

                    IconButton(
                        onClick = onIncrement,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(14.dp))
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "₹${String.format("%.2f", item.lineTotal)}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 15.sp,
                        color = MainText
                    )
                    if (item.quantity < item.minOrderQty) {
                        Text(
                            text = "Below MOQ (${item.minOrderQty})",
                            fontSize = 10.sp,
                            color = ErrorRed,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SummaryRow(label: String, value: String, isFree: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 13.sp, color = SecondaryText)
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (isFree) Color(0xFF166534) else MainText
        )
    }
}
