// ============================================
// PÁGINA DE CHECKOUT - checkout.js
// ============================================

let checkoutData = {
    items: [],
    subtotal: 0,
    iva: 0,
    total: 0
};

// Carregar dados do checkout
async function loadCheckoutData() {
    try {
        // Carregar itens do carrinho
        const response = await fetch(`${API_BASE_URL}/carrinho.php`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar carrinho');
        }

        const data = await response.json();
        checkoutData.items = data.itens || [];

        if (checkoutData.items.length === 0) {
            window.location.href = 'carrinho.html';
            return;
        }

        // Calcular totais
        checkoutData.subtotal = checkoutData.items.reduce((sum, item) => 
            sum + (parseFloat(item.preco) * item.quantidade), 0
        );
        checkoutData.iva = checkoutData.subtotal * 0.23;
        checkoutData.total = checkoutData.subtotal + checkoutData.iva;

        // Renderizar resumo
        renderCheckoutSummary();

        // Carregar dados do utilizador
        await loadUserData();

    } catch (error) {
        console.error('Erro ao carregar checkout:', error);
        showNotification('Erro ao carregar dados', 'error');
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
        const response = await fetch(`${API_BASE_URL}/utilizador.php`, {
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();
            
            // Preencher formulário
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
        showNotification('Seleciona um método de pagamento', 'error');
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
        const response = await fetch(`${API_BASE_URL}/pedidos.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Limpar carrinho
            await fetch(`${API_BASE_URL}/carrinho.php`, {
                method: 'DELETE',
                credentials: 'include'
            });

            // Guardar dados do pedido no sessionStorage para a página de confirmação
            sessionStorage.setItem('lastOrder', JSON.stringify({
                id: result.pedido_id,
                numero: result.numero_pedido,
                email: formData.email,
                total: checkoutData.total,
                data: new Date().toISOString()
            }));

            // Redirecionar para confirmação
            window.location.href = 'confirmacao.html';
        } else {
            throw new Error(result.mensagem || 'Erro ao processar pedido');
        }

    } catch (error) {
        console.error('Erro ao processar checkout:', error);
        showNotification(error.message || 'Erro ao processar pedido', 'error');
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
        showNotification('Número de cartão inválido', 'error');
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showNotification('Validade inválida (formato: MM/AA)', 'error');
        return false;
    }

    if (cardCVV.length !== 3 || !/^\d+$/.test(cardCVV)) {
        showNotification('CVV inválido', 'error');
        return false;
    }

    return true;
}

// Validar pagamento MB WAY
function validateMBWayPayment() {
    const phone = document.getElementById('mbwayPhone').value.replace(/\s/g, '');
    
    if (!/^9\d{8}$/.test(phone)) {
        showNotification('Número de telemóvel inválido', 'error');
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
    let value = input.value.replace(/\D/g, '');
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