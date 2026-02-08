using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.Models.DbModels;

namespace TodoApp.Controllers.api
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoItemApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TodoItemApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/TodoItemApi
        // Permite que qualquer pessoa veja os anúncios (mesmo sem login)
        [HttpGet]
        [AllowAnonymous] 
        public async Task<ActionResult> GetTodoItems()
        {
            var result = await _context.TodoItems
                .Select(t => new { 
                    t.Id, 
                    Titulo = t.Tarefa, // Mapeamos Tarefa para Titulo
                    t.Preco,
                    t.Descricao,
                    t.Imagem,
                    t.Likes,
                    t.Views,
                    t.UserCriacao,
                    t.Concluida
                })
                .ToListAsync();
            
            return Ok(result);
        }

        // POST: api/TodoItemApi/5/view
        // Conta uma visualização real
        [HttpPost("{id}/view")]
        [AllowAnonymous]
        public async Task<IActionResult> IncrementView(int id)
        {
            var item = await _context.TodoItems.FindAsync(id);
            if (item == null) return NotFound();

            item.Views++; // Aumenta 1 visualização
            await _context.SaveChangesAsync();

            return Ok(new { views = item.Views });
        }

        // POST: api/TodoItemApi/5/like
        // Dá 1 Like (Requer Login e verifica duplicados)
        [HttpPost("{id}/like")]
        [Authorize]
        public async Task<IActionResult> LikeItem(int id)
        {
            var user = User.Identity.Name; // O nome do utilizador logado

            // 1. Verificar se o artigo existe
            var item = await _context.TodoItems.FindAsync(id);
            if (item == null) return NotFound();

            // 2. Verificar se este user JÁ DEU like neste artigo
            var jaDeuLike = await _context.ItemLikes
                .AnyAsync(l => l.TodoItemId == id && l.Username == user);

            if (jaDeuLike)
            {
                return BadRequest("Já deste like neste artigo!");
            }

            // 3. Se não deu, regista o like na tabela de controlo
            _context.ItemLikes.Add(new ItemLike { TodoItemId = id, Username = user });

            // 4. Aumenta o contador no artigo
            item.Likes++;
            
            await _context.SaveChangesAsync();

            return Ok(new { likes = item.Likes });
        }

        // POST: api/TodoItemApi
        // Criar novo anúncio (Requer Login)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {
            if (string.IsNullOrEmpty(todoItem.Tarefa) || todoItem.Preco <= 0)
            {
                return BadRequest("Título e Preço são obrigatórios.");
            }
            
            todoItem.Concluida = false;
            todoItem.DataCriacao = DateTime.Now;
            todoItem.UserCriacao = User.Identity.Name;
            
            // Inicia contadores a zero
            todoItem.Likes = 0;
            todoItem.Views = 0;
            
            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTodoItems", new { id = todoItem.Id }, todoItem);
        }

        // --- MÉTODOS AUXILIARES (Delete, Put) mantêm-se iguais ou ajustados ---
        // (Podes manter o teu Delete e Put originais aqui em baixo, certifica-te só que usam _context)
    }
}