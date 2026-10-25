package com.freshsupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freshsupply.app.data.model.Order
import com.freshsupply.app.ui.theme.*

@Composable
fun OrderConfirmationScreen(
    order: Order,
    onViewOrder: (Int) -> Unit,
    onBackHome: () -> Unit
) {
    Scaffold(containerColor = MainBackground) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(LightGreen),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Success",
                    tint = PrimaryGreen,
                    modifier = Modifier.size(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Order Placed Successfully!",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MainText
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Warehouse inventory reserved. Direct delivery route assigned.",
                fontSize = 13.sp,
                color = SecondaryText,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(text = "Order Number", fontSize = 11.sp, color = SecondaryText)
                    Text(
                        text = order.orderNumber,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DarkGreen
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(text = "Scheduled Dispatch", fontSize = 11.sp, color = SecondaryText)
                    Text(
                        text = "${order.deliveryDate} • ${order.deliverySlot}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MainText
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(text = "Authoritative Total", fontSize = 11.sp, color = SecondaryText)
                    Text(
                        text = "₹${String.format("%.2f", order.totalAmount)}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DarkGreen
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { onViewOrder(order.id) },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text(text = "Track Order Status", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedButton(
                onClick = onBackHome,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text(text = "Return to Dashboard", fontWeight = FontWeight.Bold, color = MainText)
            }
        }
    }
}
