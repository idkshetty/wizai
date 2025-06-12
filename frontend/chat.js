(function() {
    'use strict';

    const API_BASE_URL = ''; // For deployed backend, set this to your backend's URL (e.g., 'https://your-backend.onrender.com')

    // DOM Element References
    const chatHeader = document.getElementById('chat-header');
    const downloadChatBtn = document.getElementById('download-chat-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const messageDisplayArea = document.getElementById('message-display-area');
    const messageForm = document.getElementById('message-form');
    const messageTextarea = document.getElementById('message-textarea');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const toastContainer = document.getElementById('toast-container');

    // Store initial SVG content for send button
    const sendButtonInitialHTML = sendMessageBtn ? sendMessageBtn.innerHTML : '';

    // State Management
    let messages = [];
    let isLoading = false;

    // Local Storage
    const LOCAL_STORAGE_KEY = 'chatMessagesVanilla';

    // Toast Notification Function
    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                if (toast.parentNode) {
                    toast.remove();
                }
            });
            setTimeout(() => {
                 if (toast.parentNode) {
                    toast.remove();
                }
            }, duration + 500);
        }, duration);

        toast.addEventListener('click', () => {
            toast.classList.remove('show');
             setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 500);
        });
    }


    function saveMessages() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    }

    function loadMessages() {
        const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedMessages) {
            messages = JSON.parse(storedMessages);
            displayMessages();
        }
    }

    function renderMessage(message) {
        if (!messageDisplayArea) return;

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container');
        messageContainer.classList.add(message.role === 'user' ? 'user-message-container' : 'ai-message-container');

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        if (message.role === 'user') {
            avatar.classList.add('user-avatar');
            avatar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"></path><circle cx="12" cy="10" r="4"></circle><circle cx="12" cy="12" r="10"></circle></svg>`;
        } else {
            avatar.classList.add('ai-avatar');
            avatar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`;
        }

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');

        const messageText = document.createElement('p');
        messageText.classList.add('message-text');

        if (message.role === 'assistant' && typeof marked === 'function') {
            messageText.innerHTML = marked.parse(message.content);
        } else {
            message.content.split('\n').forEach((line, index, arr) => {
                messageText.appendChild(document.createTextNode(line));
                if (index < arr.length - 1) {
                    messageText.appendChild(document.createElement('br'));
                }
            });
        }
        messageBubble.appendChild(messageText);

        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('message-timestamp');
        messageTimestamp.textContent = new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageBubble.appendChild(messageTimestamp);

        if (message.role === 'user') {
            messageContainer.appendChild(messageBubble); // Bubble first for user
            messageContainer.appendChild(avatar);       // Avatar second for user
        } else {
            messageContainer.appendChild(avatar);       // Avatar first for AI
            messageContainer.appendChild(messageBubble); // Bubble second for AI
        }

        messageDisplayArea.appendChild(messageContainer);

        messageDisplayArea.scrollTop = messageDisplayArea.scrollHeight;
    }

    function displayMessages() {
        if (!messageDisplayArea) return;
        messageDisplayArea.innerHTML = '';
        messages.forEach(renderMessage);
    }

    function setLoadingState(loading) {
        isLoading = loading;
        if (sendMessageBtn) {
            sendMessageBtn.disabled = loading;
            if (loading) {
                sendMessageBtn.innerHTML = ''; // Clear SVG
                sendMessageBtn.classList.add('loading'); // CSS will add "..." via ::after
            } else {
                sendMessageBtn.innerHTML = sendButtonInitialHTML; // Restore SVG
                sendMessageBtn.classList.remove('loading');
            }
        }
        if (messageTextarea) {
            messageTextarea.disabled = loading;
        }
    }

    if (messageForm) {
        messageForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (isLoading) return;

            const query = messageTextarea.value.trim();
            if (!query) return;

            const userMessage = {
                id: new Date().toISOString(),
                role: 'user',
                content: query
            };

            messages.push(userMessage);
            renderMessage(userMessage);

            const currentMessageText = messageTextarea.value;
            messageTextarea.value = '';
            messageTextarea.style.height = 'auto';
            messageTextarea.focus();

            if (query.toLowerCase().includes("markdown test")) {
                const testAIMessage = {
                    id: new Date().toISOString(),
                    role: 'assistant',
                    content: "Okay, here's a Markdown test:\n\n" +
                             "**Bolded Text**\n\n" +
                             "*Italicized Text*\n\n" +
                             "A list:\n" +
                             "- Item 1\n" +
                             "- Item 2\n" +
                             "  - Sub-item 2.1\n\n" +
                             "A numbered list:\n" +
                             "1. First item\n" +
                             "2. Second item\n\n" +
                             "`inline code`\n\n" +
                             "```javascript\n" +
                             "function greet(name) {\n" +
                             "  console.log(`Hello, ${name}!`);\n" +
                             "}\n" +
                             "```\n\n" +
                             "> A blockquote example.\n\n" +
                             "A horizontal rule:\n\n" +
                             "---\n\n" +
                             "And a [link to Google](https://www.google.com)!"
                };
                messages.push(testAIMessage);
                renderMessage(testAIMessage);
                saveMessages();
                setLoadingState(false);
                return;
            }

            setLoadingState(true);

            try {
                const response = await fetch(`${API_BASE_URL || ''}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred while fetching response.' }));
                    throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
                }

                const data = await response.json();

                if (!data.response) {
                    throw new Error("Received an empty response from Wiz.");
                }

                const aiResponseMessage = {
                    id: new Date().toISOString(),
                    role: 'assistant',
                    content: data.response
                };
                messages.push(aiResponseMessage);
                renderMessage(aiResponseMessage);

            } catch (error) {
                console.error('Error fetching AI response:', error);
                const errorMessageContent = `Sorry, I encountered an error: ${error.message || "Please try again."}`;
                const errorMessage = {
                    id: new Date().toISOString(),
                    role: 'assistant',
                    content: errorMessageContent
                };
                messages.push(errorMessage);
                renderMessage(errorMessage);
            } finally {
                saveMessages();
                setLoadingState(false);
            }
        });
    }

    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', function() {
            if (messages.length === 0) {
                showToast("Chat is already empty!", 'info');
                return;
            }
            messages = [];
            saveMessages();
            if (messageDisplayArea) {
                messageDisplayArea.innerHTML = '';
            }
            showToast('Chat cleared!', 'success');
        });
    }

    if (downloadChatBtn) {
        downloadChatBtn.addEventListener('click', function() {
            if (messages.length === 0) {
                showToast("No messages to download.", 'info');
                return;
            }

            let formattedChatHistory = `Wiz Chat History - ${new Date().toLocaleString()}\n\n`;
            messages.forEach(message => {
                const role = message.role === 'user' ? 'User' : 'Wiz';
                const timestamp = new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                formattedChatHistory += `[${timestamp}] ${role}:\n${message.content}\n\n`;
            });

            const blob = new Blob([formattedChatHistory], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'wiz-chat-history.txt';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast("Chat history download started!", 'success');
        });
    }

    if (messageTextarea) {
        messageTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 120);
            this.style.height = newHeight + 'px';
        });
        messageTextarea.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
                event.preventDefault();
                messageForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Storing initial HTML must be done after DOM is loaded if sendMessageBtn is not defined at script parse time.
        // However, since it's declared at the top, it should be fine IF the script is deferred.
        // To be absolutely safe, or if not deferred, it would be:
        // const sendMessageBtn = document.getElementById('send-message-btn');
        // const sendButtonInitialHTML = sendMessageBtn ? sendMessageBtn.innerHTML : '';
        // For this setup, with defer, it should be okay.

        loadMessages();
        if (messageTextarea && messageTextarea.value) {
             messageTextarea.style.height = 'auto';
             const newHeight = Math.min(messageTextarea.scrollHeight, 120);
             messageTextarea.style.height = newHeight + 'px';
        }
    });

})();
