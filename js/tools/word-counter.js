// Word Counter Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    const charNoSpaceCount = document.getElementById('char-no-space-count');
    const sentenceCount = document.getElementById('sentence-count');
    const paragraphCount = document.getElementById('paragraph-count');
    const readingTime = document.getElementById('reading-time');
    const clearBtn = document.getElementById('clear-btn');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

    // Constants
    const WORDS_PER_MINUTE = 200; // Average reading speed
    const SENTENCE_ENDINGS = ['.', '!', '?', '...'];

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

    // Count words in text
    function countWords(text) {
        // Remove extra whitespace and split by spaces
        const words = text.trim().split(/\s+/);
        // Filter out empty strings
        return words.filter(word => word.length > 0).length;
    }

    // Count characters in text
    function countCharacters(text) {
        return text.length;
    }

    // Count characters without spaces
    function countCharactersNoSpaces(text) {
        return text.replace(/\s/g, '').length;
    }

    // Count sentences in text
    function countSentences(text) {
        // Split by sentence endings followed by space or end of string
        const sentences = text.split(/[.!?]+(?:\s|$)/);
        // Filter out empty strings
        return sentences.filter(sentence => sentence.trim().length > 0).length;
    }

    // Count paragraphs in text
    function countParagraphs(text) {
        // Split by double newlines
        const paragraphs = text.split(/\n\s*\n/);
        // Filter out empty paragraphs
        return paragraphs.filter(paragraph => paragraph.trim().length > 0).length;
    }

    // Calculate reading time in minutes
    function calculateReadingTime(words) {
        return Math.ceil(words / WORDS_PER_MINUTE);
    }

    // Update all statistics
    function updateStats() {
        const text = textInput.value;

        // Update word count
        const words = countWords(text);
        wordCount.textContent = words;

        // Update character counts
        charCount.textContent = countCharacters(text);
        charNoSpaceCount.textContent = countCharactersNoSpaces(text);

        // Update sentence count
        sentenceCount.textContent = countSentences(text);

        // Update paragraph count
        paragraphCount.textContent = countParagraphs(text);

        // Update reading time
        readingTime.textContent = calculateReadingTime(words);
    }

    // Handle text input
    textInput.addEventListener('input', function() {
        updateStats();
    });

    // Handle clear button
    clearBtn.addEventListener('click', function() {
        textInput.value = '';
        updateStats();
        showInfo('Text cleared successfully');
    });

    // Handle paste event
    textInput.addEventListener('paste', function(e) {
        // Allow the paste to complete
        setTimeout(updateStats, 0);
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + A to select all text
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            textInput.select();
        }
        // Ctrl/Cmd + Z to undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            document.execCommand('undo');
        }
        // Ctrl/Cmd + Y to redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            document.execCommand('redo');
        }
    });

    // Initialize stats
    updateStats();
}); 