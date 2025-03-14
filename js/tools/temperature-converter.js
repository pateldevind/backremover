// Temperature Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const celsiusInput = document.getElementById('celsius-input');
    const fahrenheitInput = document.getElementById('fahrenheit-input');
    const kelvinInput = document.getElementById('kelvin-input');
    const convertBtn = document.getElementById('convert-btn');
    const resultBox = document.getElementById('result-box');
    const celsiusResult = document.getElementById('celsius-result');
    const fahrenheitResult = document.getElementById('fahrenheit-result');
    const kelvinResult = document.getElementById('kelvin-result');
    const conversionFormula = document.getElementById('conversion-formula');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

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

    // Format temperature value
    function formatTemp(value) {
        return Number(value).toFixed(2).replace(/\.?0+$/, '');
    }

    // Convert from Celsius
    function convertFromCelsius(celsius) {
        const fahrenheit = (celsius * 9/5) + 32;
        const kelvin = celsius + 273.15;
        return { celsius, fahrenheit, kelvin };
    }

    // Convert from Fahrenheit
    function convertFromFahrenheit(fahrenheit) {
        const celsius = (fahrenheit - 32) * 5/9;
        const kelvin = (fahrenheit - 32) * 5/9 + 273.15;
        return { celsius, fahrenheit, kelvin };
    }

    // Convert from Kelvin
    function convertFromKelvin(kelvin) {
        const celsius = kelvin - 273.15;
        const fahrenheit = (kelvin - 273.15) * 9/5 + 32;
        return { celsius, fahrenheit, kelvin };
    }

    // Get active input and value
    function getActiveInput() {
        const activeTab = document.querySelector('.tab-pane.active');
        const input = activeTab.querySelector('input');
        return {
            unit: activeTab.id,
            value: parseFloat(input.value)
        };
    }

    // Update results
    function updateResults(results) {
        celsiusResult.textContent = `${formatTemp(results.celsius)}°C`;
        fahrenheitResult.textContent = `${formatTemp(results.fahrenheit)}°F`;
        kelvinResult.textContent = `${formatTemp(results.kelvin)}K`;
        resultBox.classList.remove('d-none');
    }

    // Update conversion formula
    function updateFormula(fromUnit, value) {
        let formula = '';
        switch(fromUnit) {
            case 'celsius':
                formula = `${value}°C × 9/5 + 32 = ${formatTemp((value * 9/5) + 32)}°F\n` +
                         `${value}°C + 273.15 = ${formatTemp(value + 273.15)}K`;
                break;
            case 'fahrenheit':
                formula = `(${value}°F - 32) × 5/9 = ${formatTemp((value - 32) * 5/9)}°C\n` +
                         `(${value}°F - 32) × 5/9 + 273.15 = ${formatTemp((value - 32) * 5/9 + 273.15)}K`;
                break;
            case 'kelvin':
                formula = `${value}K - 273.15 = ${formatTemp(value - 273.15)}°C\n` +
                         `(${value}K - 273.15) × 9/5 + 32 = ${formatTemp((value - 273.15) * 9/5 + 32)}°F`;
                break;
        }
        conversionFormula.textContent = formula;
    }

    // Convert temperature
    function convertTemperature() {
        const { unit, value } = getActiveInput();

        if (!value && value !== 0) {
            showError('Please enter a valid temperature');
            return;
        }

        try {
            let results;
            switch(unit) {
                case 'celsius':
                    results = convertFromCelsius(value);
                    break;
                case 'fahrenheit':
                    results = convertFromFahrenheit(value);
                    break;
                case 'kelvin':
                    if (value < 0) {
                        showError('Kelvin cannot be negative');
                        return;
                    }
                    results = convertFromKelvin(value);
                    break;
            }

            updateResults(results);
            updateFormula(unit, value);
            showInfo('Temperature converted successfully');
        } catch (error) {
            showError('Failed to convert temperature. Please try again.');
            console.error('Conversion error:', error);
        }
    }

    // Handle quick conversion
    function handleQuickConvert(e) {
        if (e.target.classList.contains('quick-convert')) {
            const temp = parseFloat(e.target.dataset.temp);
            const unit = e.target.dataset.unit;
            
            // Show the corresponding tab
            const tab = document.querySelector(`[data-bs-target="#${unit}"]`);
            bootstrap.Tab.getOrCreateInstance(tab).show();

            // Set the input value
            const input = document.getElementById(`${unit}-input`);
            input.value = temp;

            // Convert
            convertTemperature();
        }
    }

    // Handle input changes
    function handleInput(e) {
        const value = e.target.value;
        if (value || value === '0') {
            convertBtn.disabled = false;
            if (e.key === 'Enter') {
                convertTemperature();
            }
        } else {
            convertBtn.disabled = true;
        }
    }

    // Event Listeners
    convertBtn.addEventListener('click', convertTemperature);
    document.querySelector('.list-group').addEventListener('click', handleQuickConvert);

    // Add input event listeners to all temperature inputs
    [celsiusInput, fahrenheitInput, kelvinInput].forEach(input => {
        input.addEventListener('input', handleInput);
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                convertTemperature();
            }
        });
    });

    // Initialize
    convertBtn.disabled = true;
}); 