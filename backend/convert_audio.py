import sys
import os
import subprocess

def convert_audio(input_path):
    output_path = input_path.replace(os.path.splitext(input_path)[1], ".webm")

    # FFmpeg command to convert audio to WebM format
    command = [
        "ffmpeg", "-i", input_path, 
        "-c:a", "libopus", "-b:a", "64k", 
        "-vn", output_path, "-y"
    ]

    try:
        subprocess.run(command, check=True, stderr=subprocess.PIPE, text=True)
        print(f"Conversion successful: {output_path}")
    except subprocess.CalledProcessError as e:
        print("FFmpeg error:", e.stderr)
        sys.exit(1)

if __name__ == "__main__":
    input_file = sys.argv[1]
    convert_audio(input_file)
