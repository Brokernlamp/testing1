using System.ComponentModel.DataAnnotations;

namespace SKSAdminDesktop.App.Models
{
    public class Customer
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(255)]
        public string CompanyName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Phone]
        [StringLength(20)]
        public string? Phone { get; set; }
        
        [StringLength(500)]
        public string? Address { get; set; }
        
        [StringLength(100)]
        public string? ContactPerson { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<Enquiry> Enquiries { get; set; } = new List<Enquiry>();
        public virtual ICollection<CustomOrder> CustomOrders { get; set; } = new List<CustomOrder>();
    }
}
