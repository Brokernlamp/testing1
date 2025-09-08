using System;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Extensions.DependencyInjection;
using SKSAdminDesktop.App.Services;

namespace SKSAdminDesktop.App
{
    public partial class MainWindow : Window
    {
        private readonly IServiceProvider _serviceProvider;

        public MainWindow(IServiceProvider serviceProvider)
        {
            InitializeComponent();
            _serviceProvider = serviceProvider;
            
            // Initialize dashboard
            LoadDashboardData();
        }

        private async void LoadDashboardData()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Load dashboard statistics
                var totalProducts = await dbContext.Products.CountAsync();
                var pendingOrders = await dbContext.Enquiries.CountAsync(e => e.Status == "pending") +
                                   await dbContext.CustomOrders.CountAsync(e => e.Status == "pending");
                var totalCustomers = await dbContext.Customers.CountAsync();
                var lowStockItems = await dbContext.Products.CountAsync(p => p.StockQuantity < 10);

                // Update UI on UI thread
                Dispatcher.Invoke(() =>
                {
                    TotalProductsText.Text = totalProducts.ToString();
                    PendingOrdersText.Text = pendingOrders.ToString();
                    TotalCustomersText.Text = totalCustomers.ToString();
                    LowStockText.Text = lowStockItems.ToString();
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading dashboard data: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void DashboardBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowDashboard();
        }

        private void ProductsBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowProducts();
        }

        private void OrdersBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowOrders();
        }

        private void CustomersBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowCustomers();
        }

        private void InventoryBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowInventory();
        }

        private void LogoutBtn_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Are you sure you want to logout?", "Logout", 
                MessageBoxButton.YesNo, MessageBoxImage.Question);
            
            if (result == MessageBoxResult.Yes)
            {
                Application.Current.Shutdown();
            }
        }

        private void ShowDashboard()
        {
            DashboardView.Visibility = Visibility.Visible;
            // Hide other views when implemented
            LoadDashboardData();
        }

        private void ShowProducts()
        {
            DashboardView.Visibility = Visibility.Collapsed;
            // TODO: Show products view
            MessageBox.Show("Products view coming soon!", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ShowOrders()
        {
            DashboardView.Visibility = Visibility.Collapsed;
            // TODO: Show orders view
            MessageBox.Show("Orders view coming soon!", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ShowCustomers()
        {
            DashboardView.Visibility = Visibility.Collapsed;
            // TODO: Show customers view
            MessageBox.Show("Customers view coming soon!", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ShowInventory()
        {
            DashboardView.Visibility = Visibility.Collapsed;
            // TODO: Show inventory view
            MessageBox.Show("Inventory view coming soon!", "Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }
}
