import os

def main():
    root_dir = r'c:\K.C.M-Portal\frontend\public\KCM_NGO_SERVICES'
    image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    video_exts = {'.mp4', '.mov', '.avi'}

    images = []
    videos = []

    for root, dirs, files in os.walk(root_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            rel = os.path.relpath(os.path.join(root, f), r'c:\K.C.M-Portal\frontend\public')
            url_path = '/' + rel.replace('\\', '/')
            if ext in image_exts:
                images.append(url_path)
            elif ext in video_exts:
                videos.append(url_path)

    images.sort()
    videos.sort()

    print(f'Total images found: {len(images)}')
    print(f'Total videos found: {len(videos)}')

    # Generate frontend/lib/ngoImages.ts
    lines = [
        "// Auto-generated: all NGO service images for the marquee showcase",
        f"// Total: {len(images)} images across Hospitals, Ashramam, Disabled Care, and Missionaries of Charity",
        "",
        "export const ALL_NGO_IMAGES: string[] = ["
    ]

    for img in images:
        lines.append(f'  "{img}",')

    lines.append("];")
    lines.append("")

    with open(r'c:\K.C.M-Portal\frontend\lib\ngoImages.ts', 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))

    # Also update frontend/public/ngo_image_paths.txt
    with open(r'c:\K.C.M-Portal\frontend\public\ngo_image_paths.txt', 'w', encoding='utf-8') as f:
        f.write("\n".join(images) + "\n")

    print("Updated frontend/lib/ngoImages.ts and frontend/public/ngo_image_paths.txt successfully!")

if __name__ == '__main__':
    main()
