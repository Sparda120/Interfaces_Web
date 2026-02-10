using System;
using System.Collections.Generic; // <--- PRECISA DISTO NO TOPO
using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models
{
    public class TodoItem
    {
        [Key]
        public int Id { get; set; }
        public string? Tarefa { get; set; }
        public string? Descricao { get; set; }
        public double Preco { get; set; }
        public string? Imagem { get; set; }
        public bool Concluida { get; set; }
        public string? UserCriacao { get; set; }
        public int Likes { get; set; }
        public int Views { get; set; }
        public DateTime DataCriacao { get; set; }

        // --- LINHA NOVA: Lista de Comentários ---
        public List<ItemComment> Comentarios { get; set; } = new List<ItemComment>();
    }

    public class ItemLike
    {
        [Key]
        public int Id { get; set; }
        public int TodoItemId { get; set; }
        public string? Username { get; set; }
    }
}