async function carregarDetalhesProduto() {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');
    
    console.log('🔍 ID do produto:', produtoId);
    
    if (!produtoId) {
        window.location.href = 'produtos.html';
        return;
    }
    
    try {
        const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL : 'http://localhost:3000';
        const url = `${API_URL}/api/produtos/${produtoId}`;
        console.log('🌐 Buscando:', url);
        
        const response = await fetch(url);
        console.log('📡 Status:', response.status);
        
        if (!response.ok) {
            throw new Error('Produto não encontrado');
        }
        
        const produto = await response.json();
        console.log('✅ Produto recebido:', produto);
        console.log('📋 Especificações tipo:', typeof produto.especificacoes_tecnicas);
        console.log('📋 Especificações valor:', produto.especificacoes_tecnicas);
        console.log('📋 Características tipo:', typeof produto.caracteristicas);
        console.log('📋 Características valor:', produto.caracteristicas);
        
        // Preencher dados básicos
        document.getElementById('productName').textContent = produto.nome || 'Produto';
        document.getElementById('productBreadcrumb').textContent = produto.nome || 'Produto';
        document.getElementById('productCategory').textContent = produto.categoria || 'Produto';
        document.getElementById('breadcrumbCategory').textContent = produto.categoria || 'Categoria';
        document.getElementById('productImage').src = produto.imagem || 'imagens/placeholder.jpg';
        document.getElementById('productImage').alt = produto.nome || 'Produto';
        
        // Preço
        const precoAtual = parseFloat(produto.preco) || 0;
        document.getElementById('currentPrice').textContent = `€${precoAtual.toFixed(2)}`;
        
        // Preço promocional
        if (produto.preco_promocional && parseFloat(produto.preco_promocional) < precoAtual) {
            const precoPromo = parseFloat(produto.preco_promocional);
            const oldPriceEl = document.getElementById('oldPrice');
            if (oldPriceEl) {
                oldPriceEl.textContent = `€${precoAtual.toFixed(2)}`;
                oldPriceEl.style.display = 'inline';
            }
            document.getElementById('currentPrice').textContent = `€${precoPromo.toFixed(2)}`;
            
            const economia = precoAtual - precoPromo;
            const percentagem = Math.round((economia / precoAtual) * 100);
            const savingsBox = document.getElementById('savingsBox');
            if (savingsBox) {
                savingsBox.innerHTML = `
                `;
            }
        }
        
        // Stock
        const stockInfo = document.getElementById('stockInfo');
        const stockText = document.getElementById('stockText');
        
        if (stockInfo && stockText) {
            if (produto.stock && produto.stock > 0) {
                stockText.textContent = `Em stock (${produto.stock} unidades)`;
                stockInfo.style.color = '#22c55e';
            } else {
                stockText.textContent = 'Sem stock';
                stockInfo.style.color = '#ef4444';
            }
        }
        
        // Carregar especificações (com proteção)
        carregarEspecificacoes(produto);
        
        // Carregar características (com proteção)
        carregarCaracteristicas(produto);
        
        // Guardar ID
        window.currentProductId = produtoId;
        const actionWrapper = document.querySelector('.product-actions-detailed');
        if (actionWrapper) actionWrapper.setAttribute('data-product-id', String(produtoId));
        
        console.log('✅ Página carregada com sucesso!');
        
    } catch (error) {
        console.error('❌ ERRO COMPLETO:', error);
        console.error('❌ Stack:', error.stack);
        alert('Erro ao carregar detalhes do produto: ' + error.message);
    }
}

// Carregar especificações técnicas
function carregarEspecificacoes(produto) {
    const specsTable = document.getElementById('specsTable');
    
    if (!produto.especificacoes_tecnicas) {
        specsTable.innerHTML = '<tr><td colspan="2">Especificações não disponíveis</td></tr>';
        return;
    }
    
    let specs = produto.especificacoes_tecnicas;
    
    // Se vier como string, fazer parse
    if (typeof specs === 'string') {
        try {
            specs = JSON.parse(specs);
        } catch (e) {
            console.error('Erro ao fazer parse das especificações:', e);
            specsTable.innerHTML = '<tr><td colspan="2">Erro ao carregar especificações</td></tr>';
            return;
        }
    }
    
    // Gerar linhas da tabela
    let html = '';
    for (const [chave, valor] of Object.entries(specs)) {
        html += `
            <tr>
                <td><strong>${chave}</strong></td>
                <td>${valor}</td>
            </tr>
        `;
    }
    
    specsTable.innerHTML = html;
}

// Carregar características
function carregarCaracteristicas(produto) {
    const featuresGrid = document.getElementById('featuresGrid');
    
    if (!produto.caracteristicas) {
        featuresGrid.innerHTML = '<p style="color:#666;">Características não disponíveis</p>';
        return;
    }
    
    let caracteristicas = produto.caracteristicas;
    
    if (typeof caracteristicas === 'string') {
        try {
            caracteristicas = JSON.parse(caracteristicas);
        } catch (e) {
            featuresGrid.innerHTML = '<p style="color:#666;">Erro ao carregar características</p>';
            return;
        }
    }
    
    const rows = caracteristicas.map((c, i) => `
        <tr style="border-bottom:${i < caracteristicas.length - 1 ? '1px solid #e5e7eb' : 'none'};">
            <td style="width:48px; text-align:center; vertical-align:middle; padding:14px 8px;">
                <span style="color:#22c55e; font-size:1rem; font-weight:700; line-height:1;"></span>
            </td>
            <td style="color:#374151; font-size:0.9rem; padding:14px 16px 14px 0; vertical-align:middle;">${c}</td>
        </tr>
    `).join('');

    featuresGrid.innerHTML = `
        <div style="border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; background:#fff;">
            <table style="width:100%; border-collapse:collapse;">
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

// Função para trocar tabs
function openTab(tabName, btn) {
    const tabs = document.querySelectorAll('.tab-pane');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    if (btn) btn.classList.add('active');
}

// Carregar ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarDetalhesProduto();
});

// Funções para controlar a quantidade
function increaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    let currentValue = parseInt(quantityInput.value);
    if (currentValue < 99) {
        quantityInput.value = currentValue + 1;
        updateDecreaseButton();
    }
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('productQuantity');
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
        updateDecreaseButton();
    }
}

function updateDecreaseButton() {
    const quantityInput = document.getElementById('productQuantity');
    const decreaseBtn = document.getElementById('decreaseBtn');
    decreaseBtn.disabled = parseInt(quantityInput.value) <= 1;
}

// Atualizar o botão de diminuir quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    updateDecreaseButton();
});
