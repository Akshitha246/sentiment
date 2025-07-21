document.addEventListener("DOMContentLoaded", function () {
  const bgImages = {
    HAPPY: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde",
    SADNESS: "https://images.unsplash.com/photo-1503264116251-35a269479413",
    ANGER: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    DISGUST: "https://images.unsplash.com/photo-1609943240438-98f3cf2f593f",
    FEAR: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
    SURPRISE: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6",
    NEUTRAL: "https://images.unsplash.com/photo-1526045612212-70caf35c14df"
  };

  const apiKey = "manognas-super-key";

  // 🔐 Login
  document.getElementById("loginButton").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (username && password) {
      document.querySelector(".login-screen").style.display = "none";
      document.querySelector(".container").style.display = "block";
    } else {
      alert("Please enter both username and password.");
    }
  });

  // ✉️ Send Button
  document.getElementById("sendBtn").addEventListener("click", () => {
    const text = document.getElementById("userInput").value.trim();
    if (text) sendToBackend(text);
  });

  // 🎙️ Voice Input
  document.getElementById("micBtn").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      document.getElementById("userInput").value = transcript;
    };
    recognition.onerror = err => alert("Voice input failed: " + err.error);
    recognition.start();
  });

  // 📤 File Upload
  document.getElementById("fileUpload").addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        sendToBackend(content);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a .txt file.");
    }
  });

  // 🌙 Dark Mode
  document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // 🚀 Backend Communicator
  async function sendToBackend(message) {
    const chatWindow = document.getElementById("chatWindow");

    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "message user-message";
    userMsgDiv.textContent = message;
    chatWindow.appendChild(userMsgDiv);

    document.getElementById("userInput").value = "";

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({ text: message })
      });

      const result = await response.json();

      const botMsgDiv = document.createElement("div");
      botMsgDiv.className = "message bot-message";

      if (response.ok) {
        const emotion = result.emotion.toUpperCase();
        botMsgDiv.textContent = `🤖 Emotion: ${emotion} (Confidence: ${(result.confidence * 100).toFixed(2)}%)`;

        // Change background
        if (bgImages[emotion]) {
          document.body.style.backgroundImage = `url('${bgImages[emotion]}')`;
        }
      } else {
        botMsgDiv.classList.add("error");
        botMsgDiv.textContent = `❌ Error: ${result.detail || "Unknown error"}`;
      }

      chatWindow.appendChild(botMsgDiv);
    } catch (err) {
      const errorMsgDiv = document.createElement("div");
      errorMsgDiv.className = "message bot-message error";
      errorMsgDiv.textContent = `⚠️ Could not connect to backend.`;
      chatWindow.appendChild(errorMsgDiv);
    }

    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});