import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Backoffice() {
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState("");
  const navigate = useNavigate();

  // 1. Carregar produtos
  const carregarProdutos = async () => {
    try {
      const resposta = await fetch("http://localhost:5096/api/TodoItemApi");
      const dados = await resposta.json();
      setProdutos(dados);
    } catch (erro) {
      console.error("Erro de ligação");
    }
  };

  // 2. Verificar Login
  useEffect(() => {
    const token = localStorage.getItem("meuToken");
    if (!token) {
      navigate("/admin"); 
    } else {
      carregarProdutos();
    }
  }, []);

  // 3. Criar produto
  const adicionarProduto = async (e) => {
    e.preventDefault();
    if (!novoProduto) return;

    const token = localStorage.getItem("meuToken");

    await fetch("http://localhost:5096/api/TodoItemApi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: novoProduto, 
        isComplete: false 
      })
    });

    setNovoProduto(""); 
    carregarProdutos(); 
  };

  // 4. Apagar produto
  const apagarProduto = async (id) => {
    if (!window.confirm("Tens a certeza que queres apagar este anúncio?")) return;
    const token = localStorage.getItem("meuToken");
    await fetch(`http://localhost:5096/api/TodoItemApi/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    carregarProdutos();
  };

  // 5. Logout
  const sair = () => {
    localStorage.removeItem("meuToken");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", padding: "10px 0" }}>
        <h1 style={{ color: "#333" }}>🔧 Painel de Vendedor</h1>
        <button onClick={sair} style={{ backgroundColor: "#dc3545", color: "white", padding: "10px 20px", border: "none", borderRadius: "25px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
          Sair
        </button>
      </div>

      {/* === A MUDANÇA ESTÁ AQUI: CAIXA BRANCA COM SOMBRA === */}
      <div style={{ 
          backgroundColor: "#ffffff", // Cor branca limpa
          padding: "25px", 
          borderRadius: "15px", // Cantos mais redondos
          marginBottom: "40px", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)" // Sombra moderna para destacar
        }}>
        <h3 style={{ marginTop: 0, color: "#2c3e50" }}>➕ Vender Novo Artigo</h3>
        <form onSubmit={adicionarProduto} style={{ display: "flex", gap: "15px" }}>
          <input 
            type="text" 
            placeholder="Ex: Casaco Vintage Nike (Tam M)" 
            value={novoProduto} 
            onChange={(e) => setNovoProduto(e.target.value)} 
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "2px solid #eee", fontSize: "16px" }}
          />
          <button type="submit" style={{ backgroundColor: "#00b894", color: "white", padding: "12px 25px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", transition: "background 0.3s" }}>
            Publicar Venda
          </button>
        </form>
      </div>
      {/* =================================================== */}

      {/* Tabela de Produtos */}
      <h3 style={{ color: "#2c3e50" }}>📦 O teu stock:</h3>
      <div style={{ backgroundColor: "white", borderRadius: "15px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
        {produtos.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#888" }}>Ainda não tens nada à venda.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", textAlign: "left", color: "#666" }}>
                <th style={{ padding: "15px" }}>Produto</th>
                <th style={{ padding: "15px" }}>Estado</th>
                <th style={{ padding: "15px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "15px", fontWeight: "500" }}>{item.name}</td>
                  <td style={{ padding: "15px" }}>
                    <span style={{
                      padding: "5px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold",
                      backgroundColor: item.isComplete ? "#ffeaea" : "#eaffea",
                      color: item.isComplete ? "#d63031" : "#00b894"
                    }}>
                      {item.isComplete ? "🔴 Vendido" : "🟢 Disponível"}
                    </span>
                  </td>
                  <td style={{ padding: "15px", textAlign: "right" }}>
                    <button 
                      onClick={() => apagarProduto(item.id)}
                      style={{ backgroundColor: "transparent", color: "#b2bec3", border: "1px solid #dfe6e9", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", transition: "all 0.3s" }}
                      onMouseOver={(e) => {e.target.style.color = "white"; e.target.style.backgroundColor = "#d63031"; e.target.style.border = "1px solid #d63031"}}
                      onMouseOut={(e) => {e.target.style.color = "#b2bec3"; e.target.style.backgroundColor = "transparent"; e.target.style.border = "1px solid #dfe6e9"}}
                    >
                      🗑️ Apagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Backoffice;