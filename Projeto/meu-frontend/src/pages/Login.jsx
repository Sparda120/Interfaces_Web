import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Tentar fazer login na API
      const response = await fetch("http://localhost:5096/api/AuthenticationApi/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: username, // Atenção: O Swagger pede 'userName' e não 'username'
          password: password
        })
      });

      if (response.ok) {
        // 2. Se correu bem, recebemos um TOKEN (a chave de casa)
        const data = await response.json();
        const token = data.token; 
        
        // 3. Guardar a chave no bolso (LocalStorage) para não a perder
        localStorage.setItem("meuToken", token);
        
        // 4. Enviar o utilizador para o Backoffice
        navigate("/admin/dashboard");
      } else {
        setError("Login falhou! Verifica o user/pass.");
      }
    } catch (err) {
      setError("Erro ao ligar à API. O .NET está a correr?");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc" }}>
      <h2>🔐 Login de Vendedor</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none" }}>
          Entrar
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      
      <p style={{ fontSize: "0.8em", color: "gray" }}>
        Dica: Se não sabes o login, tenta ver se existe um 'Register' no Swagger ou usa 'admin' / 'admin'.
      </p>
    </div>
  );
}

export default Login;