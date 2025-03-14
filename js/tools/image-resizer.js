// Image Resizer Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const originalPreview = document.getElementById('original-preview');
    const resizedPreview = document.getElementById('resized-preview');
    const originalSize = document.getElementById('original-size');
    const originalDimensions = document.getElementById('original-dimensions');
    const resizedSize = document.getElementById('resized-size');
    const resizedDimensions = document.getElementById('resized-dimensions');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const maintainAspect = document.getElementById('maintain-aspect');
    const qualityRange = document.getElementById('quality-range');
    const qualityValue = document.getElementById('quality-value');
    const resizeBtn = document.getElementById('resize-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

    // Variables
    let originalImage = null;
    let resizedImageBlob = null;
    let originalAspectRatio = 1;

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            return;
        }

        // Create object URL for preview
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.onload = function() {
                // Set original dimensions
                originalDimensions.textContent = `${originalImage.width} × ${originalImage.height}`;
                originalSize.textContent = formatFileSize(file.size);

                // Set aspect ratio
                originalAspectRatio = originalImage.width / originalImage.height;

                // Set initial dimensions maintaining aspect ratio
                if (maintainAspect.checked) {
                    const maxDimension = 800;
                    if (originalImage.width > originalImage.height) {
                        widthInput.value = maxDimension;
                        heightInput.value = Math.round(maxDimension / originalAspectRatio);
                    } else {
                        heightInput.value = maxDimension;
                        widthInput.value = Math.round(maxDimension * originalAspectRatio);
                    }
                } else {
                    widthInput.value = originalImage.width;
                    heightInput.value = originalImage.height;
                }

                // Show preview
                originalPreview.src = e.target.result;
                originalPreview.style.display = 'block';

                // Enable buttons
                resizeBtn.disabled = false;
                resetBtn.disabled = false;

                showInfo('Image loaded successfully');
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Handle drag and drop
    const uploadSection = document.querySelector('.upload-section');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadSection.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadSection.classList.add('border-primary');
    }

    function unhighlight(e) {
        uploadSection.classList.remove('border-primary');
    }

    uploadSection.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change'));
        } else {
            showError('Please drop an image file');
        }
    }

    // Handle dimension inputs
    widthInput.addEventListener('input', function() {
        if (maintainAspect.checked) {
            heightInput.value = Math.round(this.value / originalAspectRatio);
        }
    });

    heightInput.addEventListener('input', function() {
        if (maintainAspect.checked) {
            widthInput.value = Math.round(this.value * originalAspectRatio);
        }
    });

    // Handle aspect ratio checkbox
    maintainAspect.addEventListener('change', function() {
        if (this.checked) {
            heightInput.value = Math.round(widthInput.value / originalAspectRatio);
        }
    });

    // Handle quality range
    qualityRange.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });

    // Resize image
    resizeBtn.addEventListener('click', function() {
        if (!originalImage) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = parseInt(widthInput.value);
        canvas.height = parseInt(heightInput.value);

        // Draw image
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob(function(blob) {
            resizedImageBlob = blob;
            resizedPreview.src = URL.createObjectURL(blob);
            resizedPreview.style.display = 'block';
            resizedSize.textContent = formatFileSize(blob.size);
            resizedDimensions.textContent = `${canvas.width} × ${canvas.height}`;
            downloadBtn.disabled = false;
            showInfo('Image resized successfully');
        }, 'image/jpeg', qualityRange.value / 100);
    });

    // Download resized image
    downloadBtn.addEventListener('click', function() {
        if (!resizedImageBlob) return;

        const url = URL.createObjectURL(resizedImageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resized_${new Date().toISOString().slice(0,10)}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showInfo('Image downloaded successfully');
    });

    // Reset tool
    resetBtn.addEventListener('click', function() {
        fileInput.value = '';
        originalPreview.src = '';
        originalPreview.style.display = 'none';
        resizedPreview.src = '';
        resizedPreview.style.display = 'none';
        originalSize.textContent = '-';
        originalDimensions.textContent = '-';
        resizedSize.textContent = '-';
        resizedDimensions.textContent = '-';
        widthInput.value = '';
        heightInput.value = '';
        qualityRange.value = 80;
        qualityValue.textContent = '80%';
        originalImage = null;
        resizedImageBlob = null;
        resizeBtn.disabled = true;
        downloadBtn.disabled = true;
        resetBtn.disabled = true;
        showInfo('Tool reset successfully');
    });
}); 