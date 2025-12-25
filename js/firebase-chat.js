import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    // Listen for messages in this user's conversation
    const q = query(
        collection(db, 'artifacts', appId, 'users', userId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = ''; 
        
        if (snapshot.empty) {
            appendMessage({
                text: "Hi! I'm your LondonFitters assistant. How can I help with your assembly?",
                sender: 'agent',
                createdAt: { seconds: Date.now() / 1000 }
            });
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            appendMessage(data);
        });
        
        scrollToBottom();
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

// 3. Send Message & Update User Record (Vital for Admin Panel)
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !currentUser) return;

    chatInput.value = '';

    try {
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
        const messagesRef = collection(userRef, 'messages');

        // A. Add the message
        await addDoc(messagesRef, {
            text: text,
            sender: 'user',
            createdAt: serverTimestamp()
        });

        // B. Update the "User" document so they show up in the Admin List
        await setDoc(userRef, {
            lastMessage: text,
            lastUpdated: serverTimestamp(),
            userId: currentUser.uid,
            // Assuming we don't have their name yet, but if we did from the form, we'd add it here
            status: 'unread'
        }, { merge: true });

    } catch (err) {
        console.error("Send Error", err);
    }
});