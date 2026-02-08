using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models.DbModels;

public class TodoItem
{
    public  int Id { get; set; }
    [StringLength(128)]
    public string Tarefa { get; set; } = string.Empty;
    public bool Concluida { get; set; }
    
    [StringLength(128)]
    public string UserCriacao { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }
    public DateTime DataConcluida { get; set; }

    public class Like
    {
        public int Id { get; set; }

        // Isto serve para sabermos a que produto pertence este Like
        public int TodoItemId { get; set; } 
    }
}