// ============================================
// PÁGINA DE CHECKOUT - checkout.js
// ============================================

let checkoutData = {
    items: [],
    subtotal: 0,
    iva: 0,
    total: 0
};


function getApiUrl() {
    if (typeof CONFIG !== 'undefined' && CONFIG.API_URL) return CONFIG.API_URL;
    if (typeof API_BASE_URL !== 'undefined') return API_BASE_URL;
    return 'http://localhost:3000';
}

function notify(message, type = 'info') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        console.log(`[${type}] ${message}`);
        if (type === 'error') alert(message);
    }
}

function getLocalCartItems() {
    try {
        const raw = JSON.parse(localStorage.getItem('carrinho') || '[]');
        if (!Array.isArray(raw)) return [];
        return raw.map(item => ({
            id: item.id ?? item.produto_id,
            nome: item.nome || 'Produto',
            preco: parseFloat(item.preco || 0),
            imagem: item.imagem || 'imagens/placeholder.jpg',
            quantidade: parseInt(item.quantidade || 1, 10)
        })).filter(item => item.id !== undefined && item.id !== null);
    } catch (error) {
        console.error('Erro carrinho local checkout:', error);
        return [];
    }
}

function normalizeApiItems(payload) {
    const arr = payload?.itens || payload?.items || payload?.carrinho || [];
    if (!Array.isArray(arr)) return [];

    return arr.map(item => {
        const produto = item.produto || {};
        return {
            id: item.id ?? item.produto_id ?? produto.id,
            nome: item.nome ?? produto.nome ?? 'Produto',
            preco: parseFloat(item.preco ?? produto.preco ?? 0),
            imagem: item.imagem ?? produto.imagem ?? 'imagens/placeholder.jpg',
            quantidade: parseInt(item.quantidade ?? 1, 10)
        };
    }).filter(item => item.id !== undefined && item.id !== null);
}

function updateTotals() {
    checkoutData.subtotal = checkoutData.items.reduce((sum, item) => sum + (parseFloat(item.preco) * item.quantidade), 0);
    checkoutData.iva = checkoutData.subtotal * 0.23;
    checkoutData.total = checkoutData.subtotal + checkoutData.iva;
}

// Carregar dados do checkout
async function loadCheckoutData() {
    try {
        let items = getLocalCartItems();

        // tenta API mas sem bloquear se falhar
        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/api/carrinho`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const apiItems = normalizeApiItems(data);
                if (apiItems.length > 0) {
                    items = apiItems;
                }
            }
        } catch (apiError) {
            console.warn('API indisponível, a usar carrinho local:', apiError);
        }

        checkoutData.items = items;

        console.log('Items no checkout:', checkoutData.items);

        if (checkoutData.items.length === 0) {
            window.location.href = 'carrinho.html';
            return;
        }

        updateTotals();
        renderCheckoutSummary();
        await loadUserData();

    } catch (error) {
        console.error('Erro ao carregar checkout:', error);
        notify('Erro ao carregar dados', 'error');
    }
}

// Renderizar resumo do pedido
function renderCheckoutSummary() {
    const container = document.getElementById('summaryItems');
    if (!container) return;

    container.innerHTML = checkoutData.items.map(item => `
        <div class="summary-item">
            <img src="${item.imagem || 'imagens/placeholder.jpg'}" alt="${item.nome}">
            <div class="summary-item-info">
                <h4>${item.nome}</h4>
                <p>Qtd: ${item.quantidade}</p>
            </div>
            <span class="summary-item-price">€${(parseFloat(item.preco) * item.quantidade).toFixed(2)}</span>
        </div>
    `).join('');

    // Atualizar totais
    document.getElementById('subtotal').textContent = `€${checkoutData.subtotal.toFixed(2)}`;
    document.getElementById('iva').textContent = `€${checkoutData.iva.toFixed(2)}`;
    document.getElementById('total').textContent = `€${checkoutData.total.toFixed(2)}`;

    // Atualizar prestação Klarna (se existir)
    const klarnaInstallment = document.getElementById('klarnaInstallment');
    if (klarnaInstallment) {
        klarnaInstallment.textContent = `€${(checkoutData.total / 3).toFixed(2)} / mês`;
    }
}

// Carregar dados do utilizador
async function loadUserData() {
    try {
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/api/auth/verificar`, {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            const user = result.utilizador || result.user || result;

            if (user.nome) document.getElementById('fullName').value = user.nome;
            if (user.email) document.getElementById('email').value = user.email;
            if (user.telefone) document.getElementById('phone').value = user.telefone;
            if (user.nif) document.getElementById('nif').value = user.nif;
            if (user.morada) document.getElementById('address').value = user.morada;
            if (user.cidade) document.getElementById('city').value = user.cidade;
            if (user.codigo_postal) document.getElementById('postalCode').value = user.codigo_postal;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do utilizador:', error);
    }
}

// Atualizar campos de pagamento
function updatePaymentFields(method) {
    // Ocultar todos os campos
    const allFields = document.querySelectorAll('.payment-details');
    allFields.forEach(field => field.style.display = 'none');

    // Mostrar campo selecionado
    const selectedField = document.getElementById(`${method}Fields`);
    if (selectedField) {
        selectedField.style.display = 'block';
    }

    // Atualizar campos obrigatórios
    updateRequiredFields(method);
}

// Atualizar campos obrigatórios conforme método de pagamento
function updateRequiredFields(method) {
    // Remover required de todos os campos de pagamento
    document.querySelectorAll('.payment-details input').forEach(input => {
        input.removeAttribute('required');
    });

    // Adicionar required aos campos do método selecionado
    if (method === 'card') {
        document.getElementById('cardNumber').setAttribute('required', 'required');
        document.getElementById('cardName').setAttribute('required', 'required');
        document.getElementById('cardExpiry').setAttribute('required', 'required');
        document.getElementById('cardCVV').setAttribute('required', 'required');
    } else if (method === 'mbway') {
        document.getElementById('mbwayPhone').setAttribute('required', 'required');
    }
}

// Processar checkout
async function processCheckout(event) {
    event.preventDefault();

    // Obter método de pagamento selecionado
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
        notify('Seleciona um método de pagamento', 'error');
        return;
    }

    // Validar campos específicos do método de pagamento
    if (!validatePaymentMethod(paymentMethod.value)) {
        return;
    }

    // Coletar dados do formulário
    const formData = {
        // Dados pessoais
        nome: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('phone').value,
        nif: document.getElementById('nif').value,
        morada: document.getElementById('address').value,
        cidade: document.getElementById('city').value,
        codigo_postal: document.getElementById('postalCode').value,
        
        // Dados do pedido
        metodo_pagamento: paymentMethod.value,
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        iva: checkoutData.iva,
        
        // Dados específicos do pagamento
        dados_pagamento: getPaymentData(paymentMethod.value)
    };

    // Mostrar loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'A processar...';

    try {
        const API_URL = getApiUrl();

        // tenta enviar para a API mas não bloqueia se falhar
        try {
            const response = await fetch(`${API_URL}/api/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            console.log('Resposta API pedidos:', response.status, result);
        } catch (apiError) {
            console.warn('API pedidos indisponível:', apiError);
        }

        // guarda sempre o pedido e avança
        sessionStorage.setItem('lastOrder', JSON.stringify({
            id: Date.now(),
            numero: `PED-${Date.now()}`,
            email: formData.email,
            total: checkoutData.total,
            data: new Date().toISOString()
        }));

        // limpa carrinho
        try {
            await fetch(`${API_URL}/api/carrinho`, { method: 'DELETE', credentials: 'include' });
        } catch (_) {}
        localStorage.removeItem('carrinho');

        // redireciona sempre
        window.location.href = 'confirmacao.html';

    } catch (error) {
        console.error('Erro ao processar checkout:', error);
        notify(error.message || 'Erro ao processar pedido', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Validar método de pagamento
function validatePaymentMethod(method) {
    switch (method) {
        case 'card':
            return validateCardPayment();
        case 'mbway':
            return validateMBWayPayment();
        case 'multibanco':
        case 'klarna':
            return true;
        default:
            return false;
    }
}

// Validar pagamento por cartão
function validateCardPayment() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;

    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        notify('Número de cartão inválido', 'error');
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        notify('Validade inválida (formato: MM/AA)', 'error');
        return false;
    }

    if (cardCVV.length !== 3 || !/^\d+$/.test(cardCVV)) {
        notify('CVV inválido', 'error');
        return false;
    }

    return true;
}

// Validar pagamento MB WAY
function validateMBWayPayment() {
    const phone = document.getElementById('mbwayPhone').value
        .replace(/\s/g, '')       // remove espaços
        .replace('+351', '')      // remove prefixo internacional
        .replace('351', '');      // remove prefixo sem +

    console.log('Telefone após limpeza:', phone); // para debug

    if (!/^9\d{8}$/.test(phone)) {
        notify('Número de telemóvel inválido. Exemplo: 912 345 678', 'error');
        return false;
    }

    return true;
}

// Obter dados específicos do pagamento
function getPaymentData(method) {
    switch (method) {
        case 'card':
            return {
                numero_cartao: document.getElementById('cardNumber').value,
                nome_cartao: document.getElementById('cardName').value,
                validade: document.getElementById('cardExpiry').value,
                cvv: document.getElementById('cardCVV').value
            };
        case 'mbway':
            return {
                telefone: document.getElementById('mbwayPhone').value
            };
        case 'klarna':
            return {
                opcao: document.querySelector('input[name="klarnaOption"]:checked')?.value || '3x'
            };
        default:
            return {};
    }
}

// Formatar número de cartão (adicionar espaços)
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue;
}

// Formatar validade do cartão
function formatCardExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

// Formatar número de telemóvel
function formatPhone(input) {
    let value = input.value.replace(/\D/g, ''); // só dígitos
    // remove 351 se o utilizador meteu o prefixo
    if (value.startsWith('351') && value.length > 9) {
        value = value.substring(3);
    }
    if (value.length > 3 && value.length <= 6) {
        value = value.substring(0, 3) + ' ' + value.substring(3);
    } else if (value.length > 6) {
        value = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6, 9);
    }
    input.value = value;
}

// Inicializar página de checkout
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checkoutForm')) {
        loadCheckoutData();

        // Adicionar formatadores aos campos
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', function() { formatCardNumber(this); });
        }

        const cardExpiry = document.getElementById('cardExpiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', function() { formatCardExpiry(this); });
        }

        const mbwayPhone = document.getElementById('mbwayPhone');
        if (mbwayPhone) {
            mbwayPhone.addEventListener('input', function() { formatPhone(this); });
        }

        const phone = document.getElementById('phone');
        if (phone) {
            phone.addEventListener('input', function() { formatPhone(this); });
        }
    }
});
