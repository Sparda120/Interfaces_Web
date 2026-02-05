import { Link } from "react-router-dom";

function Backoffice() {
  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
      <h1>Gestão (Backoffice)</h1>
      <p>Área protegida para Criar, Editar e Apagar.</p>
      <Link to="/">Voltar ao início</Link>
    </div>
  );
}

export default Backoffice;