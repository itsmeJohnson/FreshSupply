package com.freshsupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    authViewModel: AuthViewModel,
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit
) {
    var email by remember { mutableStateOf("procurement@tandooribistro.com") }
    var password by remember { mutableStateOf("Customer@123") }
    val loading by authViewModel.loading.collectAsState()
    val error by authViewModel.error.collectAsState()

    Scaffold(containerColor = MainBackground) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Surface(
                color = PrimaryGreen,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.size(64.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Storefront,
                        contentDescription = "Logo",
                        tint = White,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "FreshSupply",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 24.sp,
                color = MainText
            )
            Text(
                text = "B2B Wholesale Ordering Platform",
                fontSize = 13.sp,
                color = SecondaryText
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (error != null) {
                Surface(
                    color = Color(0xFFFEE2E2),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFECACA)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = error!!,
                        color = ErrorRed,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(12.dp)
                    )
                }
                Spacer(modifier = Modifier.height(14.dp))
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = White),
                border = androidx.compose.foundation.BorderStroke(1.dp, Borders)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Business Sign In",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MainText
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Business Email") },
                        placeholder = { Text("procurement@restaurant.com") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = { authViewModel.login(email, password, onLoginSuccess) },
                        enabled = !loading,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        if (loading) {
                            CircularProgressIndicator(color = White, modifier = Modifier.size(20.dp))
                        } else {
                            Text(text = "Sign In to Procurement", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Demo Fill Buttons
            Text(
                text = "DEMO RESTAURANT ACCOUNTS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = SecondaryText
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = {
                        email = "procurement@tandooribistro.com"
                        password = "Customer@123"
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SoftMint, contentColor = DarkGreen),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                ) {
                    Text(text = "Tandoori Bistro", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = {
                        email = "kitchen@urbanbrewcafe.com"
                        password = "Customer@123"
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SoftMint, contentColor = DarkGreen),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                ) {
                    Text(text = "Urban Brew", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "New business partner? Register account",
                color = PrimaryGreen,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                modifier = Modifier.clickable { onNavigateToRegister() }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    authViewModel: AuthViewModel,
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    var businessName by remember { mutableStateOf("") }
    var contactPerson by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var gstNumber by remember { mutableStateOf("") }

    val loading by authViewModel.loading.collectAsState()
    val error by authViewModel.error.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Register Restaurant Business", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                navigationIcon = {
                    IconButton(onClick = onNavigateToLogin) {
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
                .padding(20.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (error != null) {
                Surface(
                    color = Color(0xFFFEE2E2),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFECACA)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(text = error!!, color = ErrorRed, fontSize = 12.sp, modifier = Modifier.padding(12.dp))
                }
            }

            OutlinedTextField(
                value = businessName,
                onValueChange = { businessName = it },
                label = { Text("Business / Restaurant Name *") },
                placeholder = { Text("e.g. Spice Route Kitchens") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = contactPerson,
                onValueChange = { contactPerson = it },
                label = { Text("Contact Person / Chef *") },
                placeholder = { Text("e.g. Chef Anita Rao") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Contact Phone *") },
                placeholder = { Text("+91 98450 00000") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Business Email *") },
                placeholder = { Text("orders@spiceroute.com") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password *") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = gstNumber,
                onValueChange = { gstNumber = it },
                label = { Text("GSTIN (Optional)") },
                placeholder = { Text("29AABCU9603R1ZM") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = {
                    authViewModel.register(
                        email,
                        password,
                        businessName,
                        contactPerson,
                        phone,
                        gstNumber.takeIf { it.isNotBlank() },
                        onRegisterSuccess
                    )
                },
                enabled = !loading && businessName.isNotBlank() && email.isNotBlank() && password.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                if (loading) {
                    CircularProgressIndicator(color = White, modifier = Modifier.size(20.dp))
                } else {
                    Text(text = "Complete Partner Registration", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
