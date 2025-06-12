(function() {
    'use strict';

    // DOM Element References
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreview = document.getElementById('image-preview');
    const analyzeImageBtn = document.getElementById('analyze-image-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const analysisResultDiv = document.getElementById('analysis-result');
    const analysisResultPlaceholder = document.getElementById('analysis-result-placeholder');
    const toastContainer = document.getElementById('toast-container');

    // State Management
    let selectedImageDataUri = null;
    let isLoading = false;

    // Simple Toast Function
    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainer) {
            console.log(`TOAST [${type}]: ${message}`);
            return;
        }
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        const removeToast = () => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => { if (toast.parentNode) toast.remove(); });
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
        };
        setTimeout(removeToast, duration);
        toast.addEventListener('click', removeToast);
    }

    // Image Selection and Preview Logic
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showToast('Invalid file type. Please select an image.', 'error');
                    resetImageSelection();
                    imageUploadInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedImageDataUri = e.target.result;
                    if (imagePreview) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                    }
                    if (analyzeImageBtn) analyzeImageBtn.disabled = false;
                    if (analysisResultDiv) analysisResultDiv.innerHTML = '';
                    if (analysisResultPlaceholder) analysisResultPlaceholder.style.display = 'block';
                };
                reader.onerror = function(e) {
                    console.error("FileReader error:", e);
                    showToast('Error reading file.', 'error');
                    resetImageSelection();
                };
                reader.readAsDataURL(file);
            } else {
                resetImageSelection();
            }
        });
    }

    function resetImageSelection() {
        selectedImageDataUri = null;
        if (imagePreview) {
            imagePreview.src = '#';
            imagePreview.style.display = 'none';
        }
        if (analyzeImageBtn) analyzeImageBtn.disabled = true;
        if (analysisResultDiv) analysisResultDiv.innerHTML = '';
        if (analysisResultPlaceholder) analysisResultPlaceholder.style.display = 'block';
        if(imageUploadInput) imageUploadInput.value = '';
    }

    // Update UI based on loading state
    function setLoadingState(loading) {
        isLoading = loading;
        if (analyzeImageBtn) analyzeImageBtn.disabled = loading || !selectedImageDataUri;
        if (imageUploadInput) imageUploadInput.disabled = loading;

        if (loadingIndicator) {
            loadingIndicator.style.display = loading ? 'block' : 'none';
        }

        if (loading) {
            if (analysisResultDiv) analysisResultDiv.innerHTML = ''; // Clear previous results text
            if (analysisResultPlaceholder) analysisResultPlaceholder.style.display = 'none'; // Hide placeholder
        }
    }

    // Analyze Image Button Event Listener
    if (analyzeImageBtn) {
        analyzeImageBtn.addEventListener('click', async function() {
            if (!selectedImageDataUri || isLoading) {
                return;
            }

            setLoadingState(true);

            try {
                // API endpoint (use relative path or full URL if backend is on different origin)
                const response = await fetch('/api/analyze-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ photoDataUri: selectedImageDataUri }),
                });

                if (!response.ok) {
                    let errorMsg = `API Error: ${response.status} ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMsg += ` - ${errorData.error || errorData.message || 'No additional error info.'}`;
                    } catch (e) {
                        // Ignore if response is not JSON
                    }
                    throw new Error(errorMsg);
                }

                const data = await response.json();

                if (data && data.description) {
                    if (analysisResultDiv) {
                        analysisResultDiv.textContent = data.description; // Using textContent for safety
                    }
                    if (analysisResultPlaceholder) { // Should already be hidden by setLoadingState
                        analysisResultPlaceholder.style.display = 'none';
                    }
                    showToast('Analysis complete!', 'success');
                } else {
                    throw new Error('Invalid response format from server.');
                }

            } catch (error) {
                console.error('Error analyzing image:', error);
                if (analysisResultDiv) {
                    analysisResultDiv.textContent = `Failed to analyze image. ${error.message || "Please try again."}`;
                }
                showToast('Error analyzing image.', 'error', 5000);
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Initial state setup on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        if (analyzeImageBtn) analyzeImageBtn.disabled = true;
        if (imagePreview) imagePreview.style.display = 'none';
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (analysisResultPlaceholder) analysisResultPlaceholder.style.display = 'block';
    });

})();
