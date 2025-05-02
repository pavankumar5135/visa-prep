#!/bin/bash

# Create a backup of the original dashboard
echo "Creating backup of original dashboard..."
cp app/dashboard/page.tsx app/dashboard/page.tsx.backup

# Replace the original dashboard with the simplified version
echo "Replacing dashboard with simplified version..."
cp app/dashboard/page_simplified.tsx app/dashboard/page.tsx

echo "Done! Dashboard page has been replaced."
echo "Original dashboard backed up to app/dashboard/page.tsx.backup" 