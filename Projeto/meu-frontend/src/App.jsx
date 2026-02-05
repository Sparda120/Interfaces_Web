import { BrowserRouter, Routes, Route } from "react-router-dom";
import Frontoffice from "./pages/Frontoffice";
import Backoffice from "./pages/Backoffice";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Principal - Frontoffice */}
        <Route path="/" element={<Frontoffice />} />

        {/* Rota de Admin - Backoffice */}
        <Route path="/admin" element={<Backoffice />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;