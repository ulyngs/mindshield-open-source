#!/bin/bash

# Check if Inkscape is installed
if ! command -v inkscape &> /dev/null; then
    echo "Error: Inkscape is not installed. Please install it or ensure it's in your PATH."
    exit 1
fi

# Check command-line arguments
if [ $# -ne 2 ] && [ $# -ne 3 ]; then
    echo "Usage: $0 [<background_svg> <popup_svg>] <output_dir>"
    echo "  - With two SVGs: $0 bg.svg popup.svg icons"
    echo "  - With one SVG (used for both): $0 single.svg icons"
    exit 1
fi

if [ $# -eq 2 ]; then
    INPUT_FILE_BG="$1"
    INPUT_FILE_POPUP="$1"
    OUTPUT_DIR="$2"
else
    INPUT_FILE_BG="$1"
    INPUT_FILE_POPUP="$2"
    OUTPUT_DIR="$3"
fi

# Check if input files exist
if [ ! -f "$INPUT_FILE_BG" ]; then
    echo "Error: Input file $INPUT_FILE_BG not found."
    exit 1
fi
if [ "$INPUT_FILE_BG" != "$INPUT_FILE_POPUP" ] && [ ! -f "$INPUT_FILE_POPUP" ]; then
    echo "Error: Input file $INPUT_FILE_POPUP not found."
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Define icon sizes for macOS and iOS
SIZES=(16 19 20 29 32 38 40 48 50 57 58 60 64 72 76 80 83.5 87 96 100 114 120 128 144 152 167 180 256 512 1024)

# Convert background SVG to PNG for each size
for SIZE in "${SIZES[@]}"; do
    OUTPUT_FILE="$OUTPUT_DIR/icon-${SIZE}.png"
    echo "Generating $OUTPUT_FILE..."
    inkscape "$INPUT_FILE_BG" \
      --export-filename="$OUTPUT_FILE" \
      --export-width="$SIZE" \
      --export-height="$SIZE" \
      --export-background-opacity=0
done

# Popup icon sizes from icon-focused.svg
POPUP_SIZES=(16 19 32 38)
for SIZE in "${POPUP_SIZES[@]}"; do
    OUTPUT_FILE="$OUTPUT_DIR/popup-${SIZE}.png"
    echo "Generating $OUTPUT_FILE..."
    inkscape "$INPUT_FILE_POPUP" \
      --export-filename="$OUTPUT_FILE" \
      --export-width="$SIZE" \
      --export-height="$SIZE" \
      --export-background-opacity=0
done

echo "Conversion complete! Icons are saved in the $OUTPUT_DIR directory."