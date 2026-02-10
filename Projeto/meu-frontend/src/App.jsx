import React, { useState, useEffect } from 'react';
import './App.css'; 

/**
 * Componente Principal: Marketplace
 * Inclui agora PAGINAÇÃO completa.
 */
export default function Marketplace() {
  
  // --- ESTADOS GLOBAIS ---
  const [anuncios, setAnuncios] = useState([]); 
  const [termoPesquisa, setTermoPesquisa] = useState(""); 
  const [user, setUser] = useState(null); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // --- ESTADOS DE PAGINAÇÃO (NOVO) ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(8); // Mostra 8 artigos por página

  // --- MODAIS ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  
  // --- DADOS TEMPORÁRIOS ---
  const [dadosArtigo, setDadosArtigo] = useState({ id: 0, titulo: '', descricao: '', preco: '', imagem: '' });
  const [artigoSelecionado, setArtigoSelecionado] = useState(null);
  const [novoComentario, setNovoComentario] = useState("");

  // --- EFEITOS ---

  // 1. Carregar Login e Dados
  useEffect(() => {
    const userGuardado = localStorage.getItem('marketplace_user');
    if (userGuardado) setUser(JSON.parse(userGuardado));
    carregarAnuncios();
  }, []);

  // 2. Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // 3. (IMPORTANTE) Reset da página ao pesquisar
  // Se o user escrever na pesquisa, voltamos à página 1 para evitar erros
  useEffect(() => {
    setPaginaAtual(1);
  }, [termoPesquisa]);

  // --- LÓGICA DE PAGINAÇÃO (MATEMÁTICA) ---
  
  // 1. Filtra primeiro (Search)
  const anunciosFiltrados = anuncios.filter(a => 
    (a.titulo || "").toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  // 2. Calcula índices para "fatiar" a lista
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  
  // 3. Obtém apenas os artigos da página atual
  const anunciosPaginados = anunciosFiltrados.slice(indexPrimeiroItem, indexUltimoItem);

  // 4. Calcula quantas páginas existem no total
  const totalPaginas = Math.ceil(anunciosFiltrados.length / itensPorPagina);

  // Mudar de página
  const mudarPagina = (numero) => setPaginaAtual(numero);

  // --- FUNÇÕES API ---
  const carregarAnuncios = async () => {
    try {
      const res = await fetch('/api/TodoItemApi');
      if (res.ok) setAnuncios(await res.json());
    } catch (e) { console.error(e); }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario) return;
    try {
      const res = await fetch(`/api/TodoItemApi/${artigoSelecionado.id}/comment`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ texto: novoComentario, username: user.username })
      });
      if (res.ok) {
        setNovoComentario("");
        carregarAnuncios();
        setMostrarDetalhes(false);
        alert("Comentário enviado!");
      }
    } catch (e) { console.error(e); }
  };

  const guardarArtigo = async (e) => {
    e.preventDefault();
    const payload = {
      id: modoEdicao ? dadosArtigo.id : 0,
      tarefa: dadosArtigo.titulo, 
      descricao: dadosArtigo.descricao,
      preco: parseFloat(dadosArtigo.preco), 
      imagem: dadosArtigo.imagem,
      concluida: false, 
      userCriacao: user.username
    };
    const url = modoEdicao ? `/api/TodoItemApi/${dadosArtigo.id}` : '/api/TodoItemApi';
    const metodo = modoEdicao ? 'PUT' : 'POST';

    await fetch(url, { method: metodo, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    carregarAnuncios();
    setMostrarModal(false);
  };

  const darLike = async (id) => {
    if (!user) return;
    if (user.role === 'visitor') return alert("O modo visitante apenas permite ver!");

    const key = `like_${id}_${user.username}`;
    if (localStorage.getItem(key)) return alert("Já gostaste deste artigo!");
    
    const res = await fetch(`/api/TodoItemApi/${id}/like`, { method: 'POST' });
    if(res.ok) {
        const dados = await res.json();
        setAnuncios(anuncios.map(a => a.id === id ? { ...a, likes: dados.likes } : a));
        localStorage.setItem(key, "true");
    }
  };

  const apagarArtigo = async (id) => {
    if(window.confirm("Apagar?")) {
        await fetch(`/api/TodoItemApi/${id}`, { method: 'DELETE' });
        carregarAnuncios();
    }
  };

  // --- UTILITÁRIOS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) return alert("Preenche os dados.");
    const role = (loginForm.username === 'admin' && loginForm.password === 'admin') ? 'admin' : 'user';
    const userData = { username: loginForm.username, role };
    setUser(userData);
    localStorage.setItem('marketplace_user', JSON.stringify(userData));
  };

  const handleVisitante = () => {
    setUser({ username: 'Visitante', role: 'visitor' });
  };

  const converterImagem = (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onloadend = () => setDadosArtigo(p => ({...p, imagem: reader.result}));
      reader.readAsDataURL(file);
    }
  };

  const prepararEdicao = (artigo) => {
    setModoEdicao(true);
    setDadosArtigo({ id: artigo.id, titulo: artigo.titulo, descricao: artigo.descricao, preco: artigo.preco, imagem: artigo.imagem });
    setMostrarModal(true);
  };

  const abrirDetalhes = (artigo) => {
    setArtigoSelecionado(artigo);
    setMostrarDetalhes(true);
    fetch(`/api/TodoItemApi/${artigo.id}/view`, { method: 'POST' });
  };

  // --- RENDER ---
  if (!user) return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Bem-vindo</h1>
        <p>Marketplace Seguro</p>
        <form onSubmit={handleLogin}>
          <input placeholder="Username" onChange={e=>setLoginForm({...loginForm, username: e.target.value})} />
          <input type="password" placeholder="Password" onChange={e=>setLoginForm({...loginForm, password: e.target.value})} />
          <button className="btn-primary" style={{width:'100%'}}>Entrar</button>
        </form>
        <button className="btn-outline" onClick={handleVisitante}>Entrar como Visitante</button>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo">🛒 Market<span>Place</span></div>
        <input className="search-bar" placeholder="🔍 Pesquisar..." value={termoPesquisa} onChange={e => setTermoPesquisa(e.target.value)} />
        <div className="user-menu">
          <button onClick={() => setDarkMode(!darkMode)} style={{background:'none', border:'none', fontSize:'1.2rem'}}>{darkMode ? '☀️' : '🌙'}</button>
          <span style={{fontWeight:'bold'}}>{user.username}</span>
          {user.role === 'admin' && <button className="btn-primary" onClick={() => { setModoEdicao(false); setDadosArtigo({}); setMostrarModal(true); }}>+ Novo</button>}
          <button className="btn-logout" onClick={() => {setUser(null); localStorage.removeItem('marketplace_user');}}>Sair</button>
        </div>
      </header>

      <main className="content">
        {/* Mostramos a lista FATIADA (anunciosPaginados) em vez da lista toda */}
        <div className="grid-anuncios">
          {anunciosPaginados.length > 0 ? (
            anunciosPaginados.map((artigo) => (
              <div key={artigo.id} className="card" onClick={() => abrirDetalhes(artigo)}>
                <div className="card-image">
                  {artigo.imagem ? <img src={artigo.imagem} alt="img" /> : <div className="placeholder-img">Sem Foto</div>}
                  <span className="price-tag">{artigo.preco} €</span>
                </div>
                <div className="card-body">
                  <h3>{artigo.titulo}</h3>
                  <div className="stats">
                      <span>👁️ {artigo.views}</span>
                      <button className="btn-like" onClick={(e) => { e.stopPropagation(); darLike(artigo.id); }}>
                          {user.role === 'visitor' ? '🤍' : '❤️'} {artigo.likes}
                      </button>
                  </div>
                  {user.role === 'admin' && (
                    <div style={{marginTop:'10px'}}>
                      <button className="btn-edit" onClick={(e) => {e.stopPropagation(); prepararEdicao(artigo);}}>✏️</button>
                      <button className="btn-danger" onClick={(e) => {e.stopPropagation(); apagarArtigo(artigo.id);}}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{gridColumn:'1/-1', textAlign:'center', marginTop:'50px', color:'var(--text-sec)'}}>
                Nenhum artigo encontrado...
            </p>
          )}
        </div>

        {/* --- PAGINAÇÃO (NOVO) --- */}
        {totalPaginas > 1 && (
            <div className="pagination-container">
                <button 
                    disabled={paginaAtual === 1} 
                    onClick={() => mudarPagina(paginaAtual - 1)}
                    className="page-btn"
                >
                    &laquo; Anterior
                </button>

                {/* Gera os números das páginas dinamicamente */}
                {[...Array(totalPaginas)].map((_, i) => (
                    <button 
                        key={i + 1}
                        onClick={() => mudarPagina(i + 1)}
                        className={`page-btn ${paginaAtual === i + 1 ? 'active' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button 
                    disabled={paginaAtual === totalPaginas} 
                    onClick={() => mudarPagina(paginaAtual + 1)}
                    className="page-btn"
                >
                    Próximo &raquo;
                </button>
            </div>
        )}
      </main>

      {/* MODAL DETALHES (Mantém igual) */}
      {mostrarDetalhes && artigoSelecionado && (
        <div className="modal-overlay" onClick={() => setMostrarDetalhes(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
             <h2>{artigoSelecionado.titulo}</h2>
             {artigoSelecionado.imagem && <img src={artigoSelecionado.imagem} style={{width:'100%', borderRadius:'8px', maxHeight:'250px', objectFit:'cover'}} />}
             <p>{artigoSelecionado.descricao}</p>
             <hr style={{borderColor:'var(--border)', margin:'20px 0'}}/>
             <h3>💬 Comentários</h3>
             <div className="comentarios-box">
               {artigoSelecionado.comentarios && artigoSelecionado.comentarios.length > 0 ? (
                 artigoSelecionado.comentarios.map(c => (
                   <div key={c.id} style={{background:'var(--bg-body)', padding:'10px', borderRadius:'6px', marginBottom:'10px'}}>
                     <strong>{c.username}</strong> <span style={{fontSize:'0.8em', opacity:0.7}}>({c.data})</span>
                     <div style={{marginTop:'4px'}}>{c.texto}</div>
                   </div>
                 ))
               ) : <p style={{color:'var(--text-sec)', padding:'10px'}}>Ainda sem comentários.</p>}
             </div>
             {user.role === 'visitor' ? (
                <div style={{textAlign:'center', padding:'10px', color:'var(--text-sec)', background:'var(--bg-body)', borderRadius:'8px'}}>
                    🔒 <b>Faz login</b> para comentar!
                </div>
             ) : (
                <form onSubmit={enviarComentario} style={{display:'flex', gap:'10px'}}>
                    <input value={novoComentario} onChange={e=>setNovoComentario(e.target.value)} placeholder="Escreve algo..." required />
                    <button className="btn-primary">Enviar</button>
                </form>
             )}
          </div>
        </div>
      )}

      {/* MODAL CRIAR/EDITAR (Mantém igual) */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modoEdicao ? 'Editar Artigo' : 'Novo Artigo'}</h2>
            <form onSubmit={guardarArtigo}>
              <input placeholder="Título" value={dadosArtigo.titulo || ''} onChange={e => setDadosArtigo({...dadosArtigo, titulo: e.target.value})} required />
              <input type="number" placeholder="Preço" value={dadosArtigo.preco || ''} onChange={e => setDadosArtigo({...dadosArtigo, preco: e.target.value})} required />
              <textarea placeholder="Descrição" value={dadosArtigo.descricao || ''} onChange={e => setDadosArtigo({...dadosArtigo, descricao: e.target.value})} />
              <input type="file" onChange={converterImagem} />
              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'15px'}}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{background:'transparent', color:'var(--text-sec)', border:'none'}}>Cancelar</button>
                <button className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}