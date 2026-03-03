// ============================================
// PÁGINA DE CONFIRMAÇÃO - confirmacao.js
// ============================================

// Carregar dados do pedido confirmado
function loadOrderConfirmation() {
    try {
        // Obter dados do último pedido do sessionStorage
        const orderDataStr = sessionStorage.getItem('lastOrder');
        
        if (!orderDataStr) {
            // Se não há dados, redirecionar para home
            window.location.href = 'index.html';
            return;
        }

        const orderData = JSON.parse(orderDataStr);

        // Preencher informações do pedido
        document.getElementById('orderNumber').textContent = `#${orderData.numero || orderData.id}`;
        
        // Formatar data
        const date = new Date(orderData.data);
        const formattedDate = date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        document.getElementById('orderDate').textContent = formattedDate;
        
        document.getElementById('orderEmail').textContent = orderData.email;
        document.getElementById('orderTotal').textContent = `€${parseFloat(orderData.total).toFixed(2)}`;

        // Limpar dados do sessionStorage (já foram usados)
        // Comentado para permitir refresh da página
        // sessionStorage.removeItem('lastOrder');

        // Atualizar contador do carrinho (deve estar a 0 agora)
        updateCartCount();

    } catch (error) {
        console.error('Erro ao carregar confirmação:', error);
        window.location.href = 'index.html';
    }
}

// Inicializar página de confirmação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de confirmação
    if (document.getElementById('orderNumber')) {
        loadOrderConfirmation();
    }
});