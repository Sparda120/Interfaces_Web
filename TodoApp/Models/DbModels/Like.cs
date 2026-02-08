using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models.DbModels  // <--- Isto tem de combinar com o que tens no outro ficheiro!
{
    public class Like
    {
        public int Id { get; set; }
        public int TodoItemId { get; set; } // O ID do produto que recebeu o like
    }
}