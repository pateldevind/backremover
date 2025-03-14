// Image Converter Tool
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('image-input');
    const conversionOptions = document.getElementById('conversion-options');
    const originalPreview = document.getElementById('original-preview');
    const convertedPreview = document.getElementById('converted-preview');
    const convertBtn = document.getElementById('convert-btn');
    const downloadBtn = document.getElementById('download-btn');
    const formatSelect = document.getElementById('format-select');
    const qualitySelect = document.getElementById('quality-select');

    let originalImage = null;

    // Handle file input change
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                originalImage = new Image();
                originalImage.onload = function() {
                    originalPreview.src = e.target.result;
                    conversionOptions.classList.remove('d-none');
                    downloadBtn.classList.add('d-none');
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
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
            imageInput.files = dt.files;
            const event = new Event('change');
            imageInput.dispatchEvent(event);
        } else {
            alert('Please drop an image file.');
        }
    }

    // Handle conversion
    convertBtn.addEventListener('click', function() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match original image
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        
        // Draw original image
        ctx.drawImage(originalImage, 0, 0);
        
        // Convert to selected format
        const format = formatSelect.value;
        const quality = parseFloat(qualitySelect.value);
        
        try {
            const convertedDataUrl = canvas.toDataURL(`image/${format}`, quality);
            convertedPreview.src = convertedDataUrl;
            downloadBtn.classList.remove('d-none');
            
            // Store the converted data URL for download
            downloadBtn.onclick = function() {
                const link = document.createElement('a');
                link.download = `converted-image.${format}`;
                link.href = convertedDataUrl;
                link.click();
            };
        } catch (error) {
            console.error('Error converting image:', error);
            alert('Error converting image. Please try again.');
        }
    });
}); 