let paginaAtual = 1;
let totalPaginas = 1;
const filtrosAtuais = {};

const formatarPreco = (preco) => `€${preco.toFixed(2)}`;

const adicionarAoCarrinho = (produto) => {
  console.log(`Adicionando ${produto.nome} ao carrinho`);
  
  // Obter carrinho do localStorage
  let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  
  // Verificar se produto já existe
  const index = carrinho.findIndex(item => item.id === produto.id);
  
  if (index > -1) {
    carrinho[index].quantidade += 1;
  } else {
    carrinho.push({...produto, quantidade: 1});
  }
  
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarContadorCarrinho();
  
  // Feedback visual
  alert(`${produto.nome} adicionado ao carrinho!`);
};

function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const contador = document.getElementById('cartCount');
  if (contador) {
    contador.textContent = total;
  }
}

// Função de pesquisa no header
function pesquisarHeader() {
    const searchInput = document.getElementById('searchInputHeader');
    const termo = searchInput?.value.trim();
    
    if (termo && termo.length >= 2) {
        window.location.href = `produtos.html?pesquisa=${encodeURIComponent(termo)}`;
    } else if (termo) {
        alert('Por favor, escreve pelo menos 2 caracteres');
    }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 Iniciando aplicação...');
  console.log(`📦 Total de produtos disponíveis: ${PRODUTOS_EXEMPLO.length}`);
  
  carregarFiltrosCategoria();
  lerParametrosURL();
  carregarProdutos();
  inicializarPesquisa();
  atualizarContadorCarrinho();
  
  // Se estiver na página de detalhes do produto
  if (window.location.pathname.includes('produto-detalhes.html')) {
    carregarDetalhesProduto();
  }
});

function lerParametrosURL() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("categoria")) {
    filtrosAtuais.categoria = params.get("categoria");
    atualizarTituloPagina(params.get("categoria"));
    console.log(`🔍 Filtrando por categoria: ${params.get("categoria")}`);
  }

  if (params.get("pesquisa")) {
    filtrosAtuais.pesquisa = params.get("pesquisa");
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = params.get("pesquisa");
    }
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = `Resultados para "${params.get("pesquisa")}"`;
    }
    console.log(`🔍 Pesquisando por: ${params.get("pesquisa")}`);
  }

  if (params.get("promocao")) {
    filtrosAtuais.promocao = 1;
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = "Promoções";
    }
    console.log('🔍 Filtrando promoções');
  }

  if (params.get("destaque")) {
    filtrosAtuais.destaque = 1;
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = "Destaques";
    }
    console.log('🔍 Filtrando destaques');
  }
}

function atualizarTituloPagina(categoriaSlug) {
  const categoria = CONFIG.CATEGORIAS.find((c) => c.slug === categoriaSlug);
  if (categoria) {
    const pageTitle = document.getElementById("pageTitle");
    const breadcrumbCategory = document.getElementById("breadcrumbCategory");
    
    if (pageTitle) {
      pageTitle.textContent = categoria.nome;
    }
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = categoria.nome;
    }
  }
}

function carregarFiltrosCategoria() {
  const container = document.getElementById("categoryFilters");
  if (!container) return;

  container.innerHTML =
    '<li><a href="produtos.html" class="filter-link">Todas as Categorias</a></li>' +
    CONFIG.CATEGORIAS.map(
      (cat) => `
    <li>
      <a href="produtos.html?categoria=${cat.slug}" 
         class="filter-link ${filtrosAtuais.categoria === cat.slug ? "active" : ""}">
        ${cat.icone} ${cat.nome}
      </a>
    </li>
  `
    ).join("");
}

async function carregarProdutos() {
  const container = document.getElementById("productsGrid");
  if (!container) {
    console.warn('⚠️ Container productsGrid não encontrado');
    return;
  }
  
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  // Filtrar produtos
  let produtos = filtrarProdutosExemplo();
  console.log(`✅ Produtos após filtros: ${produtos.length}`);
  
  // Paginação
  const inicio = (paginaAtual - 1) * CONFIG.PRODUCTS_PER_PAGE;
  const fim = inicio + CONFIG.PRODUCTS_PER_PAGE;
  const produtosPaginados = produtos.slice(inicio, fim);
  totalPaginas = Math.ceil(produtos.length / CONFIG.PRODUCTS_PER_PAGE);

  console.log(`📄 Página ${paginaAtual} de ${totalPaginas}`);
  console.log(`📦 Mostrando produtos ${inicio + 1} a ${Math.min(fim, produtos.length)}`);

  renderizarProdutos(container, produtosPaginados);
  atualizarContadorResultados(produtos.length);
  renderizarPaginacao();
}

function filtrarProdutosExemplo() {
  let produtos = [...PRODUTOS_EXEMPLO];
  console.log(`🔧 Iniciando filtros com ${produtos.length} produtos`);

  // Filtrar apenas produtos ativos
  produtos = produtos.filter(p => p.ativo);
  console.log(`✅ Produtos ativos: ${produtos.length}`);

  if (filtrosAtuais.categoria) {
    produtos = produtos.filter((p) => p.categoria_slug === filtrosAtuais.categoria);
    console.log(`✅ Após filtro de categoria: ${produtos.length}`);
  }

  if (filtrosAtuais.pesquisa) {
    const termo = filtrosAtuais.pesquisa.toLowerCase();
    produtos = produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.especificacoes?.toLowerCase().includes(termo)
    );
    console.log(`✅ Após pesquisa: ${produtos.length}`);
  }

  if (filtrosAtuais.promocao) {
    produtos = produtos.filter((p) => p.preco_promocional);
    console.log(`✅ Após filtro de promoção: ${produtos.length}`);
  }

  if (filtrosAtuais.destaque) {
    produtos = produtos.filter((p) => p.destaque);
    console.log(`✅ Após filtro de destaque: ${produtos.length}`);
  }

  if (filtrosAtuais.preco_min) {
    produtos = produtos.filter(
      (p) => (p.preco_promocional || p.preco) >= parseFloat(filtrosAtuais.preco_min)
    );
    console.log(`✅ Após filtro preço mínimo: ${produtos.length}`);
  }

  if (filtrosAtuais.preco_max) {
    produtos = produtos.filter(
      (p) => (p.preco_promocional || p.preco) <= parseFloat(filtrosAtuais.preco_max)
    );
    console.log(`✅ Após filtro preço máximo: ${produtos.length}`);
  }

  if (filtrosAtuais.ordenar) {
    switch (filtrosAtuais.ordenar) {
      case "preco-asc":
        produtos.sort((a, b) => (a.preco_promocional || a.preco) - (b.preco_promocional || b.preco));
        break;
      case "preco-desc":
        produtos.sort((a, b) => (b.preco_promocional || b.preco) - (a.preco_promocional || a.preco));
        break;
      case "nome-asc":
        produtos.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case "nome-desc":
        produtos.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
    }
  }

  return produtos;
}

function renderizarProdutos(container, produtos) {
  if (produtos.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <h3>Nenhum produto encontrado</h3>
        <p>Tente ajustar os filtros ou pesquisar por outro termo.</p>
        <a href="produtos.html" class="btn btn-primary">Ver Todos os Produtos</a>
      </div>
    `;
    return;
  }

  container.innerHTML = produtos
    .map(
      (produto) => `
        <div class="product-card">
          <div class="product-image">
            ${produto.preco_promocional ? '<span class="product-badge" style="background: #e63946;">Promoção</span>' : ""}
            ${produto.destaque && !produto.preco_promocional ? '<span class="product-badge destaque" style="background: #f4a261;">Destaque</span>' : ""}
            <a href="produto-detalhes.html?id=${produto.id}">
              <img src="${produto.imagem}" 
                   alt="${produto.nome}"
                   onerror="this.src='https://via.placeholder.com/300x300/1d3557/ffffff?text=${encodeURIComponent(produto.nome.substring(0, 20))}'">
            </a>
          </div>
          <div class="product-info">
            <span class="product-category">${produto.categoria}</span>
            <h3 class="product-name">
              <a href="produto-detalhes.html?id=${produto.id}">${produto.nome}</a>
            </h3>
            <p class="product-specs">${produto.especificacoes}</p>
            <div class="product-footer">
              <div class="product-price">
                ${
                  produto.preco_promocional
                    ? `<span class="old-price">${formatarPreco(produto.preco)}</span>`
                    : ""
                }
                <span class="current-price">${formatarPreco(produto.preco_promocional || produto.preco)}</span>
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function atualizarContadorResultados(count) {
  const el = document.getElementById("resultsCount");
  if (el) {
    el.textContent = `${count} produto${count !== 1 ? "s" : ""}`;
  }
}

function renderizarPaginacao() {
  const container = document.getElementById("pagination");
  if (!container) return;
  
  if (totalPaginas <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";

  if (paginaAtual > 1) {
    html += `<button onclick="mudarPagina(${paginaAtual - 1})" class="btn-pagination">« Anterior</button>`;
  }

  // Mostrar até 5 páginas de cada vez
  let startPage = Math.max(1, paginaAtual - 2);
  let endPage = Math.min(totalPaginas, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  if (startPage > 1) {
    html += `<button onclick="mudarPagina(1)" class="btn-pagination">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination-dots">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="btn-pagination ${i === paginaAtual ? "active" : ""}" onclick="mudarPagina(${i})">${i}</button>`;
  }

  if (endPage < totalPaginas) {
    if (endPage < totalPaginas - 1) {
      html += `<span class="pagination-dots">...</span>`;
    }
    html += `<button onclick="mudarPagina(${totalPaginas})" class="btn-pagination">${totalPaginas}</button>`;
  }

  if (paginaAtual < totalPaginas) {
    html += `<button onclick="mudarPagina(${paginaAtual + 1})" class="btn-pagination">Próxima »</button>`;
  }

  container.innerHTML = html;
}

function mudarPagina(pagina) {
  paginaAtual = pagina;
  carregarProdutos();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function ordenarProdutos() {
  const ordem = document.getElementById("sortSelect")?.value;
  if (ordem) {
    filtrosAtuais.ordenar = ordem;
    paginaAtual = 1; 
    carregarProdutos();
  }
}

function aplicarFiltroPeco() {
  const min = document.getElementById("priceMin")?.value;
  const max = document.getElementById("priceMax")?.value;

  if (min) filtrosAtuais.preco_min = min;
  else delete filtrosAtuais.preco_min;
  
  if (max) filtrosAtuais.preco_max = max;
  else delete filtrosAtuais.preco_max;

  paginaAtual = 1; 
  carregarProdutos();
}

function limparFiltros() {
  window.location.href = 'produtos.html';
}

function inicializarPesquisa() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter" && searchInput.value.trim().length >= 2) {
        window.location.href = `produtos.html?pesquisa=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      if (searchInput?.value.trim().length >= 2) {
        window.location.href = `produtos.html?pesquisa=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
}

function carregarDetalhesProduto() {
  const params = new URLSearchParams(window.location.search);
  const produtoId = params.get('id');
  
  console.log(`📦 Carregando produto ID: ${produtoId}`);
  
  if (!produtoId) {
    console.warn('⚠️ ID do produto não fornecido');
    window.location.href = 'produtos.html';
    return;
  }
  
  const produto = obterProdutoPorId(produtoId);
  
  if (!produto) {
    console.error(`❌ Produto ID ${produtoId} não encontrado`);
    window.location.href = 'produtos.html';
    return;
  }
  
  console.log(`✅ Produto encontrado: ${produto.nome}`);
  
  document.getElementById('productBreadcrumb').textContent = produto.nome;
  document.getElementById('productCategory').textContent = produto.categoria;
  document.getElementById('productName').textContent = produto.nome;
  
  const precoElement = document.getElementById('productPrice');
  if (produto.preco_promocional) {
    precoElement.innerHTML = `
      <span style="text-decoration: line-through; color: #666; font-size: 1.2rem;">${formatarPreco(produto.preco)}</span>
      <span style="color: #e63946; font-size: 2rem; font-weight: bold;">${formatarPreco(produto.preco_promocional)}</span>
    `;
  } else {
    precoElement.innerHTML = `<span style="font-size: 2rem; font-weight: bold;">${formatarPreco(produto.preco)}</span>`;
  }
  
  const imgElement = document.getElementById('productImage');
  imgElement.src = produto.imagem;
  imgElement.alt = produto.nome;
  imgElement.onerror = function() {
    this.src = `https://via.placeholder.com/600x600/1d3557/ffffff?text=${encodeURIComponent(produto.nome.substring(0, 30))}`;
  };
  
  // Características
  const featuresElement = document.getElementById('productFeatures');
  if (produto.caracteristicas && produto.caracteristicas.length > 0) {
    featuresElement.innerHTML = produto.caracteristicas
      .map(feature => `<li>${feature}</li>`)
      .join('');
  } else {
    featuresElement.innerHTML = `<li>${produto.especificacoes}</li>`;
  }
}

function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (overlay) {
    overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
    if (overlay.style.display === 'flex') {
      document.getElementById('searchInput')?.focus();
    }
  }
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  
  if (sidebar && overlay) {
    const isOpen = sidebar.classList.contains('active');
    
    if (isOpen) {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    } else {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      carregarCarrinho();
    }
  }
}

function carregarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  const container = document.getElementById('cartItems');
  const totalElement = document.getElementById('cartTotal');
  
  if (!container) return;
  
  if (carrinho.length === 0) {
    container.innerHTML = '<div class="empty-cart"><p>O seu carrinho está vazio</p></div>';
    if (totalElement) totalElement.textContent = '€0,00';
    return;
  }
  
  let total = 0;
  container.innerHTML = carrinho.map(item => {
    const preco = item.preco_promocional || item.preco;
    const subtotal = preco * item.quantidade;
    total += subtotal;
    
    return `
      <div class="cart-item">
        <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='https://via.placeholder.com/60x60/1d3557/ffffff?text=Produto'">
        <div class="cart-item-info">
          <h4>${item.nome}</h4>
          <p>${formatarPreco(preco)} x ${item.quantidade}</p>
        </div>
        <button onclick="removerDoCarrinho(${item.id})" class="btn-remove">×</button>
      </div>
    `;
  }).join('');
  
  if (totalElement) {
    totalElement.textContent = formatarPreco(total);
  }
}

function removerDoCarrinho(produtoId) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  carrinho = carrinho.filter(item => item.id !== produtoId);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  carregarCarrinho();
  atualizarContadorCarrinho();
}

function filterProductsPage() {
  console.log('Filtros de checkbox ativados');
}