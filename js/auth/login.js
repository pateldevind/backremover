document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');

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

    // Handle Google Sign-In
    window.handleGoogleSignIn = async function(credential) {
        try {
            // Show loading state
            const googleBtn = document.querySelector('.google-btn');
            if (googleBtn) {
                const originalContent = googleBtn.innerHTML;
                googleBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                googleBtn.disabled = true;
            }

            // Send the credential to your backend
            const response = await fetch('/api/auth/google-signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Store authentication token
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }

                showSuccess('Login successful! Redirecting...');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                const data = await response.json();
                showError(data.message || 'Google Sign-In failed. Please try again.');
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            showError('An error occurred during Google Sign-In. Please try again.');
        } finally {
            // Reset Google button state
            const googleBtn = document.querySelector('.google-btn');
            if (googleBtn) {
                googleBtn.innerHTML = '<i class="fab fa-google"></i>';
                googleBtn.disabled = false;
            }
        }
    };

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        try {
            // Basic validation
            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }

            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }

            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';
            submitButton.disabled = true;

            // Simulate API call (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    remember
                })
            });

            if (response.ok) {
                showSuccess('Login successful! Redirecting...');
                
                // Store authentication token (if using JWT)
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }

                // Redirect to dashboard after successful login
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                const data = await response.json();
                showError(data.message || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred. Please try again later.');
        } finally {
            // Reset button state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Handle social login buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (button.classList.contains('google-btn')) {
                // The Google Sign-In popup will be handled by the Google client library
                return;
            }
            // TODO: Implement other social login functionality
            showError('This social login option is not implemented yet');
        });
    });
}); 