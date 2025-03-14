// Unit Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const categorySelect = document.getElementById('category-select');
    const valueInput = document.getElementById('value-input');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('convert-btn');
    const resultBox = document.getElementById('result-box');
    const resultValue = document.getElementById('result-value');
    const resultText = document.getElementById('result-text');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

    // Unit Definitions
    const units = {
        length: {
            meters: { name: 'Meters (m)', factor: 1 },
            kilometers: { name: 'Kilometers (km)', factor: 1000 },
            centimeters: { name: 'Centimeters (cm)', factor: 0.01 },
            millimeters: { name: 'Millimeters (mm)', factor: 0.001 },
            miles: { name: 'Miles (mi)', factor: 1609.344 },
            yards: { name: 'Yards (yd)', factor: 0.9144 },
            feet: { name: 'Feet (ft)', factor: 0.3048 },
            inches: { name: 'Inches (in)', factor: 0.0254 }
        },
        mass: {
            kilograms: { name: 'Kilograms (kg)', factor: 1 },
            grams: { name: 'Grams (g)', factor: 0.001 },
            milligrams: { name: 'Milligrams (mg)', factor: 0.000001 },
            pounds: { name: 'Pounds (lb)', factor: 0.45359237 },
            ounces: { name: 'Ounces (oz)', factor: 0.028349523125 },
            tons: { name: 'Tons (t)', factor: 1000 }
        },
        temperature: {
            celsius: { name: 'Celsius (°C)', factor: 1 },
            fahrenheit: { name: 'Fahrenheit (°F)', factor: 1 },
            kelvin: { name: 'Kelvin (K)', factor: 1 }
        },
        area: {
            squareMeters: { name: 'Square Meters (m²)', factor: 1 },
            squareKilometers: { name: 'Square Kilometers (km²)', factor: 1000000 },
            squareFeet: { name: 'Square Feet (ft²)', factor: 0.092903 },
            squareYards: { name: 'Square Yards (yd²)', factor: 0.836127 },
            acres: { name: 'Acres', factor: 4046.86 },
            hectares: { name: 'Hectares (ha)', factor: 10000 }
        },
        volume: {
            liters: { name: 'Liters (L)', factor: 1 },
            milliliters: { name: 'Milliliters (mL)', factor: 0.001 },
            cubicMeters: { name: 'Cubic Meters (m³)', factor: 1000 },
            gallons: { name: 'Gallons (gal)', factor: 3.78541 },
            quarts: { name: 'Quarts (qt)', factor: 0.946353 },
            pints: { name: 'Pints (pt)', factor: 0.473176 },
            cups: { name: 'Cups', factor: 0.236588 }
        },
        speed: {
            metersPerSecond: { name: 'Meters per Second (m/s)', factor: 1 },
            kilometersPerHour: { name: 'Kilometers per Hour (km/h)', factor: 0.277778 },
            milesPerHour: { name: 'Miles per Hour (mph)', factor: 0.44704 },
            knots: { name: 'Knots (kts)', factor: 0.514444 }
        },
        time: {
            seconds: { name: 'Seconds (s)', factor: 1 },
            minutes: { name: 'Minutes (min)', factor: 60 },
            hours: { name: 'Hours (h)', factor: 3600 },
            days: { name: 'Days', factor: 86400 },
            weeks: { name: 'Weeks', factor: 604800 }
        },
        pressure: {
            pascal: { name: 'Pascal (Pa)', factor: 1 },
            kilopascal: { name: 'Kilopascal (kPa)', factor: 1000 },
            bar: { name: 'Bar', factor: 100000 },
            psi: { name: 'PSI', factor: 6894.76 },
            atmosphere: { name: 'Atmosphere (atm)', factor: 101325 }
        }
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

    // Populate unit dropdowns based on selected category
    function populateUnitDropdowns(category) {
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        
        const categoryUnits = units[category];
        if (!categoryUnits) return;

        Object.entries(categoryUnits).forEach(([key, unit]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = unit.name;
            fromUnit.appendChild(option.cloneNode(true));
            toUnit.appendChild(option.cloneNode(true));
        });

        // Set default values
        if (category === 'temperature') {
            fromUnit.value = 'celsius';
            toUnit.value = 'fahrenheit';
        } else {
            fromUnit.value = Object.keys(categoryUnits)[0];
            toUnit.value = Object.keys(categoryUnits)[1];
        }
    }

    // Convert temperature
    function convertTemperature(value, from, to) {
        let celsius;
        
        // Convert to Celsius first
        switch(from) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }

        // Convert from Celsius to target unit
        switch(to) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return (celsius * 9/5) + 32;
            case 'kelvin':
                return celsius + 273.15;
        }
    }

    // Convert units
    function convertUnits() {
        const value = parseFloat(valueInput.value);
        const category = categorySelect.value;
        const from = fromUnit.value;
        const to = toUnit.value;

        if (!value || isNaN(value)) {
            showError('Please enter a valid number');
            return;
        }

        try {
            let result;
            
            if (category === 'temperature') {
                result = convertTemperature(value, from, to);
            } else {
                const fromFactor = units[category][from].factor;
                const toFactor = units[category][to].factor;
                result = (value * fromFactor) / toFactor;
            }

            // Format result based on magnitude
            const formattedResult = Math.abs(result) < 0.01 || Math.abs(result) >= 1000000
                ? result.toExponential(6)
                : result.toFixed(6).replace(/\.?0+$/, '');

            resultValue.textContent = formattedResult;
            resultText.textContent = `${value} ${units[category][from].name} = ${formattedResult} ${units[category][to].name}`;
            resultBox.classList.remove('d-none');
            
            showInfo('Conversion completed successfully');
        } catch (error) {
            showError('Failed to convert units. Please try again.');
            console.error('Conversion error:', error);
        }
    }

    // Swap units
    function swapUnits() {
        const temp = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = temp;

        if (valueInput.value) {
            convertUnits();
        }
    }

    // Handle common conversion buttons
    function handleCommonConversion(e) {
        if (e.target.classList.contains('list-group-item-action')) {
            categorySelect.value = e.target.dataset.category;
            populateUnitDropdowns(e.target.dataset.category);
            fromUnit.value = e.target.dataset.from;
            toUnit.value = e.target.dataset.to;
            if (valueInput.value) {
                convertUnits();
            }
        }
    }

    // Event Listeners
    categorySelect.addEventListener('change', () => populateUnitDropdowns(categorySelect.value));
    convertBtn.addEventListener('click', convertUnits);
    swapBtn.addEventListener('click', swapUnits);
    document.querySelector('.list-group').addEventListener('click', handleCommonConversion);

    // Handle value input
    valueInput.addEventListener('input', function() {
        if (this.value && !isNaN(this.value)) {
            convertBtn.disabled = false;
        } else {
            convertBtn.disabled = true;
        }
    });

    // Initialize
    populateUnitDropdowns(categorySelect.value);
    convertBtn.disabled = true;
}); 