import os
from PIL import Image

public_dir = r"c:\K.C.M-Portal\frontend\public"

def compress_image(filename, max_width, max_height, quality=85):
    filepath = os.path.join(public_dir, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename}: file not found")
        return
        
    original_size = os.path.getsize(filepath)
    print(f"Processing {filename} (Original size: {original_size / 1024:.1f} KB)")
    
    try:
        with Image.open(filepath) as img:
            # Calculate aspect ratio
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save based on format
            if filename.lower().endswith('.png'):
                # Convert RGBA to adaptive P mode (palette) to greatly reduce size while preserving transparency
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    alpha = img.getchannel('A') if img.mode == 'RGBA' else img.convert('RGBA').getchannel('A')
                    # Create a copy and convert to 256 colors adaptive palette
                    img_p = img.convert('RGB').convert('P', palette=Image.Palette.ADAPTIVE, colors=256)
                    # Restore transparency mask
                    mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
                    img_p.paste(255, mask)
                    img_p.save(filepath, "PNG", optimize=True, transparency=255)
                else:
                    img.save(filepath, "PNG", optimize=True)
            elif filename.lower().endswith(('.jpg', '.jpeg')):
                img.save(filepath, "JPEG", quality=quality, optimize=True)
                
        new_size = os.path.getsize(filepath)
        print(f"Saved {filename}: {new_size / 1024:.1f} KB (Reduced by {(original_size - new_size)/original_size * 100:.1f}%)")
    except Exception as e:
        print(f"Error compressing {filename}: {e}")

if __name__ == "__main__":
    # 1. Logo (extremely high priority, 1.8MB -> 10-15KB)
    compress_image("logo.png", 256, 256)
    
    # 2. Chatbots (484KB -> ~10KB)
    compress_image("chatbot-bird-logo.png", 256, 256)
    compress_image("chatbot-logo.png", 256, 256)
    
    # 3. Dove flying (702KB -> ~30KB)
    compress_image("dove-flying.png", 512, 512)
    
    # 4. QR Code (300KB -> ~20KB)
    compress_image("upi_qr.png", 400, 540)
    
    # 5. Pastor profile (313KB -> ~20KB)
    compress_image("pastor.png", 256, 256)
    
    # 6. NGO cover (421KB -> ~50KB)
    compress_image("kcm_society_ngo.jpg", 800, 660, quality=85)
    
    # 7. Backup ChatGPT Image (1.8MB -> ~15KB)
    compress_image("ChatGPT Image May 17, 2026, 11_38_01 AM.png", 256, 256)
