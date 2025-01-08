// PART ONE CODE 1 START \\

// Initial chatbot setup and validation
import languagesData from "./languages.js"
let greetMessage;
(function () {
  const aibotConfig = window.aibot_config || {};
  const validChatbotId = "205f8b31-4fe3-4bd5-a28e-89cae1ade43f";

  if (aibotConfig.chatbotId !== validChatbotId) {
    console.error("Invalid Chatbot ID. Chatbot will not be loaded.");
    return;
  }

  let sessionId = null;
  let lastAssistantMessage = "";
  let language = aibotConfig.language || "en";
  let featureData = {}; // Store the dynamic feature data (both basic and advance)
  let featureKey;
  let langCode;
  let languageCode;

  // Utility function to create HTML elements
  function createElement(tag, className, attributes = {}, innerHTML = "") {
    const element = document.createElement(tag);
    element.className = className;
    Object.keys(attributes).forEach((attr) =>
      element.setAttribute(attr, attributes[attr])
    );
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  // Create chatbot container
  const chatbotContainer = createElement("div", "chatbot-container");

  // Header Section
  const header = createElement("div", "chatbot-header");
  const minimizeButton = createElement("button", "miniButton", {}, "v");

  let endChat = document.getElementById("endChat");
  minimizeButton.addEventListener("click", () => {
    // Check if the chatbot is minimized
    const isMinimized = chatbotContainer.classList.contains("minimized");

    if (isMinimized) {
      // Expand the chatbot
      chatbotContainer.style.maxHeight = "80vh"; // Original height
      minimizeButton.textContent = "v"; // Change the icon to "minimize"
      chatbotContainer.classList.remove("minimized");
    } else {
      // Minimize the chatbot
      chatbotContainer.style.maxHeight = "7vh"; // Reduced height
      minimizeButton.textContent = "^"; // Change the icon to "expand"
      chatbotContainer.classList.add("minimized");
    }
  });

  const logo = createElement("img", "", {
    src: "https://www.antiersolutions.com/wp-content/uploads/2019/03/favicon.png",
    alt: "Chatbot Logo",
  });
  const title = createElement("h1", "", {}, "Antier Chatbot");
  header.append(logo, title, minimizeButton);

  // Language Selector
  const languageSelector = createElement("div", "language-selector");
  const languageLabel = createElement(
    "label",
    "",
    { for: "language" },
    "Detected Language: "
  );
  langCode="bs"
  languageCode= langCode;
  const supportedLanguages = ["en", "hi", "fr", "es", "de"];
  if (!supportedLanguages.includes(langCode)) {
    supportedLanguages.push(langCode);
  }
  console.log(supportedLanguages);
  const languageDropdown = createElement("select", "");

  languagesData.text.forEach((lang) => {
  
  });

  supportedLanguages.forEach((lang) => {
    // Find the language in the languagesData text array
    const language = languagesData.text.find(item => Object.keys(item)[0] === lang);
     console.log("lang",language)
    if (language) {
      const languageName = language[lang]; // Get the language name from the JSON data
      const option = createElement(
        "option",
        "",
        { value: lang },
        languageName 
      );
      languageDropdown.appendChild(option);
    }
  });
  languageSelector.append(languageLabel, languageDropdown);

  // Set default language
  languageDropdown.value = langCode;

  // Chat Window
  const chatWindow = createElement("div", "chat-window");

  // Details Form
  const detailsForm = createElement("div", "details-form");
  const nameField = createElement("input", "input-field", {
    type: "text",
    placeholder: "Name",
  });
  const emailField = createElement("input", "input-field", {
    type: "email",
    placeholder: "Email",
  });
  const phoneField = createElement("input", "input-field", {
    type: "tel",
    placeholder: "Phone",
  });
  const startChatButton = createElement(
    "button",
    "start-chat-button",
    {},
    "Start Chat"
  );
  startChatButton.disabled = true;
  detailsForm.append(nameField, emailField, phoneField, startChatButton);

  // Input Section
  const inputSection = createElement("div", "input-section");
  // const continueChat = createElement("button", "", {}, "Continue Chat");
  // continueChat.style.display = "none";
  endChat = createElement("button", "", {}, "Speak With Expert");
  endChat.style.display = "none";
  const loading = createElement("button", "", {}, "Thinking");
  loading.style.display = "none";
  const inputField = createElement("input", "", {
    type: "text",
    placeholder: "Type your message...",
  });
  const sendButton = createElement("button", "", {}, "Send");
  sendButton.disabled = true;
  inputSection.append(inputField, sendButton, endChat, loading);

  // Append everything to chatbot container
  chatbotContainer.append(
    header,
    languageSelector,
    detailsForm,
    chatWindow,
    inputSection
  );
  document.body.appendChild(chatbotContainer);

  // Helper function to handle API requests
  const apiRequest = async (url, method = "POST", payload = {}) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  };

  // Validate form fields
  const validateFields = () => {
    const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      emailField.value
    );
    const phoneValid = /^\+?[1-9]\d{1,14}$/.test(phoneField.value);
    startChatButton.disabled = !(nameField.value && emailValid && phoneValid);
  };

  // Update chat window with new messages
  const updateChatWindow = (text, sender) => {
    const messageDiv = createElement("div", `message ${sender}`, {}, text);
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  startChatButton.addEventListener("click", async () => {
    const userDetails = {
      name: nameField.value,
      email: emailField.value,
      phone: phoneField.value,
      language:languageCode,
    };

    const data = await apiRequest(
      "http://192.168.10.38:8001/api/v1/user-details",
      "POST",
      userDetails
    );

    inputField.addEventListener("keydown", async (event) => {
      if (event.key === "Enter" && inputField.value.trim()) {
        sendButton.click(); // Trigger the send button's click event
        inputField.value = ""; // Clear input field after sending message
      }
    });

    if (data?.status === 200 && data.data?.session_id) {
      sessionId = data.data.session_id;
      const assistantMessage = data.data.messages[0]?.content || "Welcome!";
      greetMessage = data.data.messages[0]?.content || "Welcome!";
      updateChatWindow(assistantMessage, "bot");
      lastAssistantMessage = assistantMessage;
      detailsForm.style.display = "none";
      chatWindow.style.display = "flex";
      inputSection.style.display = "flex";
      sendButton.disabled = false;
    } else {
      updateChatWindow("Failed to submit details. Please try again.", "bot");
    }
  });

  nameField.addEventListener("input", validateFields);
  emailField.addEventListener("input", validateFields);
  phoneField.addEventListener("input", validateFields);

  inputField.addEventListener("input", function () {
    sendButton.disabled = !inputField.value.trim();
  });

  sendButton.addEventListener("click", async () => {
    sendButton.style.display = "none";
    loading.style.display = "block";
    loading.disabled = "true";
    const userMessage = inputField.value.trim();

    if (userMessage) {
      inputField.value = "";
      updateChatWindow(userMessage, "user");
      console.log("userMessage", userMessage);

      const payload = {
        session_id: sessionId,
        messages: [
          { role: "assistant", content: lastAssistantMessage },
          { role: "user", content: userMessage },
        ],
        features: null,
      };

      const data = await apiRequest(
        "http://192.168.10.38:8001/api/v1/chat",
        "POST",
        payload
      );
      handleApiResponse(data);
      console.log("dataaaaaaaaa", data);
    }
  });

  function handleApiResponse(response) {
    loading.style.display = "none";
    sendButton.style.display = "block";
    if (response?.data?.messages?.length) {
      const assistantMessage = response.data.messages[0].content;
      lastAssistantMessage = assistantMessage;
      updateChatWindow(lastAssistantMessage, "bot");

      if (response?.user_actions?.fallback?.messages?.length) {
        const fallbackMessage =
          response.user_actions.fallback.messages[0].content;
        lastAssistantMessage = fallbackMessage;
        updateChatWindow(fallbackMessage, "bot");
      }
    }
    if (response?.user_options) {
      console.log("Checking user options:", response?.user_options);
      if (
        response?.user_options &&
        Object.keys(response.user_options).length > 0
      ) {
        displayUserOptions(response.user_options);
      }
    }
    if (response?.data?.features?.length) {
      featureKey = Object.keys(response?.data?.features[0] || {})[0];
      console.log("Dynamic feature key:", featureKey);
      featureData = response?.data?.features[0][featureKey];
      console.log("feature Data", response?.data?.features);
      const features = featureData;
      console.log("features", features);
      //  impliment the select option yes or no here
      if (features.introduction) updateChatWindow(features.introduction, "bot");
      if (features.basic) updateChatWindow(features.basic, "bot");
      if (features.advance) displayFeatures(features.advance);
    } else if (!response?.data?.messages?.length) {
      updateChatWindow(
        "The assistant is not responding. Please try again.",
        "bot"
      );
    }
  }

  let isUserOptionsApiCalled = false;

  function displayUserOptions(userOptions) {
    console.log("Displaying user options:", userOptions);

    let optionsContainer = document.getElementById("optionsContainer");

    const selectedOptions = {};
    let selectedOptionsString = "";

    if (!optionsContainer) {
      optionsContainer = createElement("div", "optionsContainer");
      chatWindow.appendChild(optionsContainer);
      sendButton.classList.add("options");
    }

    optionsContainer.innerHTML = "";
    inputField.style.display = "none";
    sendButton.style.display = "block"; // Makes it a block element
    sendButton.style.width = "100%"; // Sets the width to occupy the full container
    // sendButton.style.boxSizing = "border-box";

    userOptions.forEach((option) => {
      console.log("User option:", option);
      const optionElement = createElement(
        "div",
        "",
        {},
        `
        <label>
          <input type="checkbox" data-option="${option}" />
          ${option}
        </label>
      `
      );
      optionsContainer.appendChild(optionElement);
    });

    optionsContainer.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const selectedOption = event.target.getAttribute("data-option");
        selectedOptions[selectedOption] = event.target.checked;

        selectedOptionsString = Object.entries(selectedOptions)
          .filter(([key, value]) => value)
          .map(([key]) => key)
          .join(", ")
          .replace(/\s+/g, "")
          .trim();

        console.log("Selected options as string:", selectedOptionsString);
      }
    });

    sendButton.addEventListener("click", function () {
      if (sendButton.classList.contains("options") && !isUserOptionsApiCalled) {
        sendUserOptions(selectedOptionsString);
        isUserOptionsApiCalled = true;
        sendButton.style.display = "none";
        loading.style.display = "block";
        loading.style.width = "100%";
      }
    });
  }

  function sendUserOptions(selectedOptionsString) {
    console.log("Sending selected options:", selectedOptionsString);

    const payload = {
      session_id: sessionId,
      messages: [
        { role: "assistant", content: lastAssistantMessage },
        { role: "user", content: selectedOptionsString },
      ],
      features: null,
    };

    apiRequest("http://192.168.10.38:8001/api/v1/chat", "POST", payload).then(
      (data) => handleApiResponse(data)
    );
  }

  function displayFeatures(advanceFeatures) {
    console.log("this is advance feature", advanceFeatures);
    let featuresContainer = document.getElementById("featuresContainer");
    if (!featuresContainer) {
      featuresContainer = createElement("div", "featuresContainer");
      chatWindow.appendChild(featuresContainer);
      sendButton.classList.add("last-step"); // Add last-step class to Send button
    }

    featuresContainer.innerHTML = "";
    inputField.style.display = "none";
    sendButton.style.display = "block"; // Makes it a block element
    sendButton.style.width = "100%"; // Sets the width to occupy the full container
    sendButton.style.boxSizing = "border-box";

    Object.entries(advanceFeatures).forEach(([feature, isChecked]) => {
      // console.log("feature", feature);
      const featureElement = createElement(
        "div",
        "",
        {},
        `
        <label>
          <input type="checkbox" ${
            isChecked ? "checked" : ""
          } data-feature="${feature}" />
          ${feature}
        </label>
      `
      );
      featuresContainer.appendChild(featureElement);
    });
    sendButton.addEventListener("click", function () {
      if (sendButton.classList.contains("last-step")) {
        sendUpdatedFeatures();
      }
    });
  }

  function sendUpdatedFeatures() {
    loading.style.display = "block";
    loading.style.display = "100%";
    sendButton.style.display = "none";
    const selectedFeatures = [];
    document
      .querySelectorAll('input[type="checkbox"]:checked')
      .forEach((checkbox) => {
        selectedFeatures.push(checkbox.getAttribute("data-feature"));
      });

    const payload = {
      session_id: sessionId,
      features: [
        {
          [featureKey]: {
            basic: featureData.basic,
            advance: selectedFeatures.reduce((acc, feature) => {
              acc[feature] = true;
              return acc;
            }, {}),
          },
        },
      ],
    };
    console.log("payload", payload);

    apiRequest("http://192.168.10.38:8001/api/v1/chat", "POST", payload).then(
      (data) => displayFinalResponse(data)
    );
  }

  function displayFinalResponse(response) {
    updateChatWindow(
      response?.data?.messages[0]?.content || "Error fetching final response.",
      "bot"
    );
    // minimizeButton.click();

    if (response) {
      inputField.style.display = "none";
      sendButton.style.display = "none";
      loading.style.display = "none";
      // continueChat.style.display = "block";
      // continueChat.style.width = "100%";
      // continueChat.style.marginRight = "10px";
      endChat.style.display = "block";
      endChat.style.width = "100%";
      endChat.addEventListener("click", function () {
        updateChatWindow(
          "I will forward your details to our technical team for further discussion. You can expect them to reach out to you shortly. Thank you for your patience.",
          "bot"
        );
        endChat.disabled = true;
      });
    }
  }

  // PART ONE CODE 1 END \\

  // PART TWO CODE 2 START \\

  const style = document.createElement("style");

  style.textContent = `
  /* Global Styles */
  :root {
    --primary-color: #007bff;
    --secondary-color: #f4f4f4;
    --disabled-color: #ccc;
    --text-color: #000;
    --border-color: #ddd;
    --message-bg-user: #d1e7dd;
    --message-bg-bot:#62bff3;
  }

  .continue-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.continue-button:hover {
  background-color: #0056b3;
}

.miniButton{
 font-size: 20px;  /* Make the symbol bigger */
  background-color: transparent;  /* Set background to transparent */
  border: none;  /* Remove any default border */
  cursor: pointer;
  padding: 5px 10px;  /* Add some padding to make the button more clickable */
  margin-left: 200px;  /* Remove any left margin */
  transition: color 0.3s;
}

 .chatbot-container {
    display: flex;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    max-height: 90vh; /* Set max height to 80% of the viewport height */
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    flex-direction: column;
    font-family: Arial, sans-serif;
    z-index: 1000;
    overflow-y: auto; /* Enable vertical scrolling if content exceeds max height */
}
    .minimized {
  max-height: 7vh !important; /* Minimized height */
  overflow: hidden; /* Hide scroll bar */
}


 .minibtn{
  font-size: 20px;  /* Make the symbol bigger */
  background-color: transparent;  /* Set background to transparent */
  border: none;  /* Remove any default border */
  cursor: pointer;
  padding: 5px 10px;  /* Add some padding to make the button more clickable */
  margin-left: 0;  /* Remove any left margin */
  transition: color 0.3s;  /* Smooth color transition */
}

button:hover {
  color: #007bff;  /* Change color on hover for better visibility */
}


  .chatbot-header {
    background: var(--primary-color);
    color: #fff;
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--border-color);
  }

  .chatbot-header img {
    width: 40px;
    margin-right: 10px;
  }

  .chatbot-header h1 {
    font-size: 16px;
    margin: 0;
  }

  .language-selector {
    padding: 10px;
    background: var(--secondary-color);
    border-bottom: 1px solid var(--border-color);
    text-align: center;
  }

  .language-selector select {
    padding: 5px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
  }

  .details-form {
    padding: 10px;
    background: var(--secondary-color);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .details-form .input-field {
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }

  .details-form .start-chat-button {
    padding: 10px;
    background: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .details-form .start-chat-button:hover:not(:disabled) {
    background: #0056b3;
  }

  .details-form .start-chat-button:disabled {
    background: var(--disabled-color);
    cursor: not-allowed;
  }

  .chat-window {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    background: var(--secondary-color);
    display: none;
    flex-direction: column;
    max-height: 600px;
  }

  .message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 4px;
    max-width: 75%;
    word-wrap: break-word;
  }

  .message.user {
    align-self: flex-end;
    background: var(--message-bg-user);
  }

  .message.bot {
    align-self: flex-start;
    background: var(--message-bg-bot);
  }

  .input-section {
    display: none;
    padding: 10px;
    border-top: 1px solid var(--border-color);
    background: #fff;
  }

  .input-section input {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-right: 10px;
  }

  .input-section button {
  
    padding: 8px 12px;
    background: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .input-section button:hover:not(:disabled) {
    background: #0056b3;
  }

  .input-section button:disabled {
    background: var(--disabled-color);
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .chatbot-container {
      width: 100%;
      bottom: 0;
      right: 0;
      border-radius: 0;
    }

    .chat-window {
      max-height: 300px;
    }
  }

  /* Google Translate Styles */
  div#google_translate_element, iframe {
    display: none !important;
  }
`;

  document.head.appendChild(style);

  // PART TWO CODE 2 END \\

  // Part 3: Integrate Google Translate dynamically (unchanged)
  function loadGoogleTranslateScript(callback) {
    const script = document.createElement("script");
    script.src =
      "https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateInit";
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  // Initialize Google Translate
  window.googleTranslateInit = () => {
    const translateContainer = document.createElement("div");
    translateContainer.id = "google_translate_element";
    document.body.appendChild(translateContainer);

    const supportedLanguages = "en,hi,fr,es,de"; // Initial supported languages
    const userLang = "te-us"; // Detect user's language (e.g., "de-DE")""
    langCode = userLang.split("-")[0]; // Extract the language code (e.g., "de")

    let updatedLanguages = supportedLanguages;

    if (!supportedLanguages.includes(langCode)) {
      updatedLanguages += `,${langCode}`;
      console.log(`Added ${langCode} to the supported languages.`);
    }
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: updatedLanguages,
        autoDisplay: false,
      },
      "google_translate_element"
    );
    console.log("Google Translate initialized.");
    selectLanguage(langCode);
  };
  // Function to select the language in the dropdown
  const selectLanguage = (lang) => {
    const translateElementDropdown = document.querySelector(
      "#google_translate_element select"
    );
    if (translateElementDropdown) {
      const options = translateElementDropdown.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === lang) {
          options[i].selected = true;
          console.log("options", options[i].value);

          translateElementDropdown.dispatchEvent(new Event("change")); // Trigger change event
          break;
        }
      }
    } else {
      console.error("Google Translate element dropdown not found.");
    }
  };

  // Add styles to hide Google Translate elements dynamically
  const hideGoogleTranslateStyles = document.createElement("style");
  hideGoogleTranslateStyles.textContent = `
  #google_translate_element {
    display: none !important;
  }
  .goog-te-banner-frame,
  .goog-te-menu-frame {
    display: none !important;
  }
  body {
    top: 0 !important;
  }
  iframe {
    display: none;
  }
`;
  document.head.appendChild(hideGoogleTranslateStyles);

  // Load Google Translate script
  loadGoogleTranslateScript(() => {
    console.log("Google Translate script loaded.");
  });

  // Ensure dynamic updates using Translate
  document.addEventListener("DOMContentLoaded", () => {
    const languageDropdown = document.querySelector(
      ".language-selector select"
    );

    if (languageDropdown) {
      languageDropdown.addEventListener("change", () => {
        const selectedLang = languageDropdown.value;

        const hideGoogleTranslateStyles = document.createElement("style");
        hideGoogleTranslateStyles.textContent = `
        #google_translate_element {
          display: none !important;
        }
        .goog-te-banner-frame,
        .goog-te-menu-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        iframe {
          display: none;
        }
      `;
        document.head.appendChild(hideGoogleTranslateStyles);

        const translateElementDropdown = document.querySelector(
          "#google_translate_element select"
        );
        if (translateElementDropdown) {
          const options = translateElementDropdown.options;
          for (let i = 0; i < options.length; i++) {
            if (options[i].value === selectedLang) {
              options[i].selected = true;
              translateElementDropdown.dispatchEvent(new Event("change"));
              break;
            }
          }
        } else {
          console.error("Google Translate element dropdown not found.");
        }
          languageLabel.textContent="Selected Language"
          languageCode= selectedLang
        console.log(`Language changed to: ${selectedLang}`);
      });
    } else {
      console.error("Language dropdown not found.");
    }
  });
})();
