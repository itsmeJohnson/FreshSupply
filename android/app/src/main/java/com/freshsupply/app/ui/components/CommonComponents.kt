package com.freshsupply.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.freshsupply.app.data.model.Category
import com.freshsupply.app.data.model.Product
import com.freshsupply.app.ui.theme.*

@Composable
fun OrderStatusBadge(status: String) {
    val (bgColor, textColor) = when (status.lowercase()) {
        "pending" -> Color(0xFFFEF3C7) to Color(0xFFB45309)
        "confirmed" -> Color(0xFFE0E7FF) to Color(0xFF3730A3)
        "processing" -> LightGreen to DarkGreen
        "dispatched" -> Color(0xFFEDE9FE) to Color(0xFF5B21B6)
        "delivered" -> Color(0xFFDCFCE7) to Color(0xFF166534)
        "cancelled" -> Color(0xFFFEE2E2) to ErrorRed
        else -> Color(0xFFF1F5F9) to SecondaryText
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(
            text = status.replaceFirstChar { it.uppercase() },
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun ProductCard(
    product: Product,
    onProductClick: () -> Unit,
    onAddToCart: (Product) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onProductClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Borders)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFF0F4F2))
            ) {
                AsyncImage(
                    model = product.imageUrl ?: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300",
                    contentDescription = product.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                if (product.isFeatured) {
                    Surface(
                        color = PrimaryGreen,
                        shape = RoundedCornerShape(bottomEnd = 8.dp),
                        modifier = Modifier.align(Alignment.TopStart)
                    ) {
                        Text(
                            text = "Featured",
                            color = White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = product.sku,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                fontFamily = FontFamily.Monospace,
                color = SecondaryText
            )

            Text(
                text = product.name,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = MainText,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 17.sp,
                modifier = Modifier.height(34.dp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            Surface(
                color = SoftMint,
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = "${product.unit} • MOQ: ${product.minOrderQty}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = DarkGreen,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "₹${String.format("%.2f", product.price)}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DarkGreen
                    )
                    Text(
                        text = "excl. 5% GST",
                        fontSize = 9.sp,
                        color = SecondaryText
                    )
                }

                Button(
                    onClick = { onAddToCart(product) },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add",
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(text = "ADD", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun CategoryChip(
    category: Category,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        color = if (isSelected) PrimaryGreen else White,
        shape = RoundedCornerShape(20.dp),
        border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, Borders),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = category.name,
            color = if (isSelected) White else MainText,
            fontSize = 13.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
        )
    }
}
