// Password Generator Tool
document.addEventListener('DOMContentLoaded', function() {
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const generateBtn = document.getElementById('generate-btn');
    const lengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    // Character sets with entropy information
    const charSets = {
        uppercase: {
            chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            entropy: 4.7 // log2(26)
        },
        lowercase: {
            chars: 'abcdefghijklmnopqrstuvwxyz',
            entropy: 4.7
        },
        numbers: {
            chars: '0123456789',
            entropy: 3.3 // log2(10)
        },
        symbols: {
            chars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            entropy: 5.0 // log2(32)
        }
    };

    // Similar and ambiguous characters to exclude
    const similarChars = 'il1Lo0';
    const ambiguousChars = '{}[]()/\\\'"`~';

    // Update length value display
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Secure random number generator
    function secureRandom(min, max) {
        const range = max - min + 1;
        const bytesNeeded = Math.ceil(Math.log2(range) / 8);
        const maxNum = Math.pow(256, bytesNeeded) - (Math.pow(256, bytesNeeded) % range);
        const ar = new Uint8Array(bytesNeeded);

        while (true) {
            crypto.getRandomValues(ar);
            let val = 0;
            for (let i = 0; i < bytesNeeded; i++) {
                val = (val << 8) + ar[i];
            }

            if (val < maxNum) {
                return min + (val % range);
            }
        }
    }

    // Generate password with improved security
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const options = {
            uppercase: document.getElementById('uppercase').checked,
            lowercase: document.getElementById('lowercase').checked,
            numbers: document.getElementById('numbers').checked,
            symbols: document.getElementById('symbols').checked,
            excludeSimilar: document.getElementById('exclude-similar').checked,
            excludeAmbiguous: document.getElementById('exclude-ambiguous').checked
        };

        // Validate at least one option is selected
        if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
            alert('Please select at least one character type.');
            return;
        }

        // Build character set based on options
        let charset = '';
        let totalEntropy = 0;
        let selectedSets = [];

        if (options.uppercase) {
            charset += charSets.uppercase.chars;
            totalEntropy += charSets.uppercase.entropy;
            selectedSets.push(charSets.uppercase);
        }
        if (options.lowercase) {
            charset += charSets.lowercase.chars;
            totalEntropy += charSets.lowercase.entropy;
            selectedSets.push(charSets.lowercase);
        }
        if (options.numbers) {
            charset += charSets.numbers.chars;
            totalEntropy += charSets.numbers.entropy;
            selectedSets.push(charSets.numbers);
        }
        if (options.symbols) {
            charset += charSets.symbols.chars;
            totalEntropy += charSets.symbols.entropy;
            selectedSets.push(charSets.symbols);
        }

        // Remove excluded characters
        if (options.excludeSimilar) {
            charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
        }
        if (options.excludeAmbiguous) {
            charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }

        // Generate password with improved security
        let password = '';
        const positions = new Set();

        // First, ensure at least one character from each selected type
        selectedSets.forEach(set => {
            let pos;
            do {
                pos = secureRandom(0, length - 1);
            } while (positions.has(pos));
            positions.add(pos);
            password += set.chars[secureRandom(0, set.chars.length - 1)];
        });

        // Fill remaining positions
        for (let i = 0; i < length; i++) {
            if (!positions.has(i)) {
                password += charset[secureRandom(0, charset.length - 1)];
            }
        }

        // Shuffle the password using Fisher-Yates algorithm
        password = password.split('');
        for (let i = password.length - 1; i > 0; i--) {
            const j = secureRandom(0, i);
            [password[i], password[j]] = [password[j], password[i]];
        }
        password = password.join('');

        // Update password output
        passwordOutput.value = password;

        // Update strength indicator with entropy calculation
        updateStrengthIndicator(password, totalEntropy * length);
    }

    // Calculate password strength with entropy
    function calculateStrength(password, entropy) {
        let strength = 0;
        const length = password.length;
        
        // Entropy contribution (up to 50 points)
        strength += Math.min(entropy / 10, 50);
        
        // Length contribution (up to 25 points)
        strength += Math.min(length * 2, 25);
        
        // Character type contribution
        if (/[A-Z]/.test(password)) strength += 10;
        if (/[a-z]/.test(password)) strength += 10;
        if (/[0-9]/.test(password)) strength += 10;
        if (/[^A-Za-z0-9]/.test(password)) strength += 15;
        
        // Unique character contribution
        const uniqueChars = new Set(password).size;
        strength += Math.min(uniqueChars * 2, 20);
        
        return Math.min(strength, 100);
    }

    // Update strength indicator with entropy information
    function updateStrengthIndicator(password, entropy) {
        const strength = calculateStrength(password, entropy);
        strengthBar.style.width = strength + '%';
        
        // Update strength bar color and text
        let strengthLabel;
        if (strength < 25) {
            strengthBar.className = 'progress-bar bg-danger';
            strengthLabel = 'Very Weak';
        } else if (strength < 50) {
            strengthBar.className = 'progress-bar bg-warning';
            strengthLabel = 'Weak';
        } else if (strength < 75) {
            strengthBar.className = 'progress-bar bg-info';
            strengthLabel = 'Medium';
        } else if (strength < 90) {
            strengthBar.className = 'progress-bar bg-primary';
            strengthLabel = 'Strong';
        } else {
            strengthBar.className = 'progress-bar bg-success';
            strengthLabel = 'Very Strong';
        }

        strengthText.textContent = `Strength: ${strengthLabel} (Entropy: ${Math.round(entropy)} bits)`;
    }

    // Copy password to clipboard
    copyBtn.addEventListener('click', function() {
        if (passwordOutput.value) {
            passwordOutput.select();
            document.execCommand('copy');
            
            // Show feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        }
    });

    // Generate password on button click
    generateBtn.addEventListener('click', generatePassword);

    // Generate initial password
    generatePassword();
}); 