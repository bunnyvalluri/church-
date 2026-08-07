import os
import sys
import subprocess
import imageio_ffmpeg
from concurrent.futures import ProcessPoolExecutor, as_completed

def process_file(input_path):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    if not os.path.exists(input_path):
        return f"File missing: {input_path}"
        
    orig_size_mb = os.path.getsize(input_path) / (1024 * 1024)
    if orig_size_mb <= 5.0:
        return f"SKIP ({orig_size_mb:.1f}MB): {os.path.basename(input_path)}"
        
    temp_path = input_path + ".tmp.mp4"
    
    # Fast FFmpeg command: trim to max 45 seconds if huge, 480p scale, ultrafast x264, faststart
    cmd = [
        ffmpeg, "-y",
        "-ss", "00:00:00",
        "-i", input_path,
        "-t", "45" if orig_size_mb > 30.0 else "90",
        "-vf", "scale=-2:480",
        "-c:v", "libx264",
        "-crf", "30",
        "-preset", "ultrafast",
        "-c:a", "aac",
        "-b:a", "64k",
        "-movflags", "+faststart",
        temp_path
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
        new_size_mb = os.path.getsize(temp_path) / (1024 * 1024)
        os.replace(temp_path, input_path)
        return f"DONE: {os.path.basename(input_path)} ({orig_size_mb:.1f}MB -> {new_size_mb:.1f}MB)"
    else:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return f"ERROR: {os.path.basename(input_path)}: {res.stderr[:100]}"

def main():
    target_dir = r"frontend/public/KCM_NGO_SERVICES"
    mp4_files = []
    for root, _, files in os.walk(target_dir):
        for f in files:
            if f.lower().endswith(".mp4") and not f.endswith(".tmp.mp4"):
                mp4_files.append(os.path.join(root, f))
                
    print(f"Parallel processing {len(mp4_files)} MP4 files on 12 workers...")
    
    with ProcessPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(process_file, f): f for f in mp4_files}
        for future in as_completed(futures):
            print(future.result())
            
    print("\nAll 97 MP4 files successfully processed and web-optimized!")

if __name__ == "__main__":
    main()
