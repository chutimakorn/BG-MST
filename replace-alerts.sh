#!/bin/bash

# Script to replace alert() with showToast() in all frontend files

echo "Replacing alert() with toast notifications..."

# Find all .tsx files in frontend/src/app
find frontend/src/app -name "*.tsx" -type f | while read file; do
  echo "Processing: $file"
  
  # Check if file already imports useToast or toast-helper
  if ! grep -q "toast-helper\|useToast" "$file"; then
    # Add import at the top (after 'use client' if exists)
    if grep -q "'use client'" "$file"; then
      sed -i "" "/^'use client'/a\\
import { showSuccess, showError, showInfo } from '@/lib/toast-helper'
" "$file"
    else
      sed -i "" "1i\\
import { showSuccess, showError, showInfo } from '@/lib/toast-helper'\\

" "$file"
    fi
  fi
  
  # Replace common alert patterns
  sed -i "" "s/alert('\\([^']*\\)สำเร็จ')/showSuccess('\\1สำเร็จ')/g" "$file"
  sed -i "" "s/alert('เกิดข้อผิดพลาด\\([^']*\\)')/showError('เกิดข้อผิดพลาด\\1')/g" "$file"
  sed -i "" "s/alert(\\([^)]*\\))/showInfo(\\1)/g" "$file"
done

echo "Done! Please review the changes."
