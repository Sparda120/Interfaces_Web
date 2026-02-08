using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.Models; 
using TodoApp.Models.DbModels; // Adicionei este para garantir que encontra o Like

namespace TodoApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LikesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. DAR LIKE (POST: api/likes/5)
        // O "5" é o ID do produto que queremos gostar
        [HttpPost("{idProduto}")]
        public async Task<IActionResult> DarLike(int idProduto)
        {
            // Verifica se o produto existe
            var produto = await _context.TodoItems.FindAsync(idProduto);
            if (produto == null) return NotFound("Produto não encontrado!");

            // Cria o like
            var novoLike = new Like { TodoItemId = idProduto };
            
            _context.Likes.Add(novoLike);
            await _context.SaveChangesAsync();

            return Ok("Like adicionado com sucesso!");
        }

        // 2. CONTAR LIKES (GET: api/likes/5)
        // Serve para saber quantos corações o produto tem
        [HttpGet("{idProduto}")]
        public async Task<IActionResult> ContarLikes(int idProduto)
        {
            var total = await _context.Likes.CountAsync(l => l.TodoItemId == idProduto);
            return Ok(total);
        }
    }
}