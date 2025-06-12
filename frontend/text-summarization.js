(function() {
    'use strict';

    // DOM Element References
    const textInputArea = document.getElementById('text-input-area');
    const summarizeTextBtn = document.getElementById('summarize-text-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const summaryResultDiv = document.getElementById('summary-result');
    const summaryResultPlaceholder = document.getElementById('summary-result-placeholder');
    const toastContainer = document.getElementById('toast-container');

    // State Management
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

    // Update UI based on loading state
    function setLoadingState(loading) {
        isLoading = loading;
        if (summarizeTextBtn) summarizeTextBtn.disabled = loading;
        if (textInputArea) textInputArea.disabled = loading;

        if (loadingIndicator) {
            loadingIndicator.style.display = loading ? 'block' : 'none';
        }

        if (loading) {
            if (summaryResultDiv) summaryResultDiv.innerHTML = ''; // Clear previous summary text
            if (summaryResultPlaceholder) summaryResultPlaceholder.style.display = 'none'; // Hide placeholder
        }
    }

    // Summarize Text Button Event Listener
    if (summarizeTextBtn) {
        summarizeTextBtn.addEventListener('click', async function() {
            if (isLoading) return;

            const articleText = textInputArea ? textInputArea.value.trim() : '';

            if (!articleText) {
                showToast('Please enter text to summarize.', 'info');
                return;
            }

            setLoadingState(true);

            try {
                // API endpoint (use relative path or full URL if backend is on different origin)
                const response = await fetch('/api/summarize-article', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ article: articleText }),
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

                if (data && data.summary) {
                    if (summaryResultDiv) {
                        // Using textContent for safety, as summary is plain text.
                        // If Markdown is expected from this endpoint later, this should use marked.parse()
                        summaryResultDiv.textContent = data.summary;
                    }
                    if (summaryResultPlaceholder) { // Should already be hidden by setLoadingState
                        summaryResultPlaceholder.style.display = 'none';
                    }
                    showToast('Summarization complete!', 'success');
                } else {
                    throw new Error('Invalid summary response format from server.');
                }

            } catch (error) {
                console.error('Error summarizing text:', error);
                if (summaryResultDiv) {
                    summaryResultDiv.textContent = `Failed to summarize text. ${error.message || "Please try again."}`;
                }
                if (summaryResultPlaceholder) { // Ensure placeholder is hidden if error text is shown
                    summaryResultPlaceholder.style.display = 'none';
                }
                showToast('Error summarizing text.', 'error', 5000);
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Optional: Clear results and show placeholder if text area is cleared by user
    if (textInputArea) {
        textInputArea.addEventListener('input', function() {
            if (textInputArea.value.trim() === '' && !isLoading) {
                if (summaryResultDiv) summaryResultDiv.innerHTML = '';
                if (summaryResultPlaceholder) summaryResultPlaceholder.style.display = 'block';
            }
        });
    }


    // Initial state setup on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (summaryResultPlaceholder) summaryResultPlaceholder.style.display = 'block';
        if (summaryResultDiv) summaryResultDiv.innerHTML = '';
    });

})();
