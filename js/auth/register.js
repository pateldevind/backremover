document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password requirement checks
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');

    // Show error message
    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        successAlert.classList.add('d-none');
    }

    // Show success message
    function showSuccess(message) {
        successAlert.textContent = message;
        successAlert.classList.remove('d-none');
        errorAlert.classList.add('d-none');
    }

    // Update password requirement indicators
    function updatePasswordRequirements(password) {
        // Length check (8 or more characters)
        if (password.length >= 8) {
            lengthCheck.classList.replace('requirement-unmet', 'requirement-met');
            lengthCheck.classList.replace('fa-circle', 'fa-check-circle');
        } else {
            lengthCheck.classList.replace('requirement-met', 'requirement-unmet');
            lengthCheck.classList.replace('fa-check-circle', 'fa-circle');
        }

        // Uppercase letter check
        if (/[A-Z]/.test(password)) {
            uppercaseCheck.classList.replace('requirement-unmet', 'requirement-met');
            uppercaseCheck.classList.replace('fa-circle', 'fa-check-circle');
        } else {
            uppercaseCheck.classList.replace('requirement-met', 'requirement-unmet');
            uppercaseCheck.classList.replace('fa-check-circle', 'fa-circle');
        }

        // Number check
        if (/\d/.test(password)) {
            numberCheck.classList.replace('requirement-unmet', 'requirement-met');
            numberCheck.classList.replace('fa-circle', 'fa-check-circle');
        } else {
            numberCheck.classList.replace('requirement-met', 'requirement-unmet');
            numberCheck.classList.replace('fa-check-circle', 'fa-circle');
        }

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            specialCheck.classList.replace('requirement-unmet', 'requirement-met');
            specialCheck.classList.replace('fa-circle', 'fa-check-circle');
        } else {
            specialCheck.classList.replace('requirement-met', 'requirement-unmet');
            specialCheck.classList.replace('fa-check-circle', 'fa-circle');
        }
    }

    // Password input event listener
    passwordInput.addEventListener('input', function() {
        updatePasswordRequirements(this.value);
    });

    // Validate password
    function isValidPassword(password) {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /\d/.test(password) && 
               /[!@#$%^&*(),.?":{}|<>]/.test(password);
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Handle form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const terms = document.getElementById('terms').checked;

        try {
            // Basic validation
            if (!fullName || !email || !password || !confirmPassword) {
                showError('Please fill in all fields');
                return;
            }

            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }

            if (!isValidPassword(password)) {
                showError('Please meet all password requirements');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            if (!terms) {
                showError('Please accept the Terms of Service and Privacy Policy');
                return;
            }

            // Show loading state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating account...';
            submitButton.disabled = true;

            // Simulate API call (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password
                })
            });

            if (response.ok) {
                showSuccess('Account created successfully! Redirecting to login...');
                
                // Redirect to login page after successful registration
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                const data = await response.json();
                showError(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('An error occurred. Please try again later.');
        } finally {
            // Reset button state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
}); 