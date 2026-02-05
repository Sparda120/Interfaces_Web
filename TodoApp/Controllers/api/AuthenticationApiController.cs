using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Models.Dtos;

namespace TodoApp.Controllers.api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationApiController : ControllerBase
    {

        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;

        public AuthenticationApiController(
            UserManager<IdentityUser> userManager, 
            SignInManager<IdentityUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet]
        [Route("whoami")]
        public ActionResult WhoAmi()
        {
            return User.Identity.IsAuthenticated ?
                Ok(new WhoAmIModel() { User= User.Identity.Name}) 
                : 
                Ok(new WhoAmIModel(){ User=""});
        }


        [HttpPost]
        [Route("login")]
        public async Task<ActionResult> Login([FromBody] LoginModel loginModel)
        {
            if (loginModel == null || 
                (string.IsNullOrEmpty(loginModel.Email) || string.IsNullOrEmpty(loginModel.Password))) { 
                return BadRequest("Request inválido");
            }

            // ir buscar o user
            var identity = await _userManager.FindByEmailAsync(loginModel.Email);
            if (identity == null)
            {
                return BadRequest("User não existe");
            }

            var res = await _signInManager.PasswordSignInAsync(identity, loginModel.Password, true, false);
            if (res.Succeeded) {
                return Ok();
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpGet]
        [Route("logout")]
        public async Task<ActionResult> LogOut()
        {
            await _signInManager.SignOutAsync();

            return Ok();
        }
     [HttpPost("register")]
public async Task<ActionResult> Register([FromBody] LoginModel model)
{
    var user = new IdentityUser 
    { 
        UserName = model.Email, 
        Email = model.Email,
        EmailConfirmed = true // <--- O TRUQUE: Obriga o sistema a aceitar o login!
    };
    
    var result = await _userManager.CreateAsync(user, model.Password);

    if (result.Succeeded)
    {
        return Ok("Conta criada e ativada com sucesso!");
    }
    
    return BadRequest(result.Errors);
}
    }
}
