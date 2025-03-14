document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
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

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Handle form submission
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;

        try {
            // Basic validation
            if (!email) {
                showError('Please enter your email address');
                return;
            }

            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }

            // Show loading state
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
            submitButton.disabled = true;

            // Simulate API call (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                // Clear the form
                forgotPasswordForm.reset();
                
                // Show success message with detailed instructions
                showSuccess(`Password reset link has been sent to ${email}. Please check your email inbox and follow the instructions to reset your password. If you don't see the email, please check your spam folder.`);
                
                // Disable the form temporarily to prevent multiple submissions
                submitButton.disabled = true;
                setTimeout(() => {
                    submitButton.disabled = false;
                }, 60000); // Enable after 1 minute
            } else {
                const data = await response.json();
                showError(data.message || 'Failed to send reset link. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showError('An error occurred. Please try again later.');
        } finally {
            // Reset button state
            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Add input event listener to clear alerts when user starts typing
    document.getElementById('email').addEventListener('input', function() {
        errorAlert.classList.add('d-none');
        successAlert.classList.add('d-none');
    });
}); 