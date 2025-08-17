#!/bin/bash

# Check if Inkscape is installed
if ! command -v inkscape &> /dev/null; then
    echo "Error: Inkscape is not installed. Please install it or ensure it's in your PATH."
    exit 1
fi

# Input files
INPUT_FILE_BG="icon-cursor-sail-background.svg"
INPUT_FILE_POPUP="icon-cursor-sail.svg"

# Check if input files exist
if [ ! -f "$INPUT_FILE_BG" ]; then
    echo "Error: Input file $INPUT_FILE_BG not found in the current directory."
    exit 1
fi
if [ ! -f "$INPUT_FILE_POPUP" ]; then
    echo "Error: Input file $INPUT_FILE_POPUP not found in the current directory."
    exit 1
fi

# Create output directory
OUTPUT_DIR="icons"
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
