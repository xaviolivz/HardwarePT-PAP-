(() => {
  let paginaAtual = 1;
  let totalPaginas = 1;
  const filtrosAtuais = {};

  const getConfig = () => {
    const globalConfig = typeof window !== "undefined" ? window.CONFIG : undefined;
    if (globalConfig && Array.isArray(globalConfig.CATEGORIAS)) {
      return globalConfig;
    }

    return {
      API_URL: "http://localhost:3000",
      PRODUCTS_PER_PAGE: 10,
      CATEGORIAS: [
        { slug: "processadores", nome: "Processadores", icone: "🖥️" },
        { slug: "placas-graficas", nome: "Placas Gráficas", icone: "🎮" },
        { slug: "memoria", nome: "Memória", icone: "💾" },
        { slug: "armazenamento", nome: "Armazenamento", icone: "📀" },
      ],
    };
  };

  const APP_CONFIG = getConfig();
  const PRODUCTS_PER_PAGE = APP_CONFIG.PRODUCTS_PER_PAGE || 10;
  const formatarPreco = (preco) => `€${Number(preco || 0).toFixed(2)}`;

  function lerParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    const pageTitle = document.getElementById("pageTitle");
    const searchInput = document.getElementById("searchInput");

    if (params.get("categoria")) {
      filtrosAtuais.categoria = params.get("categoria");
      atualizarTituloPagina(params.get("categoria"));
    }

    if (params.get("pesquisa")) {
      filtrosAtuais.pesquisa = params.get("pesquisa");
      if (searchInput) searchInput.value = filtrosAtuais.pesquisa;
      if (pageTitle) pageTitle.textContent = `Resultados para "${filtrosAtuais.pesquisa}"`;
    }

    if (params.get("promocao")) {
      filtrosAtuais.promocao = 1;
      if (pageTitle) pageTitle.textContent = "Promoções";
    }

    if (params.get("destaque")) {
      filtrosAtuais.destaque = 1;
      if (pageTitle) pageTitle.textContent = "Destaques";
    }
  }

  function atualizarTituloPagina(categoriaSlug) {
    const categoria = APP_CONFIG.CATEGORIAS.find((c) => c.slug === categoriaSlug);
    if (!categoria) return;

    const pageTitle = document.getElementById("pageTitle");
    const breadcrumbCategory = document.getElementById("breadcrumbCategory");

    if (pageTitle) pageTitle.textContent = categoria.nome;
    if (breadcrumbCategory) breadcrumbCategory.textContent = categoria.nome;
  }

  function carregarFiltrosCategoria() {
    const container = document.getElementById("categoryFilters");
    if (!container) return;

    container.innerHTML =
      '<li><a href="produtos.html" class="filter-link">Todas as Categorias</a></li>' +
      APP_CONFIG.CATEGORIAS.map(
        (cat) => `
          <li>
            <a href="produtos.html?categoria=${cat.slug}" class="filter-link ${
              filtrosAtuais.categoria === cat.slug ? "active" : ""
            }">
              ${cat.icone} ${cat.nome}
            </a>
          </li>
        `,
      ).join("");
  }

  async function carregarProdutos() {
    const container = document.getElementById("productsGrid");
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
      const apiUrl = APP_CONFIG.API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/produtos`);

      if (!response.ok) throw new Error("Erro ao carregar produtos");

      const todosProdutos = await response.json();
      let produtosFiltrados = [...todosProdutos];

      if (filtrosAtuais.categoria) {
        produtosFiltrados = produtosFiltrados.filter((p) => {
          const categoriaSlug = p.categoria?.toLowerCase().replace(/\s+/g, "-");
          return categoriaSlug === filtrosAtuais.categoria;
        });
      }

      if (filtrosAtuais.pesquisa) {
        const termo = filtrosAtuais.pesquisa.toLowerCase();
        produtosFiltrados = produtosFiltrados.filter(
          (p) => p.nome?.toLowerCase().includes(termo) || p.especificacoes?.toLowerCase().includes(termo),
        );
      }

      if (filtrosAtuais.promocao) {
        produtosFiltrados = produtosFiltrados.filter((p) => p.preco_promocional);
      }

      if (filtrosAtuais.destaque) {
        produtosFiltrados = produtosFiltrados.filter((p) => p.destaque);
      }

      const totalProdutos = produtosFiltrados.length;
      totalPaginas = Math.max(1, Math.ceil(totalProdutos / PRODUCTS_PER_PAGE));
      paginaAtual = Math.min(paginaAtual, totalPaginas);

      const inicio = (paginaAtual - 1) * PRODUCTS_PER_PAGE;
      const fim = inicio + PRODUCTS_PER_PAGE;
      const produtosPagina = produtosFiltrados.slice(inicio, fim);

      renderizarProdutos(container, produtosPagina);
      atualizarContadorResultados(totalProdutos);
      renderizarPaginacao();
    } catch (error) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Erro ao carregar produtos</h3>
          <p>${error.message}</p>
          <button onclick="carregarProdutos()" class="btn btn-primary">Tentar Novamente</button>
        </div>
      `;
    }
  }

  function renderizarProdutos(container, produtos) {
    if (!produtos.length) {
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
                <img src="${produto.imagem || "imagens/placeholder.jpg"}" alt="${produto.nome}">
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
        `,
      )
      .join("");
  }

  function atualizarContadorResultados(count) {
    const el = document.getElementById("resultsCount");
    if (el) el.textContent = `${count} produto${count !== 1 ? "s" : ""}`;
  }

  function renderizarPaginacao() {
    const container = document.getElementById("pagination");
    if (!container || totalPaginas <= 1) {
      if (container) container.innerHTML = "";
      return;
    }

    let html = "";
    if (paginaAtual > 1) html += `<button onclick="mudarPagina(${paginaAtual - 1})">Anterior</button>`;

    for (let i = 1; i <= totalPaginas; i++) {
      html += `<button class="${i === paginaAtual ? "active" : ""}" onclick="mudarPagina(${i})">${i}</button>`;
    }

    if (paginaAtual < totalPaginas) html += `<button onclick="mudarPagina(${paginaAtual + 1})">Próxima</button>`;

    container.innerHTML = html;
  }

  function mudarPagina(pagina) {
    paginaAtual = pagina;
    carregarProdutos();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function ordenarProdutos() {
    const ordem = document.getElementById("sortSelect")?.value;
    if (!ordem) return;
    filtrosAtuais.ordenar = ordem;
    carregarProdutos();
  }

  function aplicarFiltroPeco() {
    const min = document.getElementById("priceMin")?.value;
    const max = document.getElementById("priceMax")?.value;

    if (min) filtrosAtuais.preco_min = min;
    if (max) filtrosAtuais.preco_max = max;
    carregarProdutos();
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

  async function carregarPromocoes() {
    try {
      const apiUrl = APP_CONFIG.API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/produtos`);
      if (!response.ok) throw new Error("Erro ao carregar promoções");

      const produtos = await response.json();
      const promocoes = produtos.filter(
        (produto) => produto.desconto > 0 || produto.em_promocao || produto.preco_promocional,
      );
      const produtosDestaque = promocoes.length ? promocoes.slice(0, 3) : produtos.slice(0, 3);

      const dealsGrid = document.querySelector(".deals-grid");
      if (!dealsGrid) return;

      dealsGrid.innerHTML = produtosDestaque
        .map((produto, index) => {
          const precoOriginal = Number(produto.preco || 0);
          let precoComDesconto = precoOriginal;
          let percentualDesconto = 0;

          if (produto.desconto && produto.desconto > 0) {
            precoComDesconto = precoOriginal * (1 - produto.desconto / 100);
            percentualDesconto = produto.desconto;
          } else if (produto.preco_promocional && produto.preco_promocional < precoOriginal) {
            precoComDesconto = Number(produto.preco_promocional);
            percentualDesconto = Math.round(((precoOriginal - precoComDesconto) / precoOriginal) * 100);
          } else {
            percentualDesconto = 20;
            precoComDesconto = precoOriginal * 0.8;
          }

          return `
            <div class="deal-card ${index === 0 ? "featured" : ""}" onclick="window.location.href='produto-detalhes.html?id=${produto.id}'">
              <span class="deal-badge">-${percentualDesconto}%</span>
              <img src="${produto.imagem || produto.imagem_url || "imagens/placeholder.jpg"}" alt="${produto.nome}" class="produto-img" onerror="this.src='imagens/placeholder.jpg'">
              <h3>${produto.nome}</h3>
              <div class="deal-price">
                <span class="new-price">€${precoComDesconto.toFixed(2)}</span>
                <span class="old-price">€${precoOriginal.toFixed(2)}</span>
              </div>
            </div>
          `;
        })
        .join("");
    } catch (error) {
      const dealsGrid = document.querySelector(".deals-grid");
      if (dealsGrid) {
        dealsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <p style="color: #ef4444;">Erro ao carregar promoções. Tente novamente mais tarde.</p>
          </div>
        `;
      }
    }
  }

  function searchProducts() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const termo = input.value.trim();
    if (termo.length >= 2) {
      window.location.href = `produtos.html?pesquisa=${encodeURIComponent(termo)}`;
    }
  }

  window.carregarProdutos = carregarProdutos;
  window.mudarPagina = mudarPagina;
  window.ordenarProdutos = ordenarProdutos;
  window.aplicarFiltroPeco = aplicarFiltroPeco;
  window.searchProducts = searchProducts;

  document.addEventListener("DOMContentLoaded", () => {
    carregarFiltrosCategoria();
    lerParametrosURL();
    carregarProdutos();
    inicializarPesquisa();

    if (document.querySelector(".deals")) {
      carregarPromocoes();
    }
  });
})();