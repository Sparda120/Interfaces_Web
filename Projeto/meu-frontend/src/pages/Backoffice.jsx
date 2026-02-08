import React, { useState, useEffect } from 'react';
import './App.css'; 

export default function Marketplace() {
  const [anuncios, setAnuncios] = useState([]); // Começa vazio, vai buscar à BD
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoArtigo, setNovoArtigo] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    imagem: '' // Agora é uma string (URL)
  });

  // --- 1. CARREGAR DADOS DO SERVIDOR (Ao iniciar) ---
  useEffect(() => {
    carregarAnuncios();
  }, []);

  const carregarAnuncios = async () => {
    try {
      const resposta = await fetch('/api/TodoItemApi');
      if (resposta.ok) {
        const dados = await resposta.json();
        setAnuncios(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar:", erro);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoArtigo({ ...novoArtigo, [name]: value });
  };

  // --- 2. GRAVAR NO SERVIDOR ---
  const publicarArtigo = async (e) => {
    e.preventDefault();
    if (!novoArtigo.titulo || !novoArtigo.preco) return alert("Preenche os dados!");

    // O Backend espera "Tarefa" em vez de "Titulo", fazemos a conversão aqui:
    const payload = {
      tarefa: novoArtigo.titulo, 
      descricao: novoArtigo.descricao,
      preco: parseFloat(novoArtigo.preco),
      imagem: novoArtigo.imagem,
      concluida: false
    };

    try {
      const resposta = await fetch('/api/TodoItemApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resposta.ok) {
        // Recarrega a lista do servidor para garantir que temos o ID correto
        carregarAnuncios();
        setNovoArtigo({ titulo: '', descricao: '', preco: '', imagem: '' });
        setMostrarFormulario(false);
      } else {
        alert("Erro ao gravar. Verifica se estás logado ou se o servidor está a correr.");
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  // --- 3. DAR LIKE REAL ---
  const darLike = async (id) => {
    // Primeiro verificamos localmente para feedback imediato
    const jaDeuLike = localStorage.getItem(`like_${id}`);
    if (jaDeuLike) return alert("Já deste like!");

    try {
      const resposta = await fetch(`/api/TodoItemApi/${id}/like`, { method: 'POST' });
      if (resposta.ok) {
        const dados = await resposta.json();
        // Atualiza a lista com o novo numero de likes
        setAnuncios(anuncios.map(a => a.id === id ? { ...a, likes: dados.likes } : a));
        localStorage.setItem(`like_${id}`, "true");
      } else {
        alert("Precisas de fazer login para dar like.");
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  return (
    <div className="marketplace-container">
      <header className="header">
        <h1>🛒 Marketplace</h1>
        <button className="btn-vender" onClick={() => setMostrarFormulario(true)}>
          + Vender Artigo
        </button>
      </header>

      <main className="grid-anuncios">
        {anuncios.length === 0 ? (
          <p className="aviso-vazio">A carregar anúncios ou lista vazia...</p>
        ) : (
          anuncios.map((artigo) => (
            <div key={artigo.id} className="cartao-artigo">
              <div className="imagem-artigo">
                {artigo.imagem ? (
                    <img src={artigo.imagem} alt={artigo.titulo || artigo.tarefa} onError={(e) => e.target.style.display='none'} />
                ) : <div className="sem-imagem">Sem Foto</div>}
                <span className="tag-preco">{artigo.preco} €</span>
              </div>
              <div className="info-artigo">
                <h3>{artigo.titulo || artigo.tarefa}</h3>
                <p className="descricao">{artigo.descricao}</p>
                <div className="stats-row">
                    <div className="stat-item">👁️ {artigo.views}</div>
                    <button className="btn-like" onClick={() => darLike(artigo.id)}>
                        ❤️ {artigo.likes}
                    </button>
                </div>
                <button className="btn-comprar">Comprar Agora</button>
              </div>
            </div>
          ))
        )}
      </main>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Vender Novo Artigo</h2>
            <form onSubmit={publicarArtigo}>
              <label>Título:</label>
              <input type="text" name="titulo" value={novoArtigo.titulo} onChange={handleInputChange} required />
              
              <label>Preço (€):</label>
              <input type="number" name="preco" value={novoArtigo.preco} onChange={handleInputChange} required />
              
              <label>Descrição:</label>
              <textarea name="descricao" value={novoArtigo.descricao} onChange={handleInputChange} />
              
              <label>URL da Fotografia (Link da net):</label>
              <input type="text" name="imagem" placeholder="https://..." value={novoArtigo.imagem} onChange={handleInputChange} />

              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarFormulario(false)} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-confirmar">Publicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}