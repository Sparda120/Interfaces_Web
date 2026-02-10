using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TodoApp.Models;

namespace TodoApp.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // AQUI ESTÁ A CORREÇÃO: Tem de ter o 's' no fim para bater certo com o erro
        public DbSet<TodoItem> TodoItems { get; set; } 
        
        public DbSet<ItemLike> ItemLikes { get; set; }

        public DbSet<ItemComment> ItemComments { get; set; }
    }
}