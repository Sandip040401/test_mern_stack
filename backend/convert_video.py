import sys
import os
import ffmpeg

def convert_to_webm(input_path):
    """Converts a video file to .webm format."""
    if not os.path.exists(input_path):
        print(f"ERROR: The file {input_path} does not exist.")
        return

    output_path = input_path.rsplit(".", 1)[0] + ".webm"

    try:
        ffmpeg.input(input_path).output(output_path, vcodec="libvpx", acodec="libvorbis").run(overwrite_output=True)
        print(f"Conversion successful! Output file: {output_path}")
    except ffmpeg.Error as e:
        print(f"ERROR: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("ERROR: Please provide a valid video file path as an argument.")
    else:
        video_path = sys.argv[1]  # Get the input file path
        convert_to_webm(video_path)
