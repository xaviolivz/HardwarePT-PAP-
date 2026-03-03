const API_URL = "api"

class HardwarePTAPI {

  static async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      return await response.json()
    } catch (error) {
      console.error("Erro no login:", error)
      return { sucesso: false, mensagem: "Erro de conexão" }
    }
  }

  static async registo(nome, email, password, telefone = "") {
    try {
      const response = await fetch(`${API_URL}/auth/registo.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, password, telefone }),
      })
      return await response.json()
    } catch (error) {
      console.error("Erro no registo:", error)
      return { sucesso: false, mensagem: "Erro de conexão" }
    }
  }

  static async logout() {
    try {
      const response = await fetch(`${API_URL}/auth/logout.php`)
      return await response.json()
    } catch (error) {
      console.error("Erro no logout:", error)
      return { sucesso: false, mensagem: "Erro de conexão" }
    }
  }

  static async verificarSessao() {
    try {
      const response = await fetch(`${API_URL}/auth/verificar.php`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao verificar sessão:", error)
      return { autenticado: false }
    }
  }

  static async listarProdutos(filtros = {}) {
    try {
      const params = new URLSearchParams(filtros)
      const response = await fetch(`${API_URL}/produtos/listar.php?${params}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao listar produtos:", error)
      return { sucesso: false, produtos: [] }
    }
  }

  static async obterProduto(idOuSlug) {
    try {
      const param = typeof idOuSlug === "number" ? `id=${idOuSlug}` : `slug=${idOuSlug}`
      const response = await fetch(`${API_URL}/produtos/detalhes.php?${param}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao obter produto:", error)
      return { sucesso: false }
    }
  }


  static async listarCategorias() {
    try {
      const response = await fetch(`${API_URL}/categorias/listar.php`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao listar categorias:", error)
      return { sucesso: false, categorias: [] }
    }
  }


  static async adicionarAoCarrinho(produtoId, quantidade = 1) {
    try {
      const response = await fetch(`${API_URL}/carrinho/adicionar.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produto_id: produtoId, quantidade }),
      })
      return await response.json()
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error)
      return { sucesso: false, mensagem: "Erro de conexão" }
    }
  }

  static async listarCarrinho() {
    try {
      const response = await fetch(`${API_URL}/carrinho/listar.php`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao listar carrinho:", error)
      return { sucesso: false, itens: [], total: 0 }
    }
  }


  static async criarPedido(dadosEntrega) {
    try {
      const response = await fetch(`${API_URL}/pedidos/criar.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosEntrega),
      })
      return await response.json()
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      return { sucesso: false, mensagem: "Erro de conexão" }
    }
  }
}