const ImageKit = require('imagekit');

// Test ImageKit connection
async function testImageKit() {
  try {
    console.log('Testing ImageKit connection...');
    
    // Check environment variables
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    
    console.log('Environment variables:');
    console.log('Public Key:', publicKey ? 'Set' : 'Not set');
    console.log('Private Key:', privateKey ? 'Set' : 'Not set');
    console.log('URL Endpoint:', urlEndpoint ? 'Set' : 'Not set');
    
    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error('Missing ImageKit environment variables!');
      return;
    }
    
    // Initialize ImageKit
    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint
    });
    
    console.log('ImageKit initialized successfully');
    
    // Test a simple operation (list files)
    const files = await imagekit.listFiles({
      path: '/',
      limit: 1
    });
    
    console.log('Successfully connected to ImageKit!');
    console.log('Files in root directory:', files.length);
    
  } catch (error) {
    console.error('Error testing ImageKit:', error.message);
  }
}

testImageKit();
