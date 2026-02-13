// ============================================
// PÁGINA DO CARRINHO - VERSÃO CORRIGIDA
// ============================================

// Usar CONFIG.API_URL do config.js
const getApiUrl = () => {
    if (typeof CONFIG !== 'undefined' && CONFIG.API_URL) {
        return CONFIG.API_URL;
    }
    if (typeof API_BASE_URL !== 'undefined') {
        return API_BASE_URL;
    }
    return 'http://localhost:3000';
};

// Renderizar itens do carrinho na página
async function renderCartPage() {
    const container = document.getElementById('cartPageItems');
    if (!container) return;

    const API_URL = getApiUrl();
    console.log('📡 Usando API URL:', API_URL);

    try {
        const response = await fetch(`${API_URL}/api/carrinho`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar carrinho');
        }

        const data = await response.json();
        const items = data.itens || [];

        if (items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem;">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="opacity: 0.3; margin-bottom: 1rem;">
                        <circle cx="9" cy="21" r="1" stroke-width="2"/>
                        <circle cx="20" cy="21" r="1" stroke-width="2"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke-width="2"/>
                    </svg>
                    <h2>O teu carrinho está vazio</h2>
                    <p style="color: #666; margin-bottom: 1.5rem;">Adiciona produtos para começar a comprar</p>
                    <a href="produtos.html" class="btn-primary">Ver Produtos</a>
                </div>
            `;
            updateCartSummary([], 0, 0, 0);
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.imagem || 'imagens/placeholder.jpg'}" alt="${item.nome}">
                <div class="item-info">
                    <h3>${item.nome}</h3>
                    <p class="item-price">€${parseFloat(item.preco).toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantidade - 1})" class="qty-btn">-</button>
                    <input type="number" value="${item.quantidade}" min="1" 
                           onchange="updateCartQuantity(${item.id}, this.value)" 
                           class="qty-input">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantidade + 1})" class="qty-btn">+</button>
                </div>
                <div class="item-total">
                    €${(parseFloat(item.preco) * item.quantidade).toFixed(2)}
                </div>
                <button onclick="removeFromCart(${item.id})" class="item-remove" title="Remover">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        `).join('');

        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.preco) * item.quantidade), 0);
        const iva = subtotal * 0.23;
        const total = subtotal + iva;

        updateCartSummary(items, subtotal, iva, total);

    } catch (error) {
        console.error('Erro ao renderizar carrinho:', error);
        if (typeof showNotification === 'function') {
            showNotification('Erro ao carregar carrinho', 'error');
        }
    }
}

function updateCartSummary(items, subtotal, iva, total) {
    const subtotalElement = document.getElementById('subtotal');
    const ivaElement = document.getElementById('iva');
    const totalElement = document.getElementById('totalFinal');

    if (subtotalElement) subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
    if (ivaElement) ivaElement.textContent = `€${iva.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `€${total.toFixed(2)}`;
}

async function updateCartQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const API_URL = getApiUrl();

    try {
        const response = await fetch(`${API_URL}/api/carrinho`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                produto_id: productId,
                quantidade: newQuantity
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar quantidade');
        }

        await renderCartPage();
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }

    } catch (error) {
        console.error('Erro ao atualizar quantidade:', error);
        if (typeof showNotification === 'function') {
            showNotification('Erro ao atualizar quantidade', 'error');
        }
    }
}

async function removeFromCart(productId) {
    if (!confirm('Tens a certeza que queres remover este produto?')) {
        return;
    }

    const API_URL = getApiUrl();

    try {
        const response = await fetch(`${API_URL}/api/carrinho`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                produto_id: productId
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao remover produto');
        }

        if (typeof showNotification === 'function') {
            showNotification('Produto removido do carrinho', 'success');
        }
        
        await renderCartPage();
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }

    } catch (error) {
        console.error('Erro ao remover produto:', error);
        if (typeof showNotification === 'function') {
            showNotification('Erro ao remover produto', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartPageItems')) {
        console.log('🛒 Carregando página do carrinho...');
        renderCartPage();
    }
});

console.log('✅ carrinho-page.js carregado');