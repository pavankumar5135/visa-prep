This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables:

1. Create a `.env.local` file in the project root with the following content:

```
# Eleven Labs API key for visa interview conversation agent
ELEVEN_LABS_API_KEY=your_eleven_labs_api_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_public_eleven_labs_api_key_here
NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID=8xzGLFDx4PMsfYMFGWIb

# Deepseek LLM API key for conversation analysis
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase Anon Key for edge function authorization
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Supabase URL for authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
```

2. Replace the placeholders with your actual API keys:
   - Get an Eleven Labs API key from [Eleven Labs](https://elevenlabs.io/)
   - Get a Deepseek API key from [Deepseek](https://www.deepseek.com/)
   - Get a Supabase URL and Anon Key from your Supabase project settings

3. Install Supabase packages:
```bash
# Run the install script
bash install-supabase.sh
# Or manually install
npm install @supabase/supabase-js @supabase/ssr
```

4. Set up the Supabase database schema:
```bash
# Install Supabase CLI
npm install -g supabase

# Log in to Supabase
supabase login

# Link your project (replace 'project-ref' with your Supabase project reference)
supabase link --project-ref your-project-ref

# Apply migrations to create required tables
supabase db push
```

This will create the required tables:
- `profile` - Stores user profile information
- `ai_agent_users` - Tracks user purchase units/minutes
- `usage_tracking` - Records usage of minutes for analytics

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- Visa interview practice with AI
- Real-time conversation with a virtual immigration officer
- Analysis of your performance using Deepseek LLM
- Detailed feedback on your interview responses, including:
  - Overall impression
  - Strengths
  - Areas for improvement
  - Specific feedback on key moments
  - Recommendations for improvement
- Progress tracking and improvement suggestions
- Authentication with Supabase
- JWT Token authentication via URL (e.g., `example.com/dashboard?token=your_jwt_token`)
- Minutes management system for tracking and limiting usage

## Minutes Management System

This application includes a comprehensive minutes management system for tracking and limiting usage:

1. **Purchase Units**: Users have "minutes" (purchase_units) that are consumed when starting an interview
2. **Usage Tracking**: The system records actual usage time for analytics and potential refunds
3. **Validation**: The application checks if users have enough minutes before starting an interview
4. **UI Integration**: Available minutes are displayed prominently throughout the interface

### Database Schema

The minutes management system uses two main tables:

- **ai_agent_users** - Stores the available minutes for each user
  ```sql
  CREATE TABLE ai_agent_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      purchase_units INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  ```

- **usage_tracking** - Records detailed usage information
  ```sql
  CREATE TABLE usage_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      minutes_used INTEGER NOT NULL DEFAULT 0,
      usage_type TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
      interview_id UUID,
      metadata JSONB
  );
  ```

### Adding Minutes to User Account

To add minutes to a user account, you can use the following SQL:

```sql
-- Add 10 minutes to a user account
INSERT INTO ai_agent_users (user_id, purchase_units)
VALUES ('user-uuid', 10)
ON CONFLICT (user_id) 
DO UPDATE SET purchase_units = ai_agent_users.purchase_units + 10;
```

## JWT Token Authentication

This application supports authentication using JWT tokens passed via URL. When a user is redirected to this application with a JWT token in the URL (e.g., `example.com/dashboard?token=your_jwt_token`), the application will:

1. Detect the token in the URL
2. Redirect to a token handler page
3. Authenticate the user with Supabase using the token
4. Redirect the user back to the original page

This feature is useful for integrating with other applications that need to authenticate users in this application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
