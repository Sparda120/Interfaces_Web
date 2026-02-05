import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("A tentar login com:", email); // Ajuda a ver no F12

      const response = await fetch("http://localhost:5096/api/AuthenticationApi/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Mandamos 'userName' E 'email' igual para garantir que o backend aceita
          userName: email,
          email: email,
          password: password
        })
      });

      console.log("Resposta do servidor:", response.status);

      // SE O SERVIDOR DISSER "OK" (200), ENTRAMOS!
      if (response.ok) {
        // Truque: Não tentamos ler response.json() porque pode vir vazio
        localStorage.setItem("meuToken", "login-autorizado");
        
        alert("Login com sucesso! A entrar...");
        navigate("/admin/dashboard");
      } else {
        // Se der erro (401 ou 400)
        setError("Login recusado. Verifica user/pass ou se o email está confirmado.");
      }

    } catch (err) {
      console.error(err);
      setError("Erro de ligação. O Backend (.NET) está ligado?");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center" }}>🔐 Área de Vendedor</h2>
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>Email:</label>
          <input 
            type="text" 
            placeholder="Ex: vendedor1@todo.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            placeholder="A tua password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
        </div>
        
        <button type="submit" style={{ padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          ENTRAR
        </button>

        {error && (
          <div style={{ backgroundColor: "#ffdddd", color: "#d8000c", padding: "10px", borderRadius: "5px", textAlign: "center" }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;