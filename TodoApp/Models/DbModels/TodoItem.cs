using System;
using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models.DbModels
{
    public class TodoItem
    {
        public int Id { get; set; }
        public string Tarefa { get; set; } // Título
        public bool Concluida { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime DataConcluida { get; set; }
        public string UserCriacao { get; set; }

        // --- NOVOS CAMPOS OBRIGATÓRIOS ---
        public decimal Preco { get; set; }
        public string Descricao { get; set; }
        public string Imagem { get; set; }
        public int Likes { get; set; }
        public int Views { get; set; }
    }
}