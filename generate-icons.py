#!/usr/bin/env python3
"""
Generate Android app icons from a source image using PIL/Pillow
This script creates icons in all required Android densities
"""

import os
from PIL import Image, ImageDraw

def generate_app_icons(source_image_path, output_dir):
    """
    Generate Android app icons in all required densities
    
    Standard Android icon sizes:
    - ldpi: 36x36
    - mdpi: 48x48
    - hdpi: 72x72
    - xhdpi: 96x96
    - xxhdpi: 144x144
    - xxxhdpi: 192x192
    """
    
    # Define icon sizes for each density
    sizes = {
        'mipmap-ldpi': 36,
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    
    try:
        # Open source image
        print(f"📂 Reading source image: {source_image_path}")
        img = Image.open(source_image_path).convert('RGBA')
        
        # Generate icons for each density
        for density_dir, size in sizes.items():
            output_path = os.path.join(output_dir, density_dir)
            os.makedirs(output_path, exist_ok=True)
            
            # Resize image
            icon = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Save as ic_launcher.png
            icon_file = os.path.join(output_path, 'ic_launcher.png')
            icon.save(icon_file, 'PNG')
            print(f"✅ Created: {density_dir}/ic_launcher.png ({size}x{size})")
            
            # Save as ic_launcher_round.png (rounded version)
            # Create a rounded version
            rounded = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            draw = ImageDraw.Draw(rounded)
            
            # Create circular mask
            draw.ellipse([0, 0, size, size], fill=(255, 255, 255, 255))
            rounded_icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            rounded_icon.paste(icon, (0, 0), icon)
            
            rounded_file = os.path.join(output_path, 'ic_launcher_round.png')
            rounded_icon.save(rounded_file, 'PNG')
            print(f"✅ Created: {density_dir}/ic_launcher_round.png (rounded)")
            
            # Generate foreground for adaptive icon (scaled to 108x108 then cropped to 72x72)
            # Adaptive icons use larger images (108dp) with inner safe zone (72dp)
            adaptive_size = int(size * 1.5)
            adaptive_img = img.resize((adaptive_size, adaptive_size), Image.Resampling.LANCZOS)
            
            # Crop to center (safe zone)
            crop_margin = (adaptive_size - size) // 2
            foreground = adaptive_img.crop((crop_margin, crop_margin, crop_margin + size, crop_margin + size))
            
            foreground_file = os.path.join(output_path, 'ic_launcher_foreground.png')
            foreground.save(foreground_file, 'PNG')
            print(f"✅ Created: {density_dir}/ic_launcher_foreground.png (adaptive foreground)")
        
        print("\n🎉 Android icons generated successfully!")
        return True
        
    except ImportError:
        print("❌ Error: Pillow (PIL) is not installed")
        print("Install it with: pip install Pillow")
        return False
    except Exception as e:
        print(f"❌ Error generating icons: {e}")
        return False

if __name__ == "__main__":
    # Source logo path
    source_path = "public/logo.jpeg"
    
    # Output directory (Android resources)
    output_base = "android/app/src/main/res"
    
    # Check if source exists
    if not os.path.exists(source_path):
        print(f"❌ Source image not found: {source_path}")
        exit(1)
    
    print("🎨 Generating Android app icons...")
    print(f"📍 Source: {source_path}")
    print(f"📍 Output: {output_base}")
    print()
    
    success = generate_app_icons(source_path, output_base)
    exit(0 if success else 1)
