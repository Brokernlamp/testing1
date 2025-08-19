# Database Setup Guide

## Step 1: Supabase Project Setup

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `kyexepgjksrrdnubxkax`
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL**: `https://kyexepgjksrrdnubxkax.supabase.co`
   - **anon public**: (copy the actual key)
   - **service_role**: (copy the actual key)

## Step 2: Execute Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire content of `database_schema.sql`
3. Click **Run** to create all tables

## Step 3: Create .env.local file

Create a file named `.env.local` in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kyexepgjksrrdnubxkax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
DATABASE_URL=postgresql://postgres:Swarom#1811@db.kyexepgjksrrdnubxkax.supabase.co:5432/postgres
```

## Step 4: Test Connection

After setting up, restart your development server:

```bash
npm run dev
```

## Troubleshooting

If you still get "Invalid API key" error:

1. Make sure you copied the correct API keys from Supabase dashboard
2. Check that your `.env.local` file is in the project root
3. Restart the development server after updating environment variables
4. Make sure the database schema was executed successfully

## Database Tables Created

The schema will create these tables:
- `users` - Admin authentication
- `categories` - Product categories
- `products` - Product catalog
- `customers` - Customer information
- `enquiries` - Customer enquiries/quotations
- `inventory` - Stock management
- `supplier_orders` - Supplier order tracking
- `templates` - Email/WhatsApp templates

## Default Data

The schema also inserts:
- Default admin user (sks/Swar@1234)
- Sample categories
- Sample templates
