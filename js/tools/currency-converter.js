// Currency Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('convert-btn');
    const exchangeRate = document.getElementById('exchange-rate');
    const resultBox = document.getElementById('result-box');
    const resultAmount = document.getElementById('result-amount');
    const resultText = document.getElementById('result-text');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

    // API Configuration
    const API_KEY = '40c8e1cf5497114058990be7';
    const API_URL = 'https://v6.exchangerate-api.com/v6/';

    // Currency Data
    const currencies = {
        USD: "US Dollar",
        EUR: "Euro",
        GBP: "British Pound",
        JPY: "Japanese Yen",
        AUD: "Australian Dollar",
        CAD: "Canadian Dollar",
        CHF: "Swiss Franc",
        CNY: "Chinese Yuan",
        INR: "Indian Rupee",
        NZD: "New Zealand Dollar",
        BRL: "Brazilian Real",
        RUB: "Russian Ruble",
        KRW: "South Korean Won",
        SGD: "Singapore Dollar",
        ZAR: "South African Rand"
    };

    // Show info message
    function showInfo(message) {
        infoAlert.textContent = message;
        infoAlert.classList.remove('d-none');
        errorAlert.classList.add('d-none');
        setTimeout(() => {
            infoAlert.classList.add('d-none');
        }, 3000);
    }

    // Show error message
    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        infoAlert.classList.add('d-none');
        setTimeout(() => {
            errorAlert.classList.add('d-none');
        }, 3000);
    }

    // Format currency
    function formatCurrency(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Populate currency dropdowns
    function populateCurrencyDropdowns() {
        const entries = Object.entries(currencies);
        const fragment = document.createDocumentFragment();

        entries.forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${code} - ${name}`;
            fragment.appendChild(option.cloneNode(true));
        });

        fromCurrency.appendChild(fragment);
        toCurrency.appendChild(fragment.cloneNode(true));

        // Set default values
        fromCurrency.value = 'USD';
        toCurrency.value = 'EUR';
    }

    // Get exchange rate
    async function getExchangeRate(from, to) {
        try {
            const response = await fetch(`${API_URL}${API_KEY}/latest/${from}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data.result === 'success') {
                return data.conversion_rates[to];
            } else {
                throw new Error(data.error || 'Failed to get exchange rate');
            }
        } catch (error) {
            console.error('Exchange rate error:', error);
            showError('Failed to fetch exchange rate. Please try again.');
            throw error;
        }
    }

    // Convert currency
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (!amount || isNaN(amount)) {
            showError('Please enter a valid amount');
            return;
        }

        try {
            convertBtn.disabled = true;
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Converting...';

            const rate = await getExchangeRate(from, to);
            if (!rate) {
                throw new Error('Invalid exchange rate received');
            }

            const result = amount * rate;

            // Update exchange rate display
            exchangeRate.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;

            // Update result
            resultAmount.textContent = formatCurrency(result, to);
            resultText.textContent = `${formatCurrency(amount, from)} = ${formatCurrency(result, to)}`;
            resultBox.classList.remove('d-none');

            showInfo('Currency converted successfully');
        } catch (error) {
            showError('Failed to convert currency. Please try again.');
            console.error('Conversion error:', error);
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Convert';
        }
    }

    // Swap currencies
    function swapCurrencies() {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;

        if (amountInput.value) {
            convertCurrency();
        }
    }

    // Handle popular currency pairs
    function handlePopularPair(e) {
        if (e.target.classList.contains('pair-btn')) {
            fromCurrency.value = e.target.dataset.from;
            toCurrency.value = e.target.dataset.to;
            if (amountInput.value) {
                convertCurrency();
            }
        }
    }

    // Event Listeners
    convertBtn.addEventListener('click', convertCurrency);
    swapBtn.addEventListener('click', swapCurrencies);
    document.querySelector('.popular-pairs').addEventListener('click', handlePopularPair);

    // Handle amount input
    amountInput.addEventListener('input', function() {
        if (this.value && !isNaN(this.value)) {
            convertBtn.disabled = false;
        } else {
            convertBtn.disabled = true;
        }
    });

    // Handle currency change
    [fromCurrency, toCurrency].forEach(select => {
        select.addEventListener('change', function() {
            if (amountInput.value) {
                convertCurrency();
            }
        });
    });

    // Initialize
    populateCurrencyDropdowns();
    convertBtn.disabled = true;
}); 