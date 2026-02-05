import { BrowserRouter, Routes, Route } from "react-router-dom";
import Frontoffice from "./pages/Frontoffice";
import Login from "./pages/Login";      // <--- NOVO
import Backoffice from "./pages/Backoffice";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público (A Loja) */}
        <Route path="/" element={<Frontoffice />} />
        
        {/* Login */}
        <Route path="/admin" element={<Login />} />
        
        {/* Área Privada (Dashboard) - Vamos proteger isto depois */}
        <Route path="/admin/dashboard" element={<Backoffice />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;