package com.freshsupply.app.ui.screens

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freshsupply.app.data.model.Address
import com.freshsupply.app.data.model.Order
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.CartViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    cartViewModel: CartViewModel,
    onOrderPlaced: (Order) -> Unit,
    onNavigateBack: () -> Unit
) {
    val cartData by cartViewModel.cartData.collectAsState()
    val addresses by cartViewModel.addresses.collectAsState()
    val selectedAddress by cartViewModel.selectedAddress.collectAsState()
    val deliveryDate by cartViewModel.deliveryDate.collectAsState()
    val deliverySlot by cartViewModel.deliverySlot.collectAsState()
    val poReference by cartViewModel.poReference.collectAsState()
    val orderNotes by cartViewModel.orderNotes.collectAsState()
    val checkoutError by cartViewModel.checkoutError.collectAsState()
    val loading by cartViewModel.loading.collectAsState()

    val slots = listOf(
        "Early Morning (05:00 AM - 08:00 AM)",
        "Morning Batch (08:00 AM - 11:00 AM)",
        "Afternoon Staging (01:00 PM - 04:00 PM)"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CardBackground),
                title = {
                    Text(
                        text = "Commercial Order Review",
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Error Alert if any
            if (checkoutError != null) {
                item {
                    Surface(
                        color = Color(0xFFFEE2E2),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFECACA)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.ErrorOutline,
                                contentDescription = "Error",
                                tint = ErrorRed,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = checkoutError!!,
                                fontSize = 12.sp,
                                color = ErrorRed,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            // 1. Delivery Receiving Dock
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
                                text = "1. Delivery Receiving Dock",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MainText
                            )
                            Icon(imageVector = Icons.Default.LocationOn, contentDescription = null, tint = PrimaryGreen)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        if (addresses.isEmpty()) {
                            Text(
                                text = "No address registered. Delivery defaults to commercial outlet address.",
                                fontSize = 12.sp,
                                color = SecondaryText
                            )
                        } else {
                            addresses.forEach { addr ->
                                val isSelected = selectedAddress?.id == addr.id
                                Surface(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp)
                                        .clickable { cartViewModel.selectAddress(addr) },
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (isSelected) SoftMint else White,
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (isSelected) PrimaryGreen else Borders
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        RadioButton(
                                            selected = isSelected,
                                            onClick = { cartViewModel.selectAddress(addr) },
                                            colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Column {
                                            Text(
                                                text = addr.label,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 13.sp,
                                                color = MainText
                                            )
                                            Text(
                                                text = "${addr.addressLine1}, ${addr.city} - ${addr.postalCode}",
                                                fontSize = 11.sp,
                                                color = SecondaryText
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 2. Delivery Date & Slot
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "2. Scheduled Dispatch Window",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = MainText
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Earliest Hub Route: Tomorrow, 26 Oct 2026",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = DarkGreen
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        slots.forEach { slot ->
                            val isSelected = deliverySlot == slot
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clickable { cartViewModel.setDeliverySlot(slot) },
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSelected) SoftMint else White,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) PrimaryGreen else Borders
                                )
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { cartViewModel.setDeliverySlot(slot) },
                                        colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = slot,
                                        fontSize = 12.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) DarkGreen else MainText
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 3. Commercial References
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "3. Business References",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = MainText
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = poReference,
                            onValueChange = { cartViewModel.setPoReference(it) },
                            label = { Text("Purchase Order Reference (Optional)", fontSize = 12.sp) },
                            placeholder = { Text("e.g. PO-TB-9021", fontSize = 12.sp) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = orderNotes,
                            onValueChange = { cartViewModel.setOrderNotes(it) },
                            label = { Text("Receiving Instructions", fontSize = 12.sp) },
                            placeholder = { Text("e.g. Call Chef Vikram at rear entrance", fontSize = 12.sp) },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // 4. Submit Order Button
            item {
                Button(
                    onClick = {
                        cartViewModel.submitOrder { placedOrder ->
                            onOrderPlaced(placedOrder)
                        }
                    },
                    enabled = !loading,
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    if (loading) {
                        CircularProgressIndicator(
                            color = White,
                            modifier = Modifier.size(22.dp),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "Reserving Inventory & Submitting...", fontWeight = FontWeight.Bold)
                    } else {
                        Icon(imageVector = Icons.Default.Check, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Submit Wholesale Order (₹${String.format("%.2f", cartData.summary.totalAmount)})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}
