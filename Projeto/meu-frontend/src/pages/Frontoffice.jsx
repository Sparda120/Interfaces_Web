import { Link } from "react-router-dom";

function Frontoffice() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Lista Pública (Frontoffice)</h1>
      <p>Aqui vão aparecer as tarefas vindas da API.</p>
      <Link to="/admin">Ir para o Backoffice (Login)</Link>
    </div>
  );
}

export default Frontoffice;