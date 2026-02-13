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

// Função para adicionar produto ao carrinho
async function addToCart(productId, quantity = 1) {
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

        const data = await response.json();
        console.log('📦 Dados recebidos:', data);

        if (response.ok) {
            showNotification('✅ Produto adicionado ao carrinho!', 'success');
            updateCartCount(); // Atualizar contador do carrinho
        } else {
            showNotification(data.erro || data.mensagem || 'Erro ao adicionar produto', 'error');
        }

    } catch (error) {
        console.error('❌ Erro ao adicionar ao carrinho:', error);
        showNotification('Erro ao adicionar produto ao carrinho', 'error');
    }
}

// Atualizar contador do carrinho no header
async function updateCartCount() {
    try {
        const API_URL = getApiUrl();

        const response = await fetch(`${API_URL}/api/carrinho`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            const totalItems = data.itens.reduce((sum, item) => sum + item.quantidade, 0);
            
            const cartCountElements = document.querySelectorAll('.cart-count, #cartCount');
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
                element.style.display = totalItems > 0 ? 'flex' : 'none';
            });

            console.log(`🛒 Contador atualizado: ${totalItems} itens`);
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar contador:', error);
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
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
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
    // 1. Obtém ID do data-product-id
    const productElement = document.querySelector('[data-product-id]');
    const productId = productElement.getAttribute('data-product-id');
    
    // 2. Obtém quantidade do input
    const quantity = document.getElementById('quantity').value;
    
    // 3. Adiciona ao carrinho
    addToCart(productId, quantity);
}