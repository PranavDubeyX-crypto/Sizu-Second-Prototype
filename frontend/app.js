// ======================================
// SIZU PRANAV 2.0
// FRONTEND INTERACTION SYSTEM
// ======================================

const API_URL = "YOUR_BACKEND_URL/chat";

// Elements
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const micButton = document.getElementById("mic-button");
const chatMessages = document.getElementById("chat-messages");

const connectionStatus = document.getElementById("connection-status");
const emotionLabel = document.getElementById("emotion-label");
const characterMessage = document.getElementById("character-message");

// Conversation memory for current session
let conversationHistory = [];

// Supported emotions
const allowedEmotions = [
    "normal",
    "happy",
    "sad",
    "angry",
    "sarcastic",
    "thinking",
    "listening"
];

// ======================================
// STATUS SYSTEM
// ======================================

function setStatus(status) {
    connectionStatus.textContent = status;
}

// ======================================
// CHARACTER EMOTION SYSTEM
// ======================================

function setEmotion(emotion) {
    const selected = allowedEmotions.includes(emotion)
        ? emotion
        : "normal";

    emotionLabel.textContent = selected.toUpperCase();

    document.getElementById("sizu-character")
        .dataset.emotion = selected;
}

// ======================================
// CHARACTER MESSAGE
// ======================================

function setCharacterMessage(message) {
    characterMessage.textContent = message;
}

// ======================================
// CHAT MESSAGE SYSTEM
// ======================================

function addMessage(role, message) {
    const element = document.createElement("div");

    element.className = `message ${role}`;
    element.textContent = message;

    chatMessages.appendChild(element);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ======================================
// VOICE RESPONSE SYSTEM
// ======================================

function speak(message) {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 0.95;

    speech.onstart = () => {
        setCharacterMessage("Speaking...");
    };

    speech.onend = () => {
        setCharacterMessage("I'm listening.");
        setEmotion("normal");
    };

    window.speechSynthesis.speak(speech);
}

// ======================================
// AI BRAIN CONNECTION
// ======================================

async function askSizu(message) {
    if (API_URL.startsWith("YOUR_BACKEND")) {
        throw new Error("AI backend is not connected yet.");
    }

    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            message: message,
            history: conversationHistory
        })
    });

    if (!response.ok) {
        throw new Error("AI server request failed.");
    }

    return await response.json();
}

// ======================================
// MAIN CHAT SYSTEM
// ======================================

async function sendMessage() {
    const message = input.value.trim();

    if (!message) return;

    input.value = "";

    addMessage("user", message);

    conversationHistory.push({
        role: "user",
        content: message
    });

    setEmotion("thinking");
    setCharacterMessage("Thinking...");
    setStatus("PROCESSING");

    sendButton.disabled = true;

    try {
        const data = await askSizu(message);

        const reply = data.reply || "I couldn't generate a response.";

        addMessage("assistant", reply);

        conversationHistory.push({
            role: "assistant",
            content: reply
        });

        setEmotion(data.emotion || "normal");
        setCharacterMessage(reply);

        speak(reply);

        setStatus("CONNECTED");

    } catch (error) {
        console.error(error);

        setEmotion("normal");
        setCharacterMessage("My AI brain is unavailable.");

        addMessage(
            "assistant",
            "I'm unable to connect to my AI brain right now."
        );

        setStatus("OFFLINE");

    } finally {
        sendButton.disabled = false;
        input.focus();
    }
}

// ======================================
// BUTTON EVENTS
// ======================================

sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// ======================================
// MICROPHONE SYSTEM
// ======================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        setEmotion("listening");
        setCharacterMessage("Listening...");
        micButton.textContent = "LISTENING";
    };

    recognition.onresult = (event) => {
        const transcript =
            event.results[0][0].transcript;

        input.value = transcript;

        sendMessage();
    };

    recognition.onerror = () => {
        setEmotion("normal");
        setCharacterMessage("Microphone error.");
        micButton.textContent = "MIC";
    };

    recognition.onend = () => {
        micButton.textContent = "MIC";
    };

    micButton.addEventListener("click", () => {
        recognition.start();
    });

} else {

    micButton.disabled = true;
    micButton.textContent = "UNSUPPORTED";

}

// ======================================
// INITIALIZATION
// ======================================

setStatus("INITIALIZING");

setEmotion("normal");

setCharacterMessage(
    "SIZU systems initialized. Awaiting connection."
);

console.log("SIZU PRANAV 2.0 frontend initialized.");