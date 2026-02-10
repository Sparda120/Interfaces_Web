using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TodoApp.Models; // <--- AGORA APONTA PARA A PASTA CERTA

namespace TodoApp.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Estas linhas criam as tabelas baseadas no código do Passo 1
        public DbSet<TodoItem> TodoItem { get; set; }
        public DbSet<ItemLike> ItemLike { get; set; }
    }
}