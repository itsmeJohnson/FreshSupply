package com.freshsupply.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freshsupply.app.data.model.Order
import com.freshsupply.app.ui.components.OrderStatusBadge
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.OrderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    orderViewModel: OrderViewModel,
    onNavigateToDetail: (Int) -> Unit,
    onNavigateBack: () -> Unit
) {
    val orders by orderViewModel.orders.collectAsState()
    val loading by orderViewModel.loading.collectAsState()
    var selectedFilter by remember { mutableStateOf("all") }

    LaunchedEffect(selectedFilter) {
        orderViewModel.loadOrders(if (selectedFilter == "all") null else selectedFilter)
    }

    val tabs = listOf(
        "all" to "All Orders",
        "pending" to "Pending",
        "confirmed" to "Confirmed",
        "processing" to "Processing",
        "dispatched" to "Dispatched",
        "delivered" to "Delivered"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CardBackground),
                title = {
                    Text(
                        text = "Wholesale Orders History",
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Filter Pills
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(tabs) { (id, label) ->
                    val isSelected = selectedFilter == id
                    Surface(
                        color = if (isSelected) PrimaryGreen else White,
                        shape = RoundedCornerShape(20.dp),
                        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, Borders),
                        modifier = Modifier.clickable { selectedFilter = id }
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) White else MainText,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                        )
                    }
                }
            }

            if (loading && orders.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryGreen)
                }
            } else if (orders.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No orders found in this category.",
                        color = SecondaryText,
                        fontSize = 14.sp
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(orders) { ord ->
                        CustomerOrderCard(
                            order = ord,
                            onClick = { onNavigateToDetail(ord.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CustomerOrderCard(order: Order, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = order.orderNumber,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DarkGreen
                )
                OrderStatusBadge(order.status)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Dispatch: ${order.deliveryDate} • ${order.deliverySlot}",
                fontSize = 12.sp,
                color = MainText,
                fontWeight = FontWeight.Medium
            )

            if (!order.poReference.isNullOrBlank()) {
                Text(
                    text = "PO: ${order.poReference}",
                    fontSize = 11.sp,
                    color = SecondaryText,
                    fontFamily = FontFamily.Monospace
                )
            }

            Divider(modifier = Modifier.padding(vertical = 10.dp), color = Color(0xFFF0F4F2))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${order.itemCount} wholesale SKUs",
                    fontSize = 12.sp,
                    color = SecondaryText
                )

                Text(
                    text = "₹${String.format("%.2f", order.totalAmount)}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DarkGreen
                )
            }
        }
    }
}
