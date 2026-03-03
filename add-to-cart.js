// ============================================
// ADICIONAR AO CARRINHO - VERSÃO CORRIGIDA
// ============================================

// Usar CONFIG.API_URL do config.js
const getApiUrl = () => {
    if (typeof CONFIG !== 'undefined' && CONFIG.API_URL) {
        return CONFIG.API_URL;
    }
    if (typeof API_BASE_URL !== 'undefined') {
        return API_BASE_URL;
    }
    // Fallback
    return 'http://localhost:3000';
};

function getLocalCart() {
    try {
        const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
        return Array.isArray(carrinho) ? carrinho : [];
    } catch (error) {
        console.error('Erro ao ler carrinho local:', error);
        return [];
    }
}

function saveLocalCart(carrinho) {
    try {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    } catch (error) {
        console.error('Erro ao guardar carrinho local:', error);
    }
}

function updateLocalCartItem(productId, quantity = 1, productData = {}) {
    const carrinho = getLocalCart();
    const numericId = Number(productId);
    const idx = carrinho.findIndex(item => Number(item.id ?? item.produto_id) === numericId);

    if (idx >= 0) {
        carrinho[idx].quantidade = (parseInt(carrinho[idx].quantidade || 0, 10) + parseInt(quantity, 10));
    } else {
        carrinho.push({
            id: numericId,
            produto_id: numericId,
            nome: productData.nome || `Produto #${numericId}`,
            preco: Number(productData.preco || 0),
            imagem: productData.imagem || 'imagens/placeholder.jpg',
            quantidade: parseInt(quantity, 10)
        });
    }

    saveLocalCart(carrinho);
}

// Função para adicionar produto ao carrinho
async function addToCart(productId, quantity = 1, productData = {}) {
    console.log('🛒 Tentando adicionar produto ao carrinho:', { productId, quantity });

    try {
        const API_URL = getApiUrl();
        console.log('📡 Usando API URL:', API_URL);

        // Verificar se utilizador está autenticado
        const authResponse = await fetch(`${API_URL}/api/auth/verificar`, {
            credentials: 'include'
        });
        
        const authData = await authResponse.json();
        console.log('👤 Estado de autenticação:', authData);

        if (!authData.autenticado) {
            showNotification('Precisas de fazer login para adicionar ao carrinho', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Adicionar ao carrinho
        const response = await fetch(`${API_URL}/api/carrinho`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                produto_id: productId,
                quantidade: quantity
            })
        });

        console.log('📡 Resposta do servidor:', response.status);

        const data = await response.json().catch(() => ({}));
        console.log('📦 Dados recebidos:', data);

        if (response.ok) {
            updateLocalCartItem(productId, quantity, { ...(productData || {}), ...(data?.produto || {}) });
            showNotification('✅ Produto adicionado ao carrinho!', 'success');
            updateCartCount(); // Atualizar contador do carrinho
        } else {
            // fallback local para evitar carrinho vazio quando a API falha parcialmente
            updateLocalCartItem(productId, quantity, productData);
            showNotification(data.erro || data.mensagem || 'Produto adicionado localmente ao carrinho', 'warning');
            updateCartCount();
        }

    } catch (error) {
        console.error('❌ Erro ao adicionar ao carrinho:', error);
        updateLocalCartItem(productId, quantity, productData);
        showNotification('Sem ligação ao servidor: produto adicionado ao carrinho local', 'warning');
        updateCartCount();
    }
}

// Atualizar contador do carrinho no header
async function updateCartCount() {
    try {
        const API_URL = getApiUrl();

        const response = await fetch(`${API_URL}/api/carrinho`, {
            credentials: 'include'
        });

        let totalItems = 0;

        if (response.ok) {
            const data = await response.json();
            const apiItems = Array.isArray(data.itens) ? data.itens : (Array.isArray(data.items) ? data.items : []);
            totalItems = apiItems.reduce((sum, item) => sum + parseInt(item.quantidade || 0, 10), 0);
        }

        if (totalItems === 0) {
            const localCart = getLocalCart();
            totalItems = localCart.reduce((sum, item) => sum + parseInt(item.quantidade || 0, 10), 0);
        }

        const cartCountElements = document.querySelectorAll('.cart-count, #cartCount');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'flex' : 'none';
            element.classList.remove('bump');
            // force reflow
            void element.offsetWidth;
            element.classList.add('bump');
        });

        console.log(`🛒 Contador atualizado: ${totalItems} itens`);
    } catch (error) {
        console.error('❌ Erro ao atualizar contador:', error);
        const localCart = getLocalCart();
        const totalItems = localCart.reduce((sum, item) => sum + parseInt(item.quantidade || 0, 10), 0);
        const cartCountElements = document.querySelectorAll('.cart-count, #cartCount');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'flex' : 'none';
            element.classList.remove('bump');
            // force reflow
            void element.offsetWidth;
            element.classList.add('bump');
        });
    }
}

// Função de notificação
function showNotification(message, type = 'info') {
    console.log(`📢 Notificação [${type}]:`, message);

    // Remover notificação anterior
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Mostrar
    setTimeout(() => notification.classList.add('show'), 100);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Atualizar contador quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Atualizando contador do carrinho...');
    updateCartCount();
});

console.log('✅ add-to-cart.js carregado');

function addToCartFromDetails() {
    const productElement = document.querySelector('[data-product-id]');
    const productId = productElement?.getAttribute('data-product-id') || window.currentProductId;
    const quantityInput = document.getElementById('productQuantity') || document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1;

    if (!productId) {
        showNotification('Produto inválido', 'error');
        return;
    }

    const nome = document.getElementById('productName')?.textContent?.trim();
    const precoText = document.getElementById('currentPrice')?.textContent || '0';
    const preco = parseFloat(String(precoText).replace(/[^0-9,.-]/g, '').replace(',', '.')) || 0;
    const imagem = document.getElementById('productImage')?.getAttribute('src') || 'imagens/placeholder.jpg';

    addToCart(productId, quantity, { nome, preco, imagem });
}
