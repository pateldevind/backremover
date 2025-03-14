// Image Cropper Tool
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const cropperImage = document.getElementById('cropper-image');
    const cropperContainer = document.querySelector('.cropper-container');
    const aspectRatioOptions = document.querySelector('.aspect-ratio-options');
    const cropBtn = document.getElementById('crop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const infoAlert = document.getElementById('info-alert');
    const errorAlert = document.getElementById('error-alert');

    // Variables
    let cropper = null;
    let currentFile = null;

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

    // Initialize Cropper
    function initCropper(imageUrl) {
        // Destroy existing cropper if any
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        // Show cropper container and options
        cropperContainer.classList.remove('d-none');
        aspectRatioOptions.classList.remove('d-none');

        // Set image source
        cropperImage.src = imageUrl;

        // Initialize new cropper
        cropper = new Cropper(cropperImage, {
            aspectRatio: NaN, // Free aspect ratio
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: true,
            responsive: true,
            minContainerWidth: 300,
            minContainerHeight: 300,
            background: true,
            modal: true,
            zoomable: true,
            scalable: true,
            autoCropWidth: 300,
            autoCropHeight: 300,
            checkCrossOrigin: true,
            checkOrientation: true,
            crop: function(event) {
                // Update crop button state
                cropBtn.disabled = false;
                resetBtn.disabled = false;
            }
        });
    }

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file');
            return;
        }

        // Create object URL
        const imageUrl = URL.createObjectURL(file);
        currentFile = file;

        // Initialize cropper
        initCropper(imageUrl);
        showInfo('Image loaded successfully. You can now crop it.');
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
        const file = e.dataTransfer.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please drop a valid image file');
            return;
        }

        // Create object URL
        const imageUrl = URL.createObjectURL(file);
        currentFile = file;

        // Initialize cropper
        initCropper(imageUrl);
        showInfo('Image loaded successfully. You can now crop it.');
    }

    // Handle aspect ratio buttons
    document.querySelectorAll('.aspect-ratio-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.aspect-ratio-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Set aspect ratio
            const ratio = this.dataset.ratio;
            if (ratio === 'free') {
                cropper.setAspectRatio(NaN);
            } else {
                const [width, height] = ratio.split(':').map(Number);
                cropper.setAspectRatio(width / height);
            }
        });
    });

    // Handle crop button
    cropBtn.addEventListener('click', function() {
        if (!cropper || !currentFile) return;

        try {
            // Get cropped canvas
            const canvas = cropper.getCroppedCanvas();
            const croppedImage = canvas.toDataURL('image/jpeg', 0.9);

            // Create download link
            const link = document.createElement('a');
            link.href = croppedImage;
            link.download = `cropped_${currentFile.name.replace(/\.[^/.]+$/, '')}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showInfo('Image cropped and downloaded successfully');
        } catch (error) {
            console.error('Crop error:', error);
            showError('Failed to crop image. Please try again.');
        }
    });

    // Handle reset button
    resetBtn.addEventListener('click', function() {
        // Clear file input
        fileInput.value = '';

        // Hide cropper and options
        cropperContainer.classList.add('d-none');
        aspectRatioOptions.classList.remove('d-none');

        // Destroy cropper
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        // Reset image source
        cropperImage.src = '';

        // Reset current file
        currentFile = null;

        // Reset buttons
        cropBtn.disabled = true;
        resetBtn.disabled = true;

        // Reset aspect ratio buttons
        document.querySelectorAll('.aspect-ratio-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        showInfo('Tool reset successfully');
    });
}); 