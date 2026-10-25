package com.freshsupply.app.ui.screens

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.AuthViewModel
import com.freshsupply.app.viewmodel.CartViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    authViewModel: AuthViewModel,
    cartViewModel: CartViewModel,
    onNavigateToOrders: () -> Unit,
    onLoggedOut: () -> Unit
) {
    val businessName by authViewModel.businessName.collectAsState()
    val addresses by cartViewModel.addresses.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CardBackground),
                title = {
                    Text(
                        text = "Business Profile",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 17.sp,
                        color = MainText
                    )
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
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Profile Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                color = SoftMint,
                                shape = CircleShape,
                                modifier = Modifier.size(54.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.Default.Business,
                                        contentDescription = null,
                                        tint = PrimaryGreen,
                                        modifier = Modifier.size(28.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column {
                                Text(
                                    text = businessName ?: "Restaurant Partner",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = MainText
                                )
                                Text(
                                    text = "Wholesale Buyer Account",
                                    fontSize = 12.sp,
                                    color = PrimaryGreen,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // Quick Orders history navigation
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToOrders() },
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.ReceiptLong, contentDescription = null, tint = PrimaryGreen)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(text = "Wholesale Orders & Invoices", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = SecondaryText)
                    }
                }
            }

            // Receiving Docks & Addresses
            item {
                Text(
                    text = "Registered Receiving Docks",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MainText
                )
            }

            items(addresses) { a ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = a.label, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            if (a.isDefault) {
                                Surface(
                                    color = SoftMint,
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "Primary Dock",
                                        color = DarkGreen,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${a.addressLine1}, ${a.city} - ${a.postalCode}",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }
                }
            }

            // Operations & Dispatch Support
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = SoftMint),
                    border = androidx.compose.foundation.BorderStroke(1.dp, LightGreen)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(text = "FreshSupply Dispatch Hub Support", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = DarkGreen)
                        Text(
                            text = "Direct Support Desk: +91 80 4910 8800 • support@freshsupply.com",
                            fontSize = 11.sp,
                            color = SecondaryText,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }

            // Sign Out Button
            item {
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedButton(
                    onClick = { authViewModel.logout(onLoggedOut) },
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = ErrorRed),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFECACA)),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                ) {
                    Icon(imageVector = Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Sign Out of Business Account", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}
