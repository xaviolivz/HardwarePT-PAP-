// auth.js - Registo + Login + Header dinâmico + Dashboard Admin + Redirecionamento

document.addEventListener('DOMContentLoaded', () => {
  // Atualiza o header imediatamente (em todas as páginas)
  atualizarHeader();

  // Verifica sessão ativa no servidor (atualiza header com dados reais)
  verificarSessao();

  // Registo (se estiver na página de registo)
  const formRegisto = document.getElementById('form-registo');
  if (formRegisto) {
    const errorEl = document.getElementById('mensagem-erro') || document.createElement('div');
    const successEl = document.getElementById('mensagem-sucesso') || document.createElement('div');

    formRegisto.addEventListener('submit', async (e) => {
      e.preventDefault();

      errorEl.textContent = '';
      successEl.textContent = '';

      const nome = document.getElementById('nome')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const password = document.getElementById('password')?.value;
      const telefone = document.getElementById('telefone')?.value.trim() || null;

      if (!nome || !email || !password) {
        errorEl.textContent = 'Preenche nome, email e password obrigatórios.';
        errorEl.style.color = 'red';
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/registo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, password, telefone }),
          credentials: 'include'
        });

        const data = await response.json();

        if (data.sucesso) {
          successEl.textContent = data.mensagem || 'Conta criada com sucesso!';
          successEl.style.color = 'green';

          // Atualiza header com o nome (sem redirecionar ainda)
          atualizarHeader(data.utilizador);

          // Redireciona para index.html após 1.5 segundos
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          errorEl.textContent = data.mensagem || 'Erro ao criar conta.';
          errorEl.style.color = 'red';
        }
      } catch (error) {
        console.error('Erro no registo:', error);
        errorEl.textContent = 'Erro de ligação ao servidor.';
        errorEl.style.color = 'red';
      }
    });
  }

  // Login (se estiver na página de login)
  const formLogin = document.getElementById('loginForm');
  if (formLogin) {
    const errorEl = document.getElementById('error-message');
    const successEl = document.getElementById('success-message');

    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      errorEl.textContent = '';
      successEl.textContent = '';

      const email = document.getElementById('loginEmail')?.value.trim();
      const password = document.getElementById('loginPassword')?.value;

      if (!email || !password) {
        errorEl.textContent = 'Preenche email e palavra-passe.';
        errorEl.style.color = 'red';
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });

        const data = await response.json();

        if (data.sucesso) {
          successEl.textContent = 'Login efetuado com sucesso!';
          successEl.style.color = 'green';

          // Atualiza header com o nome
          atualizarHeader(data.utilizador);

          // Redireciona baseado no tipo de utilizador
          setTimeout(() => {
            if (data.utilizador && data.utilizador.is_admin) {
              window.location.href = 'admin/dashboard.html';
            } else {
              window.location.href = 'index.html';
            }
          }, 1500);
        } else {
          errorEl.textContent = data.mensagem || 'Email ou palavra-passe incorretos.';
          errorEl.style.color = 'red';
        }
      } catch (error) {
        console.error('Erro no login:', error);
        errorEl.textContent = 'Erro de ligação ao servidor.';
        errorEl.style.color = 'red';
      }
    });
  }

  // Se estiver na página perfil.html → carrega dados completos
  if (window.location.pathname.includes('perfil.html')) {
    carregarPerfil();
  }

  // Se estiver no dashboard → proteger página
  if (window.location.pathname.includes('dashboard.html')) {
    protegerPaginaAdmin();
  }
});

// Verifica sessão no servidor e atualiza header
async function verificarSessao() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/verificar', {
      credentials: 'include'
    });
    const data = await response.json();

    atualizarHeader(data.autenticado ? data.utilizador : null);
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    atualizarHeader(null);
  }
}

// Atualiza o header com menu dinâmico (Login / Perfil / Dashboard + Logout)
function atualizarHeader(user) {
  const userMenu = document.getElementById('userMenu');
  
  // Se não existir o userMenu, usa o método antigo (só nome)
  if (!userMenu) {
    const userNameEl = document.getElementById('userName');
    const userLink = document.getElementById('user-link');

    if (user && user.nome) {
      if (userNameEl) userNameEl.textContent = user.nome.split(' ')[0];
      if (userLink) userLink.href = 'perfil.html';
    } else {
      if (userNameEl) userNameEl.textContent = 'Login';
      if (userLink) userLink.href = 'login.html';
    }
    return;
  }

  // Menu novo - MANTÉM SEMPRE O ÍCONE
  if (!user) {
    // Sem login - Ícone leva para login
    userMenu.innerHTML = `
      <a href="login.html" class="login-btn" title="Entrar na conta">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </a>
    `;
    return;
  }

  // Utilizador logado
  const primeiroNome = user.nome ? user.nome.split(' ')[0] : user.email;
  
  if (user.is_admin || user.role === 'admin') {
    // ADMIN - Ícone + Dashboard + Logout
    userMenu.innerHTML = `
      <div class="user-menu-content">
        <a href="perfil.html" class="login-btn" title="Meu perfil">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </a>
        <a href="admin/dashboard.html" class="dashboard-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Dashboard
        </a>
      </div>
    `;
  } else {
    // USER NORMAL - Ícone + Logout
    userMenu.innerHTML = `
      <div class="user-menu-content">
        <a href="perfil.html" class="login-btn" title="Meu perfil">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </a>
      </div>
    `;
  }
}

// Carrega dados completos do perfil (da BD)
async function carregarPerfil() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/verificar', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.autenticado) {
      document.getElementById('perfil-nome').textContent = data.utilizador.nome;
      document.getElementById('perfil-email').textContent = data.utilizador.email;
      
      // Se tiver telefone e morada
      if (document.getElementById('perfil-telefone') && data.utilizador.telefone) {
        document.getElementById('perfil-telefone').textContent = data.utilizador.telefone;
      }
      if (document.getElementById('perfil-morada') && data.utilizador.morada) {
        document.getElementById('perfil-morada').textContent = data.utilizador.morada;
      }
    } else {
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    window.location.href = 'login.html';
  }
}

// Proteger páginas de administrador
async function protegerPaginaAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/verificar', {
      credentials: 'include'
    });
    const data = await response.json();

    if (!data.autenticado) {
      alert('Por favor, faça login para aceder a esta página');
      window.location.href = '../login.html';
      return false;
    }

    if (!data.utilizador.is_admin && data.utilizador.role !== 'admin') {
      alert('Acesso negado! Apenas administradores podem aceder a esta página.');
      window.location.href = '../index.html';
      return false;
    }

    console.log('✅ Acesso autorizado ao dashboard');
    return true;
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    window.location.href = '../login.html';
    return false;
  }
}

// Verificar se o utilizador é admin (função auxiliar)
function isAdmin() {
  // Esta função agora é assíncrona via verificarSessao()
  // Mantida para compatibilidade, mas usa verificarSessao() em vez disso
  return false;
}

// Logout
window.logout = async () => {
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    alert('Sessão terminada com sucesso!');
  } catch (error) {
    console.error('Erro no logout:', error);
  }
  window.location.href = 'login.html';
};

console.log('🔐 Sistema de autenticação carregado');

// Verificar autenticação em todas as páginas
async function verificarAutenticacao() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/verificar', {
            credentials: 'include' // Importante para enviar cookies
        });
        
        const data = await response.json();
        
        if (data.autenticado && data.utilizador) {
            // Utilizador está autenticado
            atualizarUIAutenticado(data.utilizador);
            return data.utilizador;
        } else {
            // Utilizador não está autenticado
            atualizarUIDesautenticado();
            return null;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        atualizarUIDesautenticado();
        return null;
    }
}

// Atualizar UI quando utilizador está autenticado
function atualizarUIAutenticado(utilizador) {
    // Atualizar botões do header
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="user-dropdown-btn" onclick="toggleUserMenu()">
                    <i class="fas fa-user-circle"></i>
                    <span>${utilizador.nome.split(' ')[0]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <a href="perfil.html">
                        <i class="fas fa-user"></i>
                        Meu Perfil
                    </a>
                    <a href="minhas-compras.html">
                        <i class="fas fa-shopping-bag"></i>
                        Minhas Compras
                    </a>
                    ${utilizador.is_admin || utilizador.role === 'admin' ? `
                        <a href="admin/dashboard.html">
                            <i class="fas fa-cog"></i>
                            Admin
                        </a>
                    ` : ''}
                    <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e5e5e5;">
                    <a href="#" onclick="logout(); return false;" style="color: #ef4444;">
                        <i class="fas fa-sign-out-alt"></i>
                        Sair
                    </a>
                </div>
            </div>
        `;
    }
    
    // Se estiver em página que precisa de autenticação
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = utilizador.nome;
    }
    
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = utilizador.email;
    }
}

// Atualizar UI quando utilizador não está autenticado
function atualizarUIDesautenticado() {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-secondary">Entrar</a>
            <a href="registo.html" class="btn btn-primary">Registar</a>
        `;
    }
}

// Toggle do menu dropdown do utilizador
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && !userMenu?.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Função de logout
async function logout() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        window.location.href = 'index.html';
    }
}

// Verificar autenticação ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
    carregarPromocoesHome(); 
});

async function carregarPromocoesHome() {
  const grid = document.querySelector(".deals-grid");
  if (!grid) return; // não está na home → sai

  try {
    const res = await fetch("/api/promocoes");
    const produtos = await res.json();

    if (!produtos.length) {
      grid.innerHTML = "<p>Sem promoções ativas</p>";
      return;
    }

    grid.innerHTML = produtos.map(p => `
      <div class="deal-card">
        <img src="${p.imagem}" alt="${p.nome}">
        <h3>${p.nome}</h3>
        <p>
          <span style="text-decoration: line-through;">
            €${Number(p.preco).toFixed(2)}
          </span>
          <strong style="color:#e63946;">
            €${Number(p.preco_promocional).toFixed(2)}
          </strong>
        </p>
      </div>
    `).join("");

  } catch (e) {
    console.error("Erro promoções:", e);
    grid.innerHTML = "<p>Erro ao carregar promoções</p>";
  }
}
