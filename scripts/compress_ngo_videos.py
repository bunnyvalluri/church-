import os
import sys
import subprocess
import imageio_ffmpeg

def compress_video(input_path, max_size_mb=10.0):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    orig_size_mb = os.path.getsize(input_path) / (1024 * 1024)
    
    if orig_size_mb <= max_size_mb:
        print(f"SKIP (Already small {orig_size_mb:.1f}MB): {input_path}")
        return
        
    temp_path = input_path + ".tmp.mp4"
    print(f"Compressing ({orig_size_mb:.1f}MB -> Target <=5MB): {os.path.basename(input_path)}...")
    
    cmd = [
        ffmpeg, "-y",
        "-i", input_path,
        "-vf", "scale=-2:480",
        "-c:v", "libx264",
        "-crf", "32",
        "-preset", "veryfast",
        "-c:a", "aac",
        "-b:a", "64k",
        "-movflags", "+faststart",
        temp_path
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
        new_size_mb = os.path.getsize(temp_path) / (1024 * 1024)
        print(f"  -> DONE: {orig_size_mb:.1f}MB -> {new_size_mb:.1f}MB ({((orig_size_mb-new_size_mb)/orig_size_mb)*100:.1f}% reduction)")
        os.replace(temp_path, input_path)
    else:
        print(f"  -> ERROR compressing {input_path}: {res.stderr[:200]}")
        if os.path.exists(temp_path):
            os.remove(temp_path)

def main():
    target_dir = r"frontend/public/KCM_NGO_SERVICES"
    print(f"Scanning {target_dir} for MP4 files...")
    
    mp4_files = []
    for root, _, files in os.walk(target_dir):
        for f in files:
            if f.lower().endswith(".mp4") and not f.endswith(".tmp.mp4"):
                mp4_files.append(os.path.join(root, f))
                
    print(f"Found {len(mp4_files)} total MP4 files.")
    
    # Sort largest first
    mp4_files.sort(key=lambda x: os.path.getsize(x), reverse=True)
    
    for i, file_path in enumerate(mp4_files, 1):
        print(f"\n[{i}/{len(mp4_files)}]", end=" ")
        compress_video(file_path)
        
    print("\nAll NGO MP4 video compressions completed successfully!")

if __name__ == "__main__":
    main()
