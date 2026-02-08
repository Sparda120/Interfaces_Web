import React, { useState } from 'react';
import './App.css'; 

export default function Marketplace() {
  // Lista inicial (podes deixar vazia se preferires)
  const [anuncios, setAnuncios] = useState([
    {
        id: 1,
        titulo: "Ténis Nike",
        preco: "50",
        descricao: "Novos, nunca usados.",
        imagem: null, // Podes por um URL real aqui para testar
        likes: 12,
        views: 340
    }
  ]);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [novoArtigo, setNovoArtigo] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    imagem: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoArtigo({ ...novoArtigo, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNovoArtigo({ ...novoArtigo, imagem: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const publicarArtigo = (e) => {
    e.preventDefault();
    if (!novoArtigo.titulo || !novoArtigo.preco) return alert("Preenche os dados!");

    setAnuncios([
      ...anuncios, 
      { 
        ...novoArtigo, 
        id: Date.now(),
        likes: 0,   // Começa com 0 likes
        views: 0    // Começa com 0 visualizações
      }
    ]);
    
    setNovoArtigo({ titulo: '', descricao: '', preco: '', imagem: null });
    setMostrarFormulario(false);
  };

  // Função para dar Like
  // Função para dar Like (apenas 1 por pessoa)
  const darLike = (id) => {
    // 1. Verifica na memória do navegador se já existe um registo de like para este ID
    const jaDeuLike = localStorage.getItem(`like_no_artigo_${id}`);

    if (jaDeuLike) {
      // Se já deu like, avisa e não faz nada
      alert("Já gostaste deste artigo! Só podes dar 1 like.");
      return; 
    }

    // 2. Se não deu like, atualiza o estado visualmente
    const novosAnuncios = anuncios.map(artigo => 
      artigo.id === id ? { ...artigo, likes: artigo.likes + 1 } : artigo
    );
    setAnuncios(novosAnuncios);

    // 3. Grava na memória do navegador que esta pessoa JÁ DEU like neste artigo
    localStorage.setItem(`like_no_artigo_${id}`, "true");

    // NOTA: Aqui seria o local onde chamarias o teu Backend para salvar na base de dados
    // salvarLikeNoServidor(id); 
    // Função para contar visualização
  const verDetalhes = (id) => {
     // Atualiza visualmente
     const novosAnuncios = anuncios.map(artigo => 
      artigo.id === id ? { ...artigo, views: artigo.views + 1 } : artigo
    );
    setAnuncios(novosAnuncios);
    
    // AQUI tens de enviar para o servidor, senão ninguém mais vê que o número subiu.
    // fetch('http://teu-servidor/api/artigos/' + id + '/view', { method: 'POST' }) ...
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
          <p className="aviso-vazio">Ainda não há artigos à venda.</p>
        ) : (
          anuncios.map((artigo) => (
            <div key={artigo.id} className="cartao-artigo">
              <div className="imagem-artigo">
                {artigo.imagem ? <img src={artigo.imagem} alt={artigo.titulo} /> : <div className="sem-imagem">Sem Foto</div>}
                
                {/* Etiqueta de Preço flutuante (opcional, fica giro) */}
                <span className="tag-preco">{artigo.preco} €</span>
              </div>
              
              <div className="info-artigo">
                <div className="titulo-row">
                    <h3>{artigo.titulo}</h3>
                </div>
                
                <p className="descricao">{artigo.descricao}</p>
                
                {/* --- AQUI ESTÃO OS LIKES E VIEWS --- */}
                <div className="stats-row">
                    <div className="stat-item">
                        👁️ {artigo.views}
                    </div>
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

      {/* O FORMULÁRIO MANTÉM-SE IGUAL AO ANTERIOR... */}
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
              
              <label>Fotografia:</label>
              <input type="file" onChange={handleImageChange} />

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