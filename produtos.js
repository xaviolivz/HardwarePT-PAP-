let paginaAtual = 1;
let totalPaginas = 1;
const filtrosAtuais = {};

const CONFIG = {
  CATEGORIAS: [
    { slug: "processadores", nome: "Processadores", icone: "🖥️" },
    { slug: "placas-graficas", nome: "Placas Gráficas", icone: "🎮" },
    { slug: "memoria", nome: "Memória", icone: "💾" },
    { slug: "armazenamento", nome: "Armazenamento", icone: "📀" },
  ],
  PRODUCTS_PER_PAGE: 10,
};

const PRODUTOS_EXEMPLO = [
  { id: 1, nome: "Intel Core i9-14900K", categoria: "Processadores", preco: 589.99, especificacoes: "24 cores", imagem: "/placeholder.jpg" },
];

const HardwarePTAPI = {
  listarProdutos: async (params) => {
    return { sucesso: true, produtos: PRODUTOS_EXEMPLO, total_paginas: 1 };
  },
};

const formatarPreco = (preco) => `€${preco.toFixed(2)}`;

const adicionarAoCarrinho = (produto) => {
  console.log(`Adicionando ${produto.nome}`);
};

document.addEventListener("DOMContentLoaded", () => {
  carregarFiltrosCategoria();
  lerParametrosURL();
  carregarProdutos();
  inicializarPesquisa();
});

function lerParametrosURL() {
  const params = new URLSearchParams(window.location.search)

  if (params.get("categoria")) {
    filtrosAtuais.categoria = params.get("categoria")
    atualizarTituloPagina(params.get("categoria"))
  }

  if (params.get("pesquisa")) {
    filtrosAtuais.pesquisa = params.get("pesquisa")
    document.getElementById("searchInput").value = params.get("pesquisa")
    document.getElementById("pageTitle").textContent = `Resultados para "${params.get("pesquisa")}"`
  }

  if (params.get("promocao")) {
    filtrosAtuais.promocao = 1
    document.getElementById("pageTitle").textContent = "Promoções"
  }

  if (params.get("destaque")) {
    filtrosAtuais.destaque = 1
    document.getElementById("pageTitle").textContent = "Destaques"
  }
}

function atualizarTituloPagina(categoriaSlug) {
  const categoria = CONFIG.CATEGORIAS.find((c) => c.slug === categoriaSlug)
  if (categoria) {
    document.getElementById("pageTitle").textContent = categoria.nome
    document.getElementById("breadcrumbCategory").textContent = categoria.nome
  }
}

function carregarFiltrosCategoria() {
  const container = document.getElementById("categoryFilters")
  if (!container) return

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
  `,
    ).join("")
}

async function carregarProdutos() {
  const container = document.getElementById("productsGrid");
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    console.log('🔄 Carregando produtos da API...');
    const response = await fetch('http://localhost:3000/api/produtos');
    
    if (!response.ok) {
      throw new Error('Erro ao carregar produtos');
    }
    
    const todosProdutos = await response.json();
    console.log('✅ Produtos recebidos da API:', todosProdutos.length);
    
    // Aplicar filtros
    let produtosFiltrados = [...todosProdutos];
    
    if (filtrosAtuais.categoria) {
      produtosFiltrados = produtosFiltrados.filter(p => {
        const categoriaSlug = p.categoria?.toLowerCase().replace(/\s+/g, '-');
        return categoriaSlug === filtrosAtuais.categoria;
      });
    }
    
    if (filtrosAtuais.promocao) {
      produtosFiltrados = produtosFiltrados.filter(p => p.preco_promocional);
    }
    
    if (filtrosAtuais.destaque) {
      produtosFiltrados = produtosFiltrados.filter(p => p.destaque);
    }
    
    // Calcular paginação
    const totalProdutos = produtosFiltrados.length;
    totalPaginas = Math.ceil(totalProdutos / CONFIG.PRODUCTS_PER_PAGE);
    
    // Pegar produtos da página atual
    const inicio = (paginaAtual - 1) * CONFIG.PRODUCTS_PER_PAGE;
    const fim = inicio + CONFIG.PRODUCTS_PER_PAGE;
    const produtosPagina = produtosFiltrados.slice(inicio, fim);
    
    console.log(`📄 Página ${paginaAtual}/${totalPaginas} - Mostrando ${produtosPagina.length} produtos`);
    
    renderizarProdutos(container, produtosPagina);
    atualizarContadorResultados(totalProdutos);
    renderizarPaginacao();
    
  } catch (error) {
    console.error('❌ Erro ao carregar produtos:', error);
    container.innerHTML = `
      <div class="empty-state">
        <h3>Erro ao carregar produtos</h3>
        <p>${error.message}</p>
        <button onclick="carregarProdutos()" class="btn btn-primary">Tentar Novamente</button>
      </div>
    `;
  }
}

function filtrarProdutosExemplo() {
  let produtos = [...PRODUTOS_EXEMPLO]

  if (filtrosAtuais.categoria) {
    produtos = produtos.filter((p) => p.categoria_slug === filtrosAtuais.categoria)
  }

  if (filtrosAtuais.pesquisa) {
    const termo = filtrosAtuais.pesquisa.toLowerCase()
    produtos = produtos.filter(
    )
  }

  if (filtrosAtuais.promocao) {
    produtos = produtos.filter((p) => p.preco_promocional)
  }

  if (filtrosAtuais.destaque) {
    produtos = produtos.filter((p) => p.destaque)
  }

  return produtos
}

function renderizarProdutos(container, produtos) {
  if (produtos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
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
            ${produto.preco_promocional ? '<span class="product-badge">Promoção</span>' : ""}
            <a href="produto-detalhes.html?id=${produto.id}">
              <img src="${produto.imagem || "/placeholder.svg?height=200&width=200&query=" + encodeURIComponent(produto.nome)}"
                   alt="${produto.nome}">
            </a>
          </div>
          <div class="product-info">
            <span class="product-category">${produto.categoria || ""}</span>
            <h3 class="product-name">
              <a href="produto-detalhes.html?id=${produto.id}">${produto.nome}</a>
            </h3>
            <p class="product-specs">${produto.especificacoes || ""}</p>
            <div class="product-footer">
              <div class="product-price">
                ${produto.preco_promocional ? `<span class="old-price">${formatarPreco(produto.preco)}</span>` : ""}
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
  const el = document.getElementById("resultsCount")
  if (el) {
    el.textContent = `${count} produto${count !== 1 ? "s" : ""}`
  }
}

function renderizarPaginacao() {
  const container = document.getElementById("pagination")
  if (!container || totalPaginas <= 1) {
    container.innerHTML = ""
    return
  }

  let html = ""

  if (paginaAtual > 1) {
    html += `<button onclick="mudarPagina(${paginaAtual - 1})">Anterior</button>`
  }

  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="${i === paginaAtual ? "active" : ""}" onclick="mudarPagina(${i})">${i}</button>`
  }

  if (paginaAtual < totalPaginas) {
    html += `<button onclick="mudarPagina(${paginaAtual + 1})">Próxima</button>`
  }

  container.innerHTML = html
}

function mudarPagina(pagina) {
  paginaAtual = pagina
  carregarProdutos()
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function ordenarProdutos() {
  const ordem = document.getElementById("sortSelect").value
  filtrosAtuais.ordenar = ordem
  carregarProdutos()
}

function aplicarFiltroPeco() {
  const min = document.getElementById("priceMin").value
  const max = document.getElementById("priceMax").value

  if (min) filtrosAtuais.preco_min = min
  if (max) filtrosAtuais.preco_max = max

  carregarProdutos()
}

function inicializarPesquisa() {
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter" && searchInput.value.trim().length >= 2) {
        window.location.href = `produtos.html?pesquisa=${encodeURIComponent(searchInput.value.trim())}`
      }
    })
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      if (searchInput?.value.trim().length >= 2) {
        window.location.href = `produtos.html?pesquisa=${encodeURIComponent(searchInput.value.trim())}`
      }
    })
  }
}

// Carregar produtos em promoção para a página inicial
async function carregarPromocoes() {
    try {
        const response = await fetch('http://localhost:3000/api/produtos');
        const produtos = await response.json();
        
        // Filtrar apenas produtos com desconto/promoção
        const promocoes = produtos.filter(produto => 
            produto.desconto > 0 || produto.em_promocao || produto.preco_promocional
        );
        
        // Se não houver produtos com flag de promoção, pegar os 3 primeiros
        const produtosDestaque = promocoes.length > 0 
            ? promocoes.slice(0, 3) 
            : produtos.slice(0, 3);
        
        const dealsGrid = document.querySelector('.deals-grid');
        if (!dealsGrid) return;
        
        dealsGrid.innerHTML = produtosDestaque.map((produto, index) => {
            // Calcular preços
            const precoOriginal = parseFloat(produto.preco);
            let precoComDesconto = precoOriginal;
            let percentualDesconto = 0;
            
            if (produto.desconto && produto.desconto > 0) {
                precoComDesconto = precoOriginal * (1 - produto.desconto / 100);
                percentualDesconto = produto.desconto;
            } else if (produto.preco_promocional && produto.preco_promocional < precoOriginal) {
                precoComDesconto = parseFloat(produto.preco_promocional);
                percentualDesconto = Math.round(((precoOriginal - precoComDesconto) / precoOriginal) * 100);
            } else {
                // Se não tem desconto real, simular 20% para exibição
                percentualDesconto = 20;
                precoComDesconto = precoOriginal * 0.8;
            }
            
            
            return `
                <div class="deal-card ${index === 0 ? 'featured' : ''}" onclick="window.location.href='produto-detalhes.html?id=${produto.id}'">
                    <span class="deal-badge">-${percentualDesconto}%</span>
                    <img src="${produto.imagem || produto.imagem_url || 'imagens/placeholder.jpg'}" 
                         alt="${produto.nome}" 
                         class="produto-img"
                         onerror="this.src='imagens/placeholder.jpg'">
                    <h3>${produto.nome}</h3>
                    <div class="deal-price">
                        <span class="new-price">€${precoComDesconto.toFixed(2)}</span>
                        <span class="old-price">€${precoOriginal.toFixed(2)}</span>
                    </div>
                    <button class="btn-deal" onclick="event.stopPropagation(); addToCart(${produto.id})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar promoções:', error);
        const dealsGrid = document.querySelector('.deals-grid');
        if (dealsGrid) {
            dealsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p style="color: #ef4444;">Erro ao carregar promoções. Tente novamente mais tarde.</p>
                </div>
            `;
        }
    }
}

// Chamar a função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página inicial (index.html)
    if (document.querySelector('.deals')) {
        carregarPromocoes();
    }
});