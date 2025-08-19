const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kyexepgjksrrdnubxkax.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZXhlcGdqa3NycmRudWJ4a2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjU3NDQsImV4cCI6MjA3MTAwMTc0NH0.a4UPmwFqcAFDHfz11eqpsG-tAj5kShNLqQ7LTuRSRs'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('categories').select('*').limit(1)
    
    if (error) {
      console.log('Error connecting to Supabase:', error.message)
      
      // If tables don't exist, let's create them
      console.log('Tables might not exist. Creating them...')
      await createTables()
    } else {
      console.log('✅ Successfully connected to Supabase!')
      console.log('Categories found:', data?.length || 0)
    }
  } catch (err) {
    console.error('Connection failed:', err)
  }
}

async function createTables() {
  try {
    console.log('Creating database tables...')
    
    // Create categories table
    const { error: catError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (catError) console.log('Categories table error:', catError.message)
    else console.log('✅ Categories table created')
    
    // Create products table
    const { error: prodError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category_id UUID REFERENCES categories(id),
          images TEXT[],
          sizes TEXT[],
          materials TEXT[],
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (prodError) console.log('Products table error:', prodError.message)
    else console.log('✅ Products table created')
    
    // Create inventory table
    const { error: invError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS inventory (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          item_name VARCHAR(255) NOT NULL,
          quantity INTEGER DEFAULT 0,
          threshold INTEGER DEFAULT 10,
          supplier_whatsapp VARCHAR(50),
          supplier_name VARCHAR(255),
          unit_price DECIMAL(10,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (invError) console.log('Inventory table error:', invError.message)
    else console.log('✅ Inventory table created')
    
    // Insert some default data
    await insertDefaultData()
    
  } catch (err) {
    console.error('Error creating tables:', err)
  }
}

async function insertDefaultData() {
  try {
    // Insert default categories
    const { error: catError } = await supabase
      .from('categories')
      .insert([
        { name: 'Signage Boards', description: 'Various types of signage boards' },
        { name: 'Printing Services', description: 'Printing and digital services' },
        { name: 'Engraving', description: 'Engraving and etching services' }
      ])
    
    if (catError) console.log('Error inserting categories:', catError.message)
    else console.log('✅ Default categories inserted')
    
    // Insert sample inventory items
    const { error: invError } = await supabase
      .from('inventory')
      .insert([
        { 
          item_name: 'Vinyl Sheets', 
          quantity: 50, 
          threshold: 20,
          supplier_whatsapp: '+919876543210',
          supplier_name: 'Vinyl Supplier'
        },
        { 
          item_name: 'Canvas Rolls', 
          quantity: 30, 
          threshold: 15,
          supplier_whatsapp: '+919876543211',
          supplier_name: 'Canvas Supplier'
        }
      ])
    
    if (invError) console.log('Error inserting inventory:', invError.message)
    else console.log('✅ Sample inventory items inserted')
    
  } catch (err) {
    console.error('Error inserting default data:', err)
  }
}

testConnection()
