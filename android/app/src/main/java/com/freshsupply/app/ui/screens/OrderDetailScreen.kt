package com.freshsupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freshsupply.app.data.model.OrderItem
import com.freshsupply.app.ui.components.OrderStatusBadge
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailScreen(
    orderId: Int,
    orderViewModel: OrderViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCart: () -> Unit
) {
    val detail by orderViewModel.currentOrderDetail.collectAsState()
    val loading by orderViewModel.loading.collectAsState()

    var showCancelDialog by remember { mutableStateOf(false) }
    var cancelReason by remember { mutableStateOf("") }

    LaunchedEffect(orderId) {
        orderViewModel.loadOrderDetail(orderId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CardBackground),
                title = {
                    Text(
                        text = detail?.order?.orderNumber ?: "Order Details",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
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
        if (loading || detail == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PrimaryGreen)
            }
        } else {
            val ord = detail!!.order
            val items = detail!!.items
            val history = detail!!.history

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Header Status Card
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = ord.orderNumber,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = DarkGreen
                                )
                                OrderStatusBadge(ord.status)
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "Scheduled Delivery: ${ord.deliveryDate}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MainText
                            )
                            Text(
                                text = "Route Window: ${ord.deliverySlot}",
                                fontSize = 12.sp,
                                color = SecondaryText
                            )

                            if (!ord.poReference.isNullOrBlank()) {
                                Text(
                                    text = "PO Ref: ${ord.poReference}",
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = SecondaryText
                                )
                            }
                        }
                    }
                }

                // Delivery Dock Snapshot
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.LocationOn, contentDescription = null, tint = PrimaryGreen, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = "Receiving Dock & Contact", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "${ord.contactPerson} (${ord.contactPhone})",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MainText
                            )
                            if (ord.addressSnapshot != null) {
                                Text(
                                    text = "${ord.addressSnapshot.addressLine1}, ${ord.addressSnapshot.city} - ${ord.addressSnapshot.postalCode}",
                                    fontSize = 12.sp,
                                    color = SecondaryText
                                )
                            }
                        }
                    }
                }

                // Line items
                item {
                    Text(
                        text = "Wholesale Line Items (${items.size})",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 14.sp,
                        color = MainText
                    )
                }

                items(items) { item ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = item.productName, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(text = "${item.sku} • ${item.unit} (${item.packSize})", fontSize = 11.sp, color = SecondaryText)
                                Text(
                                    text = "₹${String.format("%.2f", item.unitPrice)} × ${item.quantity} units",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = DarkGreen
                                )
                            }
                            Text(
                                text = "₹${String.format("%.2f", item.lineTotal)}",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 14.sp,
                                color = MainText
                            )
                        }
                    }
                }

                // Financial Total
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = SoftMint),
                        border = androidx.compose.foundation.BorderStroke(1.dp, LightGreen)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "Subtotal:", fontSize = 12.sp, color = SecondaryText)
                                Text(text = "₹${String.format("%.2f", ord.subtotal)}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "GST (5%):", fontSize = 12.sp, color = SecondaryText)
                                Text(text = "₹${String.format("%.2f", ord.taxAmount)}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "Delivery:", fontSize = 12.sp, color = SecondaryText)
                                Text(
                                    text = if (ord.deliveryCharge == 0.0) "FREE" else "₹${String.format("%.2f", ord.deliveryCharge)}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            Divider(modifier = Modifier.padding(vertical = 8.dp), color = LightGreen)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "Total Charged:", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
                                Text(
                                    text = "₹${String.format("%.2f", ord.totalAmount)}",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = DarkGreen
                                )
                            }
                        }
                    }
                }

                // Live Status Tracking Timeline
                item {
                    Text(
                        text = "Fulfillment Status History",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 14.sp,
                        color = MainText
                    )
                }

                items(history) { st ->
                    Surface(
                        color = White,
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Borders),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(PrimaryGreen)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "${st.status.replaceFirstChar { it.uppercase() }}: ${st.notes ?: ""}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MainText
                                )
                                Text(
                                    text = "${st.createdAt} • ${st.updatedByType}",
                                    fontSize = 10.sp,
                                    color = SecondaryText
                                )
                            }
                        }
                    }
                }

                // Actions: Repeat Order / Cancel Order
                item {
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            orderViewModel.repeatOrder(items) {
                                onNavigateToCart()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Refresh, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "Repeat Order with Current Stock", fontWeight = FontWeight.Bold)
                    }

                    if (ord.status == "pending") {
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedButton(
                            onClick = { showCancelDialog = true },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = ErrorRed),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFECACA)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Cancel, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = "Request Order Cancellation", fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }

        // Cancel Dialog
        if (showCancelDialog) {
            AlertDialog(
                onDismissRequest = { showCancelDialog = false },
                title = { Text("Cancel Wholesale Order", fontWeight = FontWeight.Bold) },
                text = {
                    Column {
                        Text(
                            text = "Are you sure you want to cancel this order? Reserved warehouse inventory will be released back to the stock pool.",
                            fontSize = 13.sp,
                            color = SecondaryText
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = cancelReason,
                            onValueChange = { cancelReason = it },
                            label = { Text("Reason for Cancellation") },
                            placeholder = { Text("e.g. Schedule change / Menu update") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showCancelDialog = false
                            orderViewModel.cancelOrder(orderId, cancelReason) {}
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)
                    ) {
                        Text("Confirm Cancellation")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showCancelDialog = false }) {
                        Text("Keep Order")
                    }
                }
            )
        }
    }
}
