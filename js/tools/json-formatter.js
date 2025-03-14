// Initialize CodeMirror editor
let editor = CodeMirror(document.getElementById('editor'), {
    mode: 'application/json',
    theme: 'monokai',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 4,
    tabSize: 4,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-Q': function(cm) { cm.foldCode(cm.getCursor()); }
    }
});

// Get DOM elements
const formatBtn = document.getElementById('format-btn');
const minifyBtn = document.getElementById('minify-btn');
const validateBtn = document.getElementById('validate-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const infoAlert = document.getElementById('info-alert');
const errorAlert = document.getElementById('error-alert');

// Format JSON with proper indentation
function formatJSON(jsonString) {
    try {
        const obj = JSON.parse(jsonString);
        return JSON.stringify(obj, null, 4);
    } catch (error) {
        throw new Error('Invalid JSON: ' + error.message);
    }
}

// Minify JSON by removing whitespace
function minifyJSON(jsonString) {
    try {
        const obj = JSON.parse(jsonString);
        return JSON.stringify(obj);
    } catch (error) {
        throw new Error('Invalid JSON: ' + error.message);
    }
}

// Validate JSON and return detailed information
function validateJSON(jsonString) {
    try {
        const obj = JSON.parse(jsonString);
        const info = {
            isValid: true,
            type: typeof obj,
            size: JSON.stringify(obj).length,
            depth: getObjectDepth(obj),
            keys: Object.keys(obj).length
        };
        return info;
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
}

// Calculate object depth
function getObjectDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    let depth = 0;
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            depth = Math.max(depth, getObjectDepth(obj[key]) + 1);
        }
    }
    return depth;
}

// Show info message
function showInfo(message) {
    infoAlert.textContent = message;
    infoAlert.classList.remove('d-none');
    errorAlert.classList.add('d-none');
}

// Show error message
function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove('d-none');
    infoAlert.classList.add('d-none');
}

// Format button click handler
formatBtn.addEventListener('click', () => {
    try {
        const formatted = formatJSON(editor.getValue());
        editor.setValue(formatted);
        showInfo('JSON formatted successfully');
    } catch (error) {
        showError(error.message);
    }
});

// Minify button click handler
minifyBtn.addEventListener('click', () => {
    try {
        const minified = minifyJSON(editor.getValue());
        editor.setValue(minified);
        showInfo('JSON minified successfully');
    } catch (error) {
        showError(error.message);
    }
});

// Validate button click handler
validateBtn.addEventListener('click', () => {
    const validation = validateJSON(editor.getValue());
    if (validation.isValid) {
        showInfo(`JSON is valid! Type: ${validation.type}, Size: ${validation.size} bytes, Depth: ${validation.depth}, Keys: ${validation.keys}`);
    } else {
        showError(`Invalid JSON: ${validation.error}`);
    }
});

// Copy button click handler
copyBtn.addEventListener('click', () => {
    const text = editor.getValue();
    navigator.clipboard.writeText(text).then(() => {
        showInfo('JSON copied to clipboard');
    }).catch(() => {
        showError('Failed to copy to clipboard');
    });
});

// Clear button click handler
clearBtn.addEventListener('click', () => {
    editor.setValue('');
    infoAlert.classList.add('d-none');
    errorAlert.classList.add('d-none');
});

// Theme change handler
document.addEventListener('themeChanged', (e) => {
    editor.setOption('theme', e.detail.isDark ? 'monokai' : 'default');
});

// Set initial theme
editor.setOption('theme', document.body.classList.contains('dark-mode') ? 'monokai' : 'default');

// Set initial content
editor.setValue('{\n    "example": "JSON data",\n    "numbers": [1, 2, 3],\n    "nested": {\n        "key": "value"\n    }\n}'); 