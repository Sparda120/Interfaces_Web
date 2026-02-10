using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.Models;

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

        // GET: Traz os anúncios E OS COMENTÁRIOS
        [HttpGet]
        [AllowAnonymous] 
        public async Task<ActionResult> GetTodoItems()
        {
            var result = await _context.TodoItems
                .Include(t => t.Comentarios) // <--- Carrega os comentários da BD
                .Select(t => new { 
                    t.Id, 
                    Titulo = t.Tarefa, 
                    t.Preco,
                    t.Descricao,
                    t.Imagem,
                    t.Likes,
                    t.Views,
                    t.UserCriacao,
                    // Envia a lista de comentários formatada
                    Comentarios = t.Comentarios.OrderByDescending(c => c.Data).Select(c => new {
                        c.Id, c.Username, c.Texto, Data = c.Data.ToString("dd/MM HH:mm")
                    })
                })
                .ToListAsync();
            
            return Ok(result);
        }

        // POST: Comentar
        [HttpPost("{id}/comment")]
        // [Authorize] // Desligado para o teu login falso funcionar
        public async Task<IActionResult> AddComment(int id, [FromBody] ItemComment comentario)
        {
            var item = await _context.TodoItems.FindAsync(id);
            if (item == null) return NotFound();

            if (string.IsNullOrEmpty(comentario.Texto)) return BadRequest("Escreve algo!");

            // Preenche dados automáticos
            comentario.TodoItemId = id;
            comentario.Data = DateTime.Now;
            if (string.IsNullOrEmpty(comentario.Username)) comentario.Username = "Anónimo";

            _context.ItemComments.Add(comentario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comentário adicionado!" });
        }

        // --- RESTO IGUAL (Views, Likes, Post, Delete) ---
        [HttpPost("{id}/view")]
        [AllowAnonymous]
        public async Task<IActionResult> IncrementView(int id)
        {
            var item = await _context.TodoItems.FindAsync(id);
            if (item == null) return NotFound();
            item.Views++; 
            await _context.SaveChangesAsync();
            return Ok(new { views = item.Views });
        }

        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikeItem(int id)
        {
            var item = await _context.TodoItems.FindAsync(id);
            if (item == null) return NotFound();
            item.Likes++;
            await _context.SaveChangesAsync();
            return Ok(new { likes = item.Likes });
        }

        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {
            if (string.IsNullOrEmpty(todoItem.Tarefa) || todoItem.Preco <= 0) return BadRequest();
            todoItem.Concluida = false;
            todoItem.DataCriacao = DateTime.Now;
            if (string.IsNullOrEmpty(todoItem.UserCriacao)) todoItem.UserCriacao = "Anónimo";
            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetTodoItems", new { id = todoItem.Id }, todoItem);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null) return NotFound();
            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        // PUT (Edição)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(int id, TodoItem todoItem)
        {
            if (id != todoItem.Id) return BadRequest();
            
            // Truque: Recuperar o artigo original para não perder dados (como UserCriacao ou Data)
            var original = await _context.TodoItems.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (original == null) return NotFound();

            todoItem.UserCriacao = original.UserCriacao;
            todoItem.DataCriacao = original.DataCriacao;
            todoItem.Likes = original.Likes;
            todoItem.Views = original.Views;

            _context.Entry(todoItem).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}