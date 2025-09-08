using System.ComponentModel.DataAnnotations;

namespace SKSAdminDesktop.App.Models
{
    public class Enquiry
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid CustomerId { get; set; }
        
        public Guid? ProductId { get; set; }
        
        [Required]
        [StringLength(255)]
        public string ProductName { get; set; } = string.Empty;
        
        public int Quantity { get; set; } = 1;
        
        [StringLength(100)]
        public string? Size { get; set; }
        
        [StringLength(100)]
        public string? Material { get; set; }
        
        [StringLength(1000)]
        public string? Comments { get; set; }
        
        public DateTime DeliveryDate { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; } = "pending";
        
        [StringLength(100)]
        public string? InvoiceNumber { get; set; }
        
        public List<string>? Images { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Customer Customer { get; set; } = null!;
        public virtual Product? Product { get; set; }
    }
}
