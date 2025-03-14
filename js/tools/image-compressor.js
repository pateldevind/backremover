// Image Compressor Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const imageList = document.getElementById('image-list');
    const qualityRange = document.getElementById('quality-range');
    const qualityValue = document.getElementById('quality-value');
    const maxWidthInput = document.getElementById('max-width-input');
    const maxHeightInput = document.getElementById('max-height-input');
    const maintainAspect = document.getElementById('maintain-aspect');
    const compressBtn = document.getElementById('compress-btn');
    const resetBtn = document.getElementById('reset-btn');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');
    const totalSize = document.getElementById('total-size');
    const totalSavings = document.getElementById('total-savings');
    const compressionRatio = document.getElementById('compression-ratio');

    // Variables
    let selectedImages = [];
    let originalTotalSize = 0;
    let compressedTotalSize = 0;

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

    // Update compression statistics
    function updateStats() {
        totalSize.textContent = formatFileSize(originalTotalSize);
        const savings = originalTotalSize - compressedTotalSize;
        totalSavings.textContent = formatFileSize(savings);
        const ratio = originalTotalSize > 0 ? ((savings / originalTotalSize) * 100).toFixed(1) : 0;
        compressionRatio.textContent = `${ratio}%`;
    }

    // Create image list item
    function createImageListItem(file) {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-image me-3 text-primary"></i>
                <div>
                    <div class="fw-bold">${file.name}</div>
                    <small class="text-muted">${formatFileSize(file.size)}</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <span class="badge bg-primary rounded-pill me-2 compression-badge">Pending</span>
                <button class="btn btn-sm btn-danger remove-image">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add remove button functionality
        listItem.querySelector('.remove-image').addEventListener('click', () => {
            selectedImages = selectedImages.filter(img => img !== file);
            originalTotalSize -= file.size;
            listItem.remove();
            updateStats();
            updateButtons();
        });

        return listItem;
    }

    // Update button states
    function updateButtons() {
        compressBtn.disabled = selectedImages.length === 0;
        resetBtn.disabled = selectedImages.length === 0;
    }

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                showError(`Invalid file type: ${file.name}`);
                return false;
            }
            return true;
        });

        // Add valid files to the list
        validFiles.forEach(file => {
            if (!selectedImages.includes(file)) {
                selectedImages.push(file);
                originalTotalSize += file.size;
                imageList.appendChild(createImageListItem(file));
            }
        });

        updateStats();
        updateButtons();
        if (validFiles.length > 0) {
            showInfo(`${validFiles.length} image(s) added successfully`);
        }
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
        uploadSection.classList.add('dragover');
    }

    function unhighlight(e) {
        uploadSection.classList.remove('dragover');
    }

    uploadSection.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        
        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                showError(`Invalid file type: ${file.name}`);
                return false;
            }
            return true;
        });

        // Add valid files to the list
        validFiles.forEach(file => {
            if (!selectedImages.includes(file)) {
                selectedImages.push(file);
                originalTotalSize += file.size;
                imageList.appendChild(createImageListItem(file));
            }
        });

        updateStats();
        updateButtons();
        if (validFiles.length > 0) {
            showInfo(`${validFiles.length} image(s) added successfully`);
        }
    }

    // Handle quality range
    qualityRange.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });

    // Compress images
    compressBtn.addEventListener('click', async function() {
        if (selectedImages.length === 0) return;

        compressBtn.disabled = true;
        compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Compressing...';
        compressedTotalSize = 0;

        const maxWidth = parseInt(maxWidthInput.value);
        const maxHeight = parseInt(maxHeightInput.value);
        const quality = qualityRange.value / 100;

        try {
            for (const file of selectedImages) {
                const listItem = Array.from(imageList.children).find(item => 
                    item.querySelector('.fw-bold').textContent === file.name
                );
                const badge = listItem.querySelector('.compression-badge');
                badge.textContent = 'Processing...';
                badge.className = 'badge bg-warning rounded-pill me-2 compression-badge';

                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });

                // Calculate new dimensions
                let newWidth = img.width;
                let newHeight = img.height;

                if (maintainAspect.checked) {
                    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                    if (ratio < 1) {
                        newWidth = Math.round(img.width * ratio);
                        newHeight = Math.round(img.height * ratio);
                    }
                } else {
                    if (img.width > maxWidth) newWidth = maxWidth;
                    if (img.height > maxHeight) newHeight = maxHeight;
                }

                // Create canvas and compress
                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                // Convert to blob
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/jpeg', quality);
                });

                compressedTotalSize += blob.size;
                updateStats();

                // Update badge
                const savings = file.size - blob.size;
                const ratio = ((savings / file.size) * 100).toFixed(1);
                badge.textContent = `${ratio}% smaller`;
                badge.className = 'badge bg-success rounded-pill me-2 compression-badge';

                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            showInfo('Images compressed and downloaded successfully');
        } catch (error) {
            console.error('Compression error:', error);
            showError('Failed to compress images. Please try again.');
        } finally {
            compressBtn.disabled = false;
            compressBtn.innerHTML = '<i class="fas fa-compress-alt me-2"></i>Compress Images';
        }
    });

    // Reset tool
    resetBtn.addEventListener('click', function() {
        fileInput.value = '';
        imageList.innerHTML = '';
        selectedImages = [];
        originalTotalSize = 0;
        compressedTotalSize = 0;
        qualityRange.value = 80;
        qualityValue.textContent = '80%';
        maxWidthInput.value = '1920';
        maxHeightInput.value = '1080';
        maintainAspect.checked = true;
        compressBtn.disabled = true;
        resetBtn.disabled = true;
        updateStats();
        showInfo('Tool reset successfully');
    });
}); 