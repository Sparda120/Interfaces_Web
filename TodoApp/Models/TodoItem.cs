using System;
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
        public string? Imagem { get; set; } // Guarda o código da imagem
        public bool Concluida { get; set; }
        public string? UserCriacao { get; set; } // Guarda quem criou (admin/user)
        public int Likes { get; set; }
        public int Views { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    // Tabela extra para controlar quem dá like
    public class ItemLike
    {
        [Key]
        public int Id { get; set; }
        public int TodoItemId { get; set; }
        public string? Username { get; set; }
    }
}