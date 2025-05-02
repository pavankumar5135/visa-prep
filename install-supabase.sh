#!/bin/bash

# Install Supabase packages
npm install @supabase/supabase-js @supabase/ssr

echo "Supabase packages installed successfully."
echo "Remember to create a .env.local file with your Supabase credentials:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here"
echo ""
echo "You can find these credentials in your Supabase project dashboard." 