import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Parse config from global variable defined in index.html
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let currentUser = null;
let unsubscribeMessages = null;

// 1. Authentication
async function initAuth() {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Auth Error:", error);
    }
}

initAuth();

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        initChat(user.uid);
    }
});

// 2. Chat Logic
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const typingIndicator = document.getElementById('typing-indicator');

function initChat(userId) {
    const q = query(
        collection(db, 'artifacts', appId, 'users', userId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = ''; // Clear and redraw (simple approach)
        
        // Add welcome message if empty
        if (snapshot.empty) {
            appendMessage({
                text: "Hi there! I'm your virtual assistant. Need a quote for an IKEA Pax or a general inquiry?",
                sender: 'agent',
                createdAt: { seconds: Date.now() / 1000 }
            });
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            appendMessage(data);
        });
        
        scrollToBottom();
    }, (error) => {
        console.error("Chat Error:", error);
        appendMessage({text: "Connection lost. Please refresh.", sender: 'system'});
    });
}

function appendMessage(data) {
    const isUser = data.sender === 'user';
    const div = document.createElement('div');
    div.className = `flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`;
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
        isUser 
        ? 'bg-brand-600 text-white rounded-br-none' 
        : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
    }`;
    bubble.textContent = data.text;
    
    div.appendChild(bubble);
    chatMessages.appendChild(div);
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Message
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !currentUser) return;

    chatInput.value = '';

    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'messages'), {
            text: text,
            sender: 'user',
            createdAt: serverTimestamp()
        });

        // Simulate Agent Reply (for demo purposes)
        simulateReply();

    } catch (err) {
        console.error("Send Error", err);
    }
});

let replyTimeout;
function simulateReply() {
    clearTimeout(replyTimeout);
    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    replyTimeout = setTimeout(async () => {
        typingIndicator.classList.add('hidden');
        if(!currentUser) return;
        
        // Determine a generic reply
        const replies = [
            "Thanks for the details! Ideally, send us a photo of the boxes.",
            "We cover all of London. What's your postcode?",
            "Got it. I'll ask Abbas to check the schedule.",
            "Is parking available at the property?"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'messages'), {
            text: randomReply,
            sender: 'agent',
            createdAt: serverTimestamp()
        });
    }, 2000);
}