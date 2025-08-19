-- Database Schema for Shree Krishna Signs Business Automation System
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for admin authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table for product organization
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);




-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    images TEXT[], -- Array of image URLs
    sizes TEXT[], -- Array of available sizes
    materials TEXT[], -- Array of available materials
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add top_seller column to products table
ALTER TABLE products ADD COLUMN top_seller BOOLEAN DEFAULT FALSE;

-- Update image_url to support multiple URLs (JSON array)
-- Note: This will be handled in the application layer as we'll store multiple URLs as JSON

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    source VARCHAR(50) DEFAULT 'website', -- 'website' or 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries table
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    material VARCHAR(100),
    delivery_date DATE,
    comments TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'replied', 'completed'
    reply_template_id UUID,
    quotation_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL DEFAULT 10,
    supplier_whatsapp VARCHAR(20),
    supplier_name VARCHAR(200),
    unit_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier orders table
CREATE TABLE supplier_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    supplier_whatsapp VARCHAR(20),
    template_id UUID,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'confirmed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL, -- 'customer' or 'supplier'
    category VARCHAR(100), -- For customer templates: 'acknowledgement', 'quotation_reply', 'order_confirmation', 'custom'
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO users (username, password_hash) VALUES 
('sks', '$2a$10$rQZ8K9mN2pL1vX3yQ7wE4tR6uI8oP9aB2cD5eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kK3lL4mM5nN6oO7pP8qQ9rR0sS1tT2uU3vV4wW5xX6yY7zZ');

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
('Signage Boards', 'Custom signage boards for businesses'),
('Letter Painting', 'Professional letter painting services'),
('Screen Printing', 'High-quality screen printing solutions'),
('Engraving & Etching', 'Precision engraving and etching services'),
('Laser Cutting', 'Advanced laser cutting technology'),
('Eco-Solvent & UV Printing', 'Environmentally friendly printing solutions'),
('Safety Posters & Industrial Labels', 'Safety and industrial labeling solutions');

-- Insert default templates
INSERT INTO templates (type, category, title, content) VALUES 
('customer', 'acknowledgement', 'Enquiry Acknowledgement', 'Dear {customer_name},\n\nThank you for your enquiry regarding {product_name}. We have received your request and our team will review the details.\n\nWe will get back to you with a quotation within 24 hours.\n\nBest regards,\nShree Krishna Signs Team'),
('customer', 'quotation_reply', 'Quotation Reply', 'Dear {customer_name},\n\nThank you for your enquiry. Here is your quotation for {product_name}:\n\nQuotation ID: {quotation_id}\nDelivery Date: {delivery_date}\n\nPlease review and let us know if you have any questions.\n\nBest regards,\nShree Krishna Signs Team'),
('customer', 'order_confirmation', 'Order Confirmation', 'Dear {customer_name},\n\nWe are pleased to confirm your order for {product_name}.\n\nOrder Details:\n- Quotation ID: {quotation_id}\n- Delivery Date: {delivery_date}\n\nWe will keep you updated on the progress.\n\nBest regards,\nShree Krishna Signs Team'),
('supplier', 'default', 'Supplier Order Template', 'Hello,\n\nWe need to place an order for:\nItem: {item_name}\nQuantity: {quantity}\nThreshold: {threshold}\n\nPlease confirm availability and pricing.\n\nBest regards,\nShree Krishna Signs');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_enquiries_customer ON enquiries(customer_id);
CREATE INDEX idx_enquiries_product ON enquiries(product_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created_at ON enquiries(created_at);
CREATE INDEX idx_inventory_threshold ON inventory(quantity, threshold);
CREATE INDEX idx_templates_type ON templates(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON supplier_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
