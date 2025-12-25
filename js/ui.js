// Toggle Chat Logic
const chatWindow = document.getElementById('chat-window');
let isOpen = false;

// We attach this to window so it is accessible via the inline onclick="" in HTML
window.toggleChat = function () {
    isOpen = !isOpen;
    if (isOpen) {
        chatWindow.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => {
            chatWindow.classList.remove('scale-95', 'opacity-0');
            chatWindow.classList.add('scale-100', 'opacity-100');
            // Assuming scrollToBottom is defined in firebase-chat.js, but since modules vary in scope,
            // we should technically dispatch an event or move that logic here. 
            // For this structure, we let the CSS handle the view, and auto-scroll happens on message load.
        }, 10);
    } else {
        chatWindow.classList.remove('scale-100', 'opacity-100');
        chatWindow.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            chatWindow.classList.add('hidden');
        }, 300);
    }
}