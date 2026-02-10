import React, { useState, useEffect } from 'react';
import './App.css'; 

export default function Marketplace() {
  // --- ESTADOS DE DADOS ---
  const [anuncios, setAnuncios] = useState([]); 
  
  // --- ESTADOS DE LOGIN E NAVEGAÇÃO ---
  const [user, setUser] = useState(null); // Guardar quem está logado
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [mostrarFormVenda, setMostrarFormVenda] = useState(false);

  // --- ESTADO DO FORMULÁRIO DE VENDA ---
  const [novoArtigo, setNovoArtigo] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    imagem: '' 
  });

  // Ao iniciar, tenta carregar anúncios
  useEffect(() => {
    carregarAnuncios();
  }, []);

  // --- FUNÇÕES DE API ---

  const carregarAnuncios = async () => {
    try {
      const resposta = await fetch('/api/TodoItemApi');
      if (resposta.ok) {
        const dados = await resposta.json();
        setAnuncios(dados);
      }
    } catch (erro) {
      console.error("Erro backend:", erro);
    }
  };

  const publicarArtigo = async (e) => {
    e.preventDefault();
    
    // CORREÇÃO DO ERRO: Enviar 'UserCriacao' e garantir tipos certos
    const payload = {
      tarefa: novoArtigo.titulo, 
      descricao: novoArtigo.descricao,
      preco: parseFloat(novoArtigo.preco), // Garante que é número
      imagem: novoArtigo.imagem,
      concluida: false,
      userCriacao: user.username, // <--- IMPORTANTE: Diz quem criou!
      likes: 0,
      views: 0
    };

    try {
      const resposta = await fetch('/api/TodoItemApi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resposta.ok) {
        alert("Anúncio criado com sucesso!");
        carregarAnuncios();
        setNovoArtigo({ titulo: '', descricao: '', preco: '', imagem: '' });
        setMostrarFormVenda(false);
      } else {
        // Se der erro, tenta ler a mensagem do servidor
        const erroTexto = await resposta.text();
        console.error("Detalhe do erro:", erroTexto);
        alert("Erro ao gravar! Vê a consola do browser (F12) para detalhes.");
      }
    } catch (erro) {
      console.error(erro);
      alert("Erro de ligação ao servidor.");
    }
  };

  // --- FUNÇÃO DE APAGAR (SÓ PARA ADMIN) ---
  const apagarArtigo = async (id) => {
    if (!window.confirm("Tens a certeza que queres apagar?")) return;

    try {
      const resposta = await fetch(`/api/TodoItemApi/${id}`, { method: 'DELETE' });
      if (resposta.ok) {
        setAnuncios(anuncios.filter(a => a.id !== id));
      } else {
        alert("Erro ao apagar.");
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  // --- UTILITÁRIOS ---
  const converterImagem = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Pequena validação de tamanho (max 2MB para não crashar)
      if (file.size > 2000000) {
        alert("Imagem muito grande! Escolhe uma com menos de 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovoArtigo(prev => ({ ...prev, imagem: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // LOGIN SIMULADO (FAKE AUTH)
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      setUser({ username: 'admin', role: 'admin' });
    } else {
      setUser({ username: loginForm.username, role: 'user' });
    }
  };

  // --- RENDERIZAÇÃO ---

  // 1. ECRÃ DE LOGIN (Se não estiver logado)
  if (!user) {
    return (
      <div className="login-container" style={{ padding: '50px', textAlign: 'center' }}>
        <h2>🔐 Login no Marketplace</h2>
        <p>Admin: user="admin" pass="admin" | User: user="user" pass="user"</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
          <input 
            type="text" placeholder="Username" 
            value={loginForm.username} 
            onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
          />
          <input 
            type="password" placeholder="Password" 
            value={loginForm.password} 
            onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
          />
          <button type="submit" className="btn-confirmar">Entrar</button>
        </form>
      </div>
    );
  }

  // 2. ECRÃ PRINCIPAL (Marketplace)
  return (
    <div className="marketplace-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🛒 Marketplace</h1>
          <small>Bem-vindo, {user.username} ({user.role === 'admin' ? 'Administrador' : 'Cliente'})</small>
        </div>
        <div>
          {/* SÓ MOSTRA BOTÃO DE VENDER SE FOR ADMIN OU QUISERES QUE TODOS VENDAM */}
          <button className="btn-vender" onClick={() => setMostrarFormVenda(true)}>
            + Vender Artigo
          </button>
          <button onClick={() => setUser(null)} style={{ marginLeft: '10px', background: '#e74c3c' }}>Sair</button>
        </div>
      </header>

      <main className="grid-anuncios">
        {anuncios.map((artigo) => (
          <div key={artigo.id} className="cartao-artigo">
            <div className="imagem-artigo">
               {artigo.imagem ? (
                  <img src={artigo.imagem} alt="artigo" style={{width: '100%', height: '150px', objectFit: 'cover'}} />
               ) : <div className="sem-imagem">Sem Foto</div>}
               <span className="tag-preco">{artigo.preco} €</span>
            </div>
            
            <div className="info-artigo">
              <h3>{artigo.titulo || artigo.tarefa}</h3>
              <p>{artigo.descricao}</p>
              
              {/* ZONA DE BOTÕES */}
              <div className="actions-row" style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                
                {/* BOTÕES COMUNS (User e Admin) */}
                <button className="btn-comprar">Comprar</button>

                {/* BOTÕES SÓ DE ADMIN */}
                {user.role === 'admin' && (
                  <button 
                    onClick={() => apagarArtigo(artigo.id)}
                    style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}
                  >
                    🗑️ Apagar
                  </button>
                )}
              </div>
              <small style={{ fontSize: '10px', color: '#666' }}>Vendedor: {artigo.userCriacao || 'Anon'}</small>
            </div>
          </div>
        ))}
      </main>

      {/* MODAL DE VENDA */}
      {mostrarFormVenda && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Novo Anúncio</h2>
            <form onSubmit={publicarArtigo}>
              <label>Título:</label>
              <input type="text" onChange={e => setNovoArtigo({...novoArtigo, titulo: e.target.value})} required />
              
              <label>Preço (€):</label>
              <input type="number" onChange={e => setNovoArtigo({...novoArtigo, preco: e.target.value})} required />
              
              <label>Descrição:</label>
              <textarea onChange={e => setNovoArtigo({...novoArtigo, descricao: e.target.value})} />
              
              <label>Imagem:</label>
              <input type="file" accept="image/*" onChange={converterImagem} />

              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarFormVenda(false)}>Cancelar</button>
                <button type="submit">Publicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}