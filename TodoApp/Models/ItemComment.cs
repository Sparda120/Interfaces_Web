using System;
using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models
{
    public class ItemComment
    {
        [Key]
        public int Id { get; set; }
        public int TodoItemId { get; set; } // Liga ao anúncio
        public string? Username { get; set; }
        public string? Texto { get; set; }
        public DateTime Data { get; set; }
    }
}