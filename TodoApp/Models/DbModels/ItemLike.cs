namespace TodoApp.Models.DbModels
{
    public class ItemLike
    {
        public int Id { get; set; }
        public int TodoItemId { get; set; } // ID do artigo
        public string Username { get; set; } // Quem deu o like
    }
}