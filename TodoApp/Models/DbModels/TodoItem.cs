using System;
using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models.DbModels
{
    public class TodoItem
    {
        public int Id { get; set; }

        // Vamos usar "Tarefa" como o Título do Anúncio
        public string Tarefa { get; set; } 

        public bool Concluida { get; set; } // Se true = Vendido
        public DateTime DataCriacao { get; set; }
        public DateTime DataConcluida { get; set; }
        public string UserCriacao { get; set; }

        // --- NOVOS CAMPOS PARA O MARKETPLACE ---
        public decimal Preco { get; set; }
        public string Descricao { get; set; }
        public string Imagem { get; set; } // Guardamos o URL ou Base64 da imagem
        
        // Estatísticas Reais
        public int Likes { get; set; }
        public int Views { get; set; }
    }
}