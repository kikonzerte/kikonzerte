#!/bin/bash
find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read img; do
    dir=$(dirname "$img")
    filename=$(basename -- "$img")
    filename_noext="${filename%.*}"
    magick "$img" -quality 50 "$dir/$filename_noext.webp"
done
