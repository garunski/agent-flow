#!/bin/bash

# Script to concatenate all text files in directory and subdirectories into one giant file
# Excludes .git folder, shell scripts, and .gitignore patterns
# Usage: ./concatenate_files_final.sh [output_filename]

# Set default output filename if not provided
OUTPUT_FILE="${1:-all_files_combined.txt}"

# Check if output file already exists and ask for confirmation
if [ -f "$OUTPUT_FILE" ]; then
    echo "Warning: $OUTPUT_FILE already exists."
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 1
    fi
fi

# Initialize the output file (create empty file)
> "$OUTPUT_FILE"

# Counter for files processed
file_count=0

echo "Starting to concatenate text files..."
echo "Excluding: .git folder, shell scripts, and .gitignore patterns"
echo "Output will be saved to: $OUTPUT_FILE"
echo "----------------------------------------"

# Function to check if a file is text-based
is_text_file() {
    local file="$1"
    # Check if file exists and is readable
    if [ ! -r "$file" ]; then
        return 1
    fi
    
    # Use file command to detect text files
    local file_type=$(file -b --mime-type "$file" 2>/dev/null)
    case "$file_type" in
        text/*)
            return 0
            ;;
        application/json)
            return 0
            ;;
        application/xml)
            return 0
            ;;
        application/javascript)
            return 0
            ;;
        application/x-sh)
            return 0
            ;;
        application/x-yaml)
            return 0
            ;;
        *)
            # For files with unknown type, check if they contain only printable characters
            # and are not too large (avoid binary files)
            if [ -s "$file" ] && [ $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null) -lt 1048576 ]; then
                # Check if file contains mostly printable characters
                local non_printable=$(tr -d '\n\r\t\040-\176' < "$file" 2>/dev/null | wc -c)
                local total_chars=$(wc -c < "$file" 2>/dev/null)
                if [ "$total_chars" -gt 0 ] && [ "$non_printable" -lt $((total_chars / 10)) ]; then
                    return 0
                fi
            fi
            return 1
            ;;
    esac
}

# Find all files and process them
find . -type f | while read -r file; do
    # Skip the output file itself
    if [ "$file" = "./$OUTPUT_FILE" ]; then
        continue
    fi
    
    # Skip .git folder entirely
    if [[ "$file" == ./.git/* ]]; then
        continue
    fi
    
    # Skip shell scripts
    if [[ "$file" == *.sh ]]; then
        echo "Skipping (shell script): $file"
        continue
    fi
    
    # Skip if file is not text-based
    if ! is_text_file "$file"; then
        echo "Skipping (non-text): $file"
        continue
    fi
    
    # Append file contents
    cat "$file" >> "$OUTPUT_FILE"
    
    # Increment counter and show progress
    ((file_count++))
    echo "Processed: $file"
done

# Get final count of processed files
final_count=$(find . -type f | while read -r file; do
    if [ "$file" = "./$OUTPUT_FILE" ]; then
        continue
    fi
    if [[ "$file" == ./.git/* ]]; then
        continue
    fi
    if [[ "$file" == *.sh ]]; then
        continue
    fi
    if is_text_file "$file"; then
        echo "$file"
    fi
done | wc -l)

echo "----------------------------------------"
echo "Concatenation complete!"
echo "Total text files processed: $final_count"
echo "Output saved to: $OUTPUT_FILE"
echo "File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
