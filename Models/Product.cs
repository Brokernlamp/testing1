using System.ComponentModel.DataAnnotations;

namespace SKSAdminDesktop.App.Models
{
    public class Product
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? ProductCode { get; set; }
        
        public decimal? Price { get; set; }
        
        [StringLength(500)]
        public string? ImageUrl { get; set; }
        
        public List<string>? Images { get; set; }
        
        public List<string>? Sizes { get; set; }
        
        public List<string>? Materials { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public bool IsTopSeller { get; set; } = false;
        
        public int StockQuantity { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
