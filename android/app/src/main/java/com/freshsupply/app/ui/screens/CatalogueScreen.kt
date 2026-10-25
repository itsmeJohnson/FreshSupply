package com.freshsupply.app.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.freshsupply.app.data.model.Product
import com.freshsupply.app.ui.components.CategoryChip
import com.freshsupply.app.ui.components.ProductCard
import com.freshsupply.app.ui.theme.*
import com.freshsupply.app.viewmodel.CartViewModel
import com.freshsupply.app.viewmodel.CatalogueViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogueScreen(
    catalogueViewModel: CatalogueViewModel,
    cartViewModel: CartViewModel,
    onNavigateToCart: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val categories by catalogueViewModel.categories.collectAsState()
    val products by catalogueViewModel.products.collectAsState()
    val selectedCategorySlug by catalogueViewModel.selectedCategorySlug.collectAsState()
    val searchQuery by catalogueViewModel.searchQuery.collectAsState()
    val cartData by cartViewModel.cartData.collectAsState()
    val selectedProduct by catalogueViewModel.selectedProduct.collectAsState()

    var sheetQuantity by remember { mutableStateOf(1) }

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CardBackground),
                title = {
                    Text(
                        text = "Wholesale Catalogue",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 17.sp,
                        color = MainText
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Input
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { catalogueViewModel.setSearchQuery(it) },
                    placeholder = { Text("Search by SKU, product name or pack...", fontSize = 13.sp) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = SecondaryText,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { catalogueViewModel.setSearchQuery("") }) {
                                Icon(imageVector = Icons.Default.Close, contentDescription = "Clear", modifier = Modifier.size(16.dp))
                            }
                        }
                    },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = White,
                        unfocusedContainerColor = White,
                        focusedBorderColor = PrimaryGreen,
                        unfocusedBorderColor = Borders
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Categories Filter Scroll
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    Surface(
                        color = if (selectedCategorySlug == null) PrimaryGreen else White,
                        shape = RoundedCornerShape(20.dp),
                        border = if (selectedCategorySlug == null) null else androidx.compose.foundation.BorderStroke(1.dp, Borders),
                        modifier = Modifier.clickable { catalogueViewModel.selectCategory(null) }
                    ) {
                        Text(
                            text = "All Categories",
                            color = if (selectedCategorySlug == null) White else MainText,
                            fontSize = 13.sp,
                            fontWeight = if (selectedCategorySlug == null) FontWeight.Bold else FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }

                items(categories) { cat ->
                    CategoryChip(
                        category = cat,
                        isSelected = selectedCategorySlug == cat.slug,
                        onClick = {
                            if (selectedCategorySlug == cat.slug) {
                                catalogueViewModel.selectCategory(null)
                            } else {
                                catalogueViewModel.selectCategory(cat.slug)
                            }
                        }
                    )
                }
            }

            // Products Grid
            if (products.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No products found in this category.",
                        color = SecondaryText,
                        fontSize = 14.sp
                    )
                }
            } else {
                val pairs = products.chunked(2)
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(pairs) { rowItems ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(modifier = Modifier.weight(1f)) {
                                ProductCard(
                                    product = rowItems[0],
                                    onProductClick = {
                                        sheetQuantity = rowItems[0].minOrderQty
                                        catalogueViewModel.openProductDetails(rowItems[0])
                                    },
                                    onAddToCart = { cartViewModel.addToCart(it) }
                                )
                            }

                            if (rowItems.size > 1) {
                                Box(modifier = Modifier.weight(1f)) {
                                    ProductCard(
                                        product = rowItems[1],
                                        onProductClick = {
                                            sheetQuantity = rowItems[1].minOrderQty
                                            catalogueViewModel.openProductDetails(rowItems[1])
                                        },
                                        onAddToCart = { cartViewModel.addToCart(it) }
                                    )
                                }
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }
        }

        // Product Detail Bottom Sheet Modal
        if (selectedProduct != null) {
            val p = selectedProduct!!
            ModalBottomSheet(
                onDismissRequest = { catalogueViewModel.closeProductDetails() },
                containerColor = White,
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .clip(RoundedCornerShape(12.dp))
                    ) {
                        AsyncImage(
                            model = p.imageUrl ?: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600",
                            contentDescription = p.name,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = p.sku,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        color = SecondaryText,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = p.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MainText
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = p.description ?: "Direct farm-to-kitchen commercial supply.",
                        fontSize = 13.sp,
                        color = SecondaryText,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "Wholesale Pack Size", fontSize = 11.sp, color = SecondaryText)
                            Text(text = p.packSize, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }

                        Column {
                            Text(text = "Minimum Order Qty", fontSize = 11.sp, color = SecondaryText)
                            Text(text = "${p.minOrderQty} ${p.unit}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DarkGreen)
                        }

                        Column {
                            Text(text = "Wholesale Price", fontSize = 11.sp, color = SecondaryText)
                            Text(
                                text = "₹${String.format("%.2f", p.price)}",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = DarkGreen
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Quantity Stepper
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Select Quantity (${p.unit}):",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedIconButton(
                                onClick = {
                                    if (sheetQuantity > p.minOrderQty) sheetQuantity--
                                },
                                enabled = sheetQuantity > p.minOrderQty
                            ) {
                                Icon(imageVector = Icons.Default.Remove, contentDescription = "Decrease")
                            }

                            Text(
                                text = sheetQuantity.toString(),
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 16.sp,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )

                            OutlinedIconButton(
                                onClick = { sheetQuantity++ }
                            ) {
                                Icon(imageVector = Icons.Default.Add, contentDescription = "Increase")
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            cartViewModel.addToCart(p, sheetQuantity)
                            catalogueViewModel.closeProductDetails()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Text(
                            text = "Add $sheetQuantity ${p.unit} to Order (₹${String.format("%.2f", p.price * sheetQuantity)})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }
}
