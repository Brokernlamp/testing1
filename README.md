# SKS Admin Desktop Application

A professional Windows desktop application for managing Shree Krishna Signs business operations.

## 🚀 Features

### **Dashboard Overview**
- **Real-time Statistics**: Total products, pending orders, customers, and low stock alerts
- **Quick Navigation**: Easy access to all admin functions
- **Modern UI**: Professional, intuitive interface

### **Product Management**
- Add, edit, and delete products
- Category management
- Image handling
- Stock quantity tracking
- Product codes and pricing

### **Order Management**
- View all enquiries and custom orders
- Status tracking (pending, processing, completed)
- Invoice number management
- Customer communication logs

### **Customer Database**
- Customer information management
- Order history tracking
- Contact details and addresses
- Company information

### **Inventory Control**
- Stock level monitoring
- Low stock alerts
- Reorder point management
- Stock movement tracking

## 🛠️ Technology Stack

- **.NET 8** - Latest framework
- **WPF (Windows Presentation Foundation)** - Modern desktop UI
- **Entity Framework Core** - Database operations
- **SQLite** - Local database storage
- **Dependency Injection** - Service management
- **MVVM Pattern** - Clean architecture

## 📋 Prerequisites

- **Visual Studio 2022** (Community, Professional, or Enterprise)
- **.NET 8 SDK**
- **Windows 10/11**

## 🚀 Getting Started

### 1. **Open in Visual Studio**
```
File → Open → Project/Solution
Navigate to: SKS-Admin-Desktop/SKSAdminDesktop.sln
```

### 2. **Restore NuGet Packages**
```
Right-click on Solution → Restore NuGet Packages
```

### 3. **Build and Run**
```
Build → Build Solution (Ctrl+Shift+B)
Debug → Start Debugging (F5)
```

## 🗄️ Database Setup

The application uses SQLite for local storage. The database file (`SKSAdmin.db`) will be created automatically on first run.

### **Connection String**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=SKSAdmin.db"
  }
}
```

## 📁 Project Structure

```
SKSAdminDesktop.App/
├── Models/                 # Data models
│   ├── Product.cs         # Product entity
│   ├── Customer.cs        # Customer entity
│   ├── Enquiry.cs         # Product enquiry
│   └── CustomOrder.cs     # Custom order
├── Services/              # Business logic
│   └── AppDbContext.cs    # Database context
├── ViewModels/            # View models (MVVM)
├── Views/                 # User interface views
├── MainWindow.xaml        # Main application window
├── App.xaml              # Application configuration
└── appsettings.json      # Configuration file
```

## 🔧 Configuration

### **appsettings.json**
```json
{
  "AppSettings": {
    "CompanyName": "Shree Krishna Signs",
    "Version": "1.0.0",
    "DatabasePath": "SKSAdmin.db"
  }
}
```

## 📊 Data Models

### **Product**
- Basic info (name, description, category)
- Images and specifications
- Stock and pricing
- Active status

### **Customer**
- Company details
- Contact information
- Address and phone

### **Enquiry**
- Product requests
- Quantity and specifications
- Delivery dates
- Status tracking

### **Custom Order**
- Custom product specifications
- Materials and sizes
- Order tracking
- Invoice management

## 🎯 Usage Guide

### **Dashboard**
- View business overview
- Monitor key metrics
- Quick navigation to functions

### **Products**
- Manage product catalog
- Update stock levels
- Handle images and descriptions

### **Orders**
- Process customer enquiries
- Track order status
- Manage custom orders
- Generate invoices

### **Customers**
- Maintain customer database
- View order history
- Update contact information

### **Inventory**
- Monitor stock levels
- Set reorder points
- Track stock movements

## 🔒 Security Features

- **Local Database**: Data stored locally on your computer
- **User Authentication**: Admin access control
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error management

## 📈 Future Enhancements

- **Data Export**: CSV, Excel export functionality
- **Reporting**: Advanced analytics and reports
- **Backup**: Automated data backup
- **Sync**: Web application synchronization
- **Multi-user**: Staff access levels
- **Printing**: Invoice and report printing

## 🐛 Troubleshooting

### **Build Errors**
1. Ensure .NET 8 SDK is installed
2. Restore NuGet packages
3. Clean and rebuild solution

### **Runtime Errors**
1. Check database file permissions
2. Verify appsettings.json configuration
3. Check Windows compatibility

### **Database Issues**
1. Delete `SKSAdmin.db` file to recreate
2. Check file path in connection string
3. Verify SQLite installation

## 📞 Support

For technical support or feature requests:
- **Email**: [Your Support Email]
- **Documentation**: [Your Documentation URL]
- **Issues**: [Your Issue Tracker]

## 📄 License

This application is proprietary software for Shree Krishna Signs.

---

**Version**: 1.0.0  
**Last Updated**: August 2025  
**Developer**: [Your Name/Company]

---

<!-- Push notification docs removed as the feature was reverted. -->