import React, { useState, useEffect } from 'react';
import './App.css'; 

export default function Marketplace() {
  const [anuncios, setAnuncios] = useState([]); 
  const [termoPesquisa, setTermoPesquisa] = useState(""); 
  const [user, setUser] = useState(null); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // MODAIS
  const [mostrarModal, setMostrarModal] = useState(false); // Criação/Edição
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false); // Ver Detalhes + Comentários

  const [modoEdicao, setModoEdicao] = useState(false);
  
  // DADOS DO ARTIGO (Edição/Criação)
  const [dadosArtigo, setDadosArtigo] = useState({ id: 0, titulo: '', descricao: '', preco: '', imagem: '' });
  
  // DADOS DO ARTIGO SELECIONADO (Visualização)
  const [artigoSelecionado, setArtigoSelecionado] = useState(null);
  const [novoComentario, setNovoComentario] = useState("");

  useEffect(() => {
    const userGuardado = localStorage.getItem('marketplace_user');
    if (userGuardado) setUser(JSON.parse(userGuardado));
    carregarAnuncios();
  }, []);

  useEffect(() => {
    if (darkMode) { document.body.classList.add('dark-mode'); localStorage.setItem('theme', 'dark'); } 
    else { document.body.classList.remove('dark-mode'); localStorage.setItem('theme', 'light'); }
  }, [darkMode]);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: novoComentario, username: user.username })
      });
      if (res.ok) {
        setNovoComentario("");
        carregarAnuncios(); // Recarrega para ver o comentário novo
        setMostrarDetalhes(false); // Fecha ou mantém aberto (opcional)
        alert("Comentário enviado!");
      }
    } catch (e) { console.error(e); }
  };

  const abrirDetalhes = (artigo) => {
    setArtigoSelecionado(artigo);
    setMostrarDetalhes(true);
    // Conta a vista quando abre os detalhes
    fetch(`/api/TodoItemApi/${artigo.id}/view`, { method: 'POST' });
  };

  // ... (Manter funções darLike, apagarArtigo, guardarArtigo, converterImagem, login iguais)
  const darLike = async (id) => {
      // ... (Usa o código que já tinhas)
       if (!user) return alert("Login necessário");
       const jaDeu = localStorage.getItem(`like_${id}_${user.username}`);
       if (jaDeu) return alert("Já deste like!");
       try {
        const res = await fetch(`/api/TodoItemApi/${id}/like`, { method: 'POST' });
        if(res.ok) {
            const dados = await res.json();
            setAnuncios(anuncios.map(a => a.id === id ? { ...a, likes: dados.likes } : a));
            localStorage.setItem(`like_${id}_${user.username}`, "true");
        }
       } catch(e) {}
  };
  
  const apagarArtigo = async (id) => {
      if(!window.confirm("Apagar?")) return;
      await fetch(`/api/TodoItemApi/${id}`, { method: 'DELETE' });
      carregarAnuncios();
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

  const converterImagem = (e) => {
      const file = e.target.files[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => setDadosArtigo(p => ({...p, imagem: reader.result}));
          reader.readAsDataURL(file);
      }
  }

  const prepararEdicao = (artigo) => {
      setModoEdicao(true);
      setDadosArtigo({ id: artigo.id, titulo: artigo.titulo, descricao: artigo.descricao, preco: artigo.preco, imagem: artigo.imagem });
      setMostrarModal(true);
  }

  const handleLogin = (e) => {
      e.preventDefault();
      const userData = (loginForm.username === 'admin' && loginForm.password === 'admin') 
        ? { username: 'admin', role: 'admin' } 
        : { username: loginForm.username, role: 'user' };
      setUser(userData);
      localStorage.setItem('marketplace_user', JSON.stringify(userData));
  };
  // ... Fim das funções auxiliares

  if (!user) return (
    <div className="login-wrapper">
        <div className="login-card">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input placeholder="User" onChange={e=>setLoginForm({...loginForm, username: e.target.value})}/>
                <input type="password" placeholder="Pass" onChange={e=>setLoginForm({...loginForm, password: e.target.value})}/>
                <button className="btn-primary">Entrar</button>
            </form>
        </div>
    </div>
  );

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <header className="navbar">
        <div className="logo">🛒 Market</div>
        <input className="search-bar" placeholder="🔍 Pesquisar..." onChange={e => setTermoPesquisa(e.target.value)} />
        <div className="user-menu">
            <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️' : '🌙'}</button>
            <span>{user.username}</span>
            {user.role === 'admin' && <button className="btn-accent" onClick={() => { setModoEdicao(false); setDadosArtigo({}); setMostrarModal(true); }}>+ Novo</button>}
            <button className="btn-logout" onClick={() => {setUser(null); localStorage.removeItem('marketplace_user');}}>Sair</button>
        </div>
      </header>

      <main className="content">
        <div className="grid-anuncios">
          {anuncios.filter(a => (a.titulo||"").toLowerCase().includes(termoPesquisa.toLowerCase())).map((artigo) => (
            <div key={artigo.id} className="card" onClick={() => abrirDetalhes(artigo)}>
              <div className="card-image">
                 {artigo.imagem ? <img src={artigo.imagem} alt="img" /> : <div className="placeholder-img">Sem Foto</div>}
                 <span className="price-tag">{artigo.preco} €</span>
              </div>
              <div className="card-body">
                <h3>{artigo.titulo}</h3>
                <div className="stats">
                    <span>👁️ {artigo.views}</span>
                    <button className="btn-like" onClick={(e) => { e.stopPropagation(); darLike(artigo.id); }}>❤️ {artigo.likes}</button>
                </div>
                {user.role === 'admin' && (
                    <div className="card-actions">
                        <button className="btn-edit" onClick={(e) => {e.stopPropagation(); prepararEdicao(artigo);}}>✏️</button>
                        <button className="btn-delete" onClick={(e) => {e.stopPropagation(); apagarArtigo(artigo.id);}}>🗑️</button>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DETALHES E COMENTÁRIOS */}
      {mostrarDetalhes && artigoSelecionado && (
          <div className="modal-overlay" onClick={() => setMostrarDetalhes(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h2>{artigoSelecionado.titulo}</h2>
                  {artigoSelecionado.imagem && <img src={artigoSelecionado.imagem} style={{width:'100%', maxHeight:'200px', objectFit:'cover', borderRadius:'8px'}} />}
                  <p>{artigoSelecionado.descricao}</p>
                  <h3 style={{marginTop: '20px'}}>💬 Comentários</h3>
                  <div className="comentarios-lista" style={{maxHeight:'150px', overflowY:'auto', marginBottom:'15px'}}>
                      {artigoSelecionado.comentarios && artigoSelecionado.comentarios.length > 0 ? (
                          artigoSelecionado.comentarios.map(c => (
                              <div key={c.id} style={{background: 'var(--bg-body)', padding:'8px', borderRadius:'5px', marginBottom:'5px'}}>
                                  <strong>{c.username}</strong> <small>({c.data})</small>: <br/>
                                  {c.texto}
                              </div>
                          ))
                      ) : <p>Sê o primeiro a comentar!</p>}
                  </div>
                  <form onSubmit={enviarComentario} style={{display:'flex', gap:'5px'}}>
                      <input value={novoComentario} onChange={e=>setNovoComentario(e.target.value)} placeholder="Escreve um comentário..." style={{flex:1}} required />
                      <button type="submit" className="btn-primary" style={{width:'auto'}}>Enviar</button>
                  </form>
                  <button onClick={() => setMostrarDetalhes(false)} className="btn-text" style={{marginTop:'10px'}}>Fechar</button>
              </div>
          </div>
      )}

      {/* MODAL CRIAÇÃO/EDIÇÃO (MANTÉM O QUE TINHAS) */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modoEdicao ? 'Editar' : 'Novo'}</h2>
            <form onSubmit={guardarArtigo}>
              <input placeholder="Título" value={dadosArtigo.titulo || ''} onChange={e => setDadosArtigo({...dadosArtigo, titulo: e.target.value})} required />
              <input type="number" placeholder="Preço" value={dadosArtigo.preco || ''} onChange={e => setDadosArtigo({...dadosArtigo, preco: e.target.value})} required />
              <textarea placeholder="Descrição" value={dadosArtigo.descricao || ''} onChange={e => setDadosArtigo({...dadosArtigo, descricao: e.target.value})} />
              <input type="file" onChange={converterImagem} />
              <div className="modal-footer">
                <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit">{modoEdicao ? 'Guardar' : 'Publicar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}