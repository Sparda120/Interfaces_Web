using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        [HttpGet]
        public async Task<ActionResult> GetTodoItems()
        {
            var result = await _context.TodoItems
                .Select(t => new { t.Id, t.Tarefa, t.Concluida, t.UserCriacao })
                .ToListAsync();
            
            return Ok(result);
        }

        // GET: api/TodoItemApi/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound();
            }

            return todoItem;
        }

        // PUT: api/TodoItemApi/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutTodoItem(int id, TodoItem todoItem)
        {
            if (id != todoItem.Id)
            {
                return BadRequest();
            }

            // exists?
            var task = _context.TodoItems
                .AsNoTracking()
                .ToList()
                .First(t => t.Id == id);
            
            if (task == null) return NotFound();

            if(task.UserCriacao != User.Identity.Name)
            {
                return BadRequest();
            }
            
            task.Tarefa = todoItem.Tarefa;
            task.Concluida = todoItem.Concluida;

            if (task.Concluida)
            {
                task.DataConcluida = new DateTime();
            }

            try
            {
                _context.TodoItems.Update(task);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/TodoItemApi
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {
            if (string.IsNullOrEmpty(todoItem.Tarefa))
            {
                return BadRequest();
            }
            
            todoItem.Concluida = false;
            todoItem.DataConcluida = DateTime.MinValue;
            todoItem.DataCriacao = DateTime.Now;
            todoItem.UserCriacao = User.Identity.Name;
            
            _context.TodoItems.Add(todoItem);
            
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
        }

        // DELETE: api/TodoItemApi/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            if (todoItem.UserCriacao != User.Identity.Name)
            {
                return BadRequest();
            }

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoItemExists(int id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}

/*
 * fetch(URL_LOGIN, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'username,
        password: 'password'
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log('fetch responseJson: ', responseJson);
    })
    .catch((error) => {
      console.error(error);
    });
 */