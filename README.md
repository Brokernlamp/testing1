# Shree Krishna Signs - Business Automation System

A comprehensive business automation system for Shree Krishna Signs, featuring a customer-facing website and an admin CRM panel built with Next.js, TypeScript, and Supabase.

## 🚀 Features

### Customer Website
- **Landing Page**: About Us section (30% of front page) with company history and services
- **Products Page**: Searchable product catalog with category filtering
- **Product Detail Page**: Detailed product view with quotation request form
- **Responsive Design**: Mobile and desktop optimized
- **Client Section**: Floating/gliding client logos below About Us

### Admin CRM Panel (`/admin`)
- **Secure Login**: Admin authentication (Username: `sks`, Password: `Swar@1234`)
- **Dashboard**: Overview of customers, enquiries, and inventory status
- **Product Management**: Add, edit, and manage products and categories
- **CRM Management**: Handle customer enquiries and quotations
- **Inventory Tracker**: Monitor stock levels with automatic alerts
- **Template Management**: Customer and supplier communication templates

### Database Features
- **PostgreSQL on Supabase**: Scalable and reliable backend
- **Real-time Updates**: Live data synchronization
- **User Management**: Secure admin authentication
- **Data Analytics**: Customer and enquiry tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Custom admin authentication
- **Deployment**: Netlify/Hostinger/GoDaddy ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sks-business-automation
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kyexepgjksrrdnubxkax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZXhlcGdqa3NycmRudWJ4a2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjU3NDQsImV4cCI6MjA3MTAwMTc0NH0.a4UPmwFqcAFDHfz11eqpslG-tAj5kShNLqQ7LTuRSRs
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:Swarom#1811@db.kyexepgjksrrdnubxkax.supabase.co:5432/postgres
```

### 4. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_schema.sql`
4. Execute the SQL to create all required tables

### 5. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The system includes the following tables:

- **users**: Admin user management
- **categories**: Product categories
- **products**: Product catalog
- **customers**: Customer information
- **enquiries**: Customer quotation requests
- **inventory**: Stock management
- **supplier_orders**: Supplier order tracking
- **templates**: Communication templates

## 🔐 Admin Access

- **URL**: `/admin`
- **Username**: `sks`
- **Password**: `Swar@1234`

## 📱 Pages Structure

```
/
├── / (Landing Page)
├── /products (Product Catalog)
├── /products/[id] (Product Detail + Quotation)
├── /admin (Admin Login)
└── /admin/
    ├── /dashboard (Admin Dashboard)
    ├── /inventory (Inventory Management)
    ├── /products (Product Management)
    ├── /enquiries (CRM Management)
    └── /templates (Template Management)
```

## 🎨 Customization

### Colors and Theme
The system uses a custom color palette based on the SKS logo:
- Primary: Blue tones (#0ea5e9)
- Secondary: Gray tones (#64748b)
- Accent: Yellow tones (#eab308)

### Client Logos
Replace placeholder logos in the landing page with actual client logos:
- Update the `clientLogos` array in `app/page.tsx`
- Add actual logo images to the `public` folder

### Company Information
Update company details throughout the application:
- Contact information
- Address
- Phone numbers
- Email addresses

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Hostinger/GoDaddy
1. Build the project: `npm run build`
2. Upload the `out` folder contents
3. Configure environment variables

## 📊 Features Overview

### Customer Features
- ✅ Product browsing and search
- ✅ Category filtering
- ✅ Quotation request forms
- ✅ Responsive design
- ✅ Contact information

### Admin Features
- ✅ Secure authentication
- ✅ Dashboard with statistics
- ✅ Product management
- ✅ Customer enquiry handling
- ✅ Inventory tracking
- ✅ Template management
- ✅ WhatsApp integration for suppliers

### Technical Features
- ✅ TypeScript support
- ✅ Responsive design
- ✅ Real-time database
- ✅ SEO optimized
- ✅ Performance optimized
- ✅ Security features

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure
```
├── app/                 # Next.js app directory
│   ├── admin/          # Admin panel pages
│   ├── products/       # Product pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── lib/                 # Utility functions
│   ├── supabase.ts     # Supabase client
│   └── utils.ts        # Helper functions
├── components/          # Reusable components
├── database_schema.sql  # Database setup
└── README.md           # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify Supabase credentials
   - Check if database schema is properly set up

2. **Build Errors**
   - Clear `.next` folder
   - Reinstall dependencies
   - Check Node.js version

3. **Authentication Issues**
   - Verify admin credentials
   - Check localStorage in browser

## 📞 Support

For technical support or questions:
- Check the database schema in `database_schema.sql`
- Verify environment variables
- Ensure all dependencies are installed

## 📄 License

This project is proprietary software for Shree Krishna Signs.

## 🔄 Updates

The system is designed to be easily maintainable and updatable:
- Modular component structure
- Centralized configuration
- Easy database modifications
- Scalable architecture

---

**Built with ❤️ for Shree Krishna Signs**
