const API_KEY = 'sk-628806db4d3847fe80e83562e77ea33c';
const API_URL = 'https://api.deepseek.com/chat/completions';

const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const loadingIndicator = document.getElementById('loadingIndicator');

let conversationHistory = [];

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Disable input while sending
    sendBtn.disabled = true;
    userInput.disabled = true;
    loadingIndicator.style.display = 'block';
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    try {
        // Make API call
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const botMessage = data.choices[0].message.content;
        
        // Add bot message to chat
        addMessage(botMessage, 'bot');
        
        // Add to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: botMessage
        });
        
    } catch (error) {
        console.error('Error:', error);
        addMessage(`Error: ${error.message}`, 'error');
        
        // Provide helpful error message
        if (error.message.includes('Insufficient Balance') || error.message.includes('insufficient balance')) {
            addMessage('💰 Insufficient Balance: Your DeepSeek account doesn\'t have enough credits.\n\nTo fix this:\n1. Go to https://platform.deepseek.com\n2. Login to your account\n3. Add credits/payment method to your account\n4. Try again after your balance is updated', 'error');
        } else if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('Unauthorized')) {
            addMessage('❌ API Key Error: The provided API key is invalid or not working. Please check if:\n1. The API key is correct\n2. You have credits in your DeepSeek account\n3. The API key has proper permissions', 'error');
        } else if (error.message.includes('429')) {
            addMessage('⚠️ Rate Limited: Too many requests. Please wait a moment and try again.', 'error');
        }
    } finally {
        // Re-enable input
        sendBtn.disabled = false;
        userInput.disabled = false;
        loadingIndicator.style.display = 'none';
        userInput.focus();
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const p = document.createElement('p');
    p.textContent = text;
    
    if (sender === 'error') {
        messageDiv.className = 'message error-message';
    }
    
    messageDiv.appendChild(p);
    messagesContainer.appendChild(messageDiv);
    
    // Auto scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Focus on input when page loads
window.addEventListener('load', () => {
    userInput.focus();
});
