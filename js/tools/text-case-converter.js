// Text Case Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const previewText = document.getElementById('preview-text');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
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

    // Convert to uppercase
    function toUpperCase(text) {
        return text.toUpperCase();
    }

    // Convert to lowercase
    function toLowerCase(text) {
        return text.toLowerCase();
    }

    // Convert to title case
    function toTitleCase(text) {
        return text.replace(/\w\S*/g, function(word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        });
    }

    // Convert to sentence case
    function toSentenceCase(text) {
        return text.replace(/(^\w|\.\s+\w)/gm, letter => letter.toUpperCase());
    }

    // Convert to camel case
    function toCamelCase(text) {
        return text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(word, index) {
            if (+word === 0) return '';
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/[^a-zA-Z0-9]/g, '');
    }

    // Convert to pascal case
    function toPascalCase(text) {
        return text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(word) {
            if (+word === 0) return '';
            return word.toUpperCase();
        }).replace(/[^a-zA-Z0-9]/g, '');
    }

    // Convert to snake case
    function toSnakeCase(text) {
        return text.replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase();
    }

    // Convert to kebab case
    function toKebabCase(text) {
        return text.replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase();
    }

    // Convert to alternating case
    function toAlternatingCase(text) {
        return text.split('').map((char, index) => 
            index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        ).join('');
    }

    // Convert text based on case type
    function convertText(text, caseType) {
        switch(caseType) {
            case 'upper':
                return toUpperCase(text);
            case 'lower':
                return toLowerCase(text);
            case 'title':
                return toTitleCase(text);
            case 'sentence':
                return toSentenceCase(text);
            case 'camel':
                return toCamelCase(text);
            case 'pascal':
                return toPascalCase(text);
            case 'snake':
                return toSnakeCase(text);
            case 'kebab':
                return toKebabCase(text);
            case 'alternating':
                return toAlternatingCase(text);
            default:
                return text;
        }
    }

    // Handle case conversion buttons
    document.querySelectorAll('.case-btn').forEach(button => {
        button.addEventListener('click', function() {
            const text = textInput.value;
            if (!text.trim()) {
                showError('Please enter some text first');
                return;
            }

            const caseType = this.dataset.case;
            const convertedText = convertText(text, caseType);
            previewText.textContent = convertedText;

            // Update active state
            document.querySelectorAll('.case-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Handle copy button
    copyBtn.addEventListener('click', async function() {
        const text = previewText.textContent;
        if (!text.trim()) {
            showError('No text to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            showInfo('Text copied to clipboard');
        } catch (err) {
            showError('Failed to copy text');
        }
    });

    // Handle clear button
    clearBtn.addEventListener('click', function() {
        textInput.value = '';
        previewText.textContent = '';
        document.querySelectorAll('.case-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        showInfo('Text cleared successfully');
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + A to select all text
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            if (document.activeElement === textInput) {
                e.preventDefault();
                textInput.select();
            }
        }
        // Ctrl/Cmd + C to copy converted text
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement !== textInput) {
            e.preventDefault();
            copyBtn.click();
        }
    });

    // Handle paste event
    textInput.addEventListener('paste', function(e) {
        // Clear preview when new text is pasted
        setTimeout(() => {
            previewText.textContent = '';
            document.querySelectorAll('.case-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }, 0);
    });
}); 