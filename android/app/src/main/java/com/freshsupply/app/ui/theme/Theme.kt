package com.freshsupply.app.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = PrimaryGreen,
    onPrimary = White,
    primaryContainer = LightGreen,
    onPrimaryContainer = DarkGreen,
    secondary = DarkGreen,
    onSecondary = White,
    secondaryContainer = SoftMint,
    onSecondaryContainer = DarkGreen,
    background = MainBackground,
    onBackground = MainText,
    surface = CardBackground,
    onSurface = MainText,
    surfaceVariant = SoftMint,
    onSurfaceVariant = SecondaryText,
    outline = Borders,
    error = ErrorRed,
    onError = White
)

@Composable
fun FreshSupplyTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = DarkGreen.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
