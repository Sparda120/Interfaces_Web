import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Frontoffice() {
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    // CORREÇÃO: O endereço exato que vimos no teu Swagger
    fetch("http://localhost:5096/api/TodoItemApi") 
      .then((resposta) => resposta.json())
      .then((dados) => {
        console.log("Dados recebidos:", dados);
        setTarefas(dados);
      })
      .catch((erro) => {
        console.error("Erro:", erro);
        alert("Erro ao ligar à API. Confirma se o terminal preto do .NET ainda está aberto!");
      });
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>📋 Lista Pública</h1>
      
      <Link to="/admin">
        <button style={{ marginBottom: "20px", padding: "10px", cursor: "pointer" }}>
          🔐 Ir para o Backoffice
        </button>
      </Link>

      <div style={{ display: "grid", gap: "10px" }}>
        {tarefas.length === 0 ? (
          <p style={{ color: "gray" }}>
            A lista está vazia. (Isto é normal! Ainda não criámos nenhuma tarefa no Backoffice).
          </p>
        ) : (
          tarefas.map((tarefa) => (
            <div key={tarefa.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", boxShadow: "2px 2px 5px rgba(0,0,0,0.1)" }}>
              {/* Tenta mostrar 'name', 'title' ou 'titulo' para garantir que funciona */}
              <h3 style={{ margin: "0 0 10px 0" }}>
                {tarefa.name || tarefa.title || "Tarefa sem nome"}
              </h3>
              <span style={{ 
                padding: "5px 10px", 
                borderRadius: "15px", 
                backgroundColor: tarefa.isComplete ? "#d4edda" : "#f8d7da",
                color: tarefa.isComplete ? "#155724" : "#721c24",
                fontSize: "0.9em"
              }}>
                {tarefa.isComplete ? "✅ Concluída" : "⏳ Pendente"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Frontoffice;