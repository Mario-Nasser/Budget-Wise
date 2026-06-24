document.addEventListener("DOMContentLoaded", () => {
  // Only initialize the chatbot if the user is authenticated
  const token = localStorage.getItem("token");
  if (!token) return;

  // 1. Inject CSS file directly into head
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "assets/css/aiAgent.css";
  document.head.appendChild(link);

  // 2. Define chat state container
  let chatHistory = [];
  let isWindowOpen = false;

  // 3. Inject Floating Chat Markup dynamically into body
  const widgetContainer = document.createElement("div");
  widgetContainer.className = "ai-chat-widget";
  widgetContainer.innerHTML = `
    <button class="ai-chat-toggle" id="aiToggleBtn">💬</button>
    <div class="ai-chat-window" id="aiChatWindow">
      <div class="ai-chat-header">
        <h3>🤖 BudgetWise AI Advisor</h3>
        <button class="ai-chat-close" id="aiCloseBtn">×</button>
      </div>
      <div class="ai-chat-messages" id="aiChatMessages">
        <div class="ai-message bot">Hello! I am your BudgetWise Advisor. Ask me anything about tracking your expenses, optimizing your budget, or maximizing your savings goals!</div>
      </div>
      <form class="ai-chat-input-form" id="aiChatForm">
        <input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Ask a question..." required autoComplete="off" />
        <button type="submit" class="ai-chat-send">Send</button>
      </form>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // DOM elements cache references
  const toggleBtn = document.getElementById("aiToggleBtn");
  const chatWindow = document.getElementById("aiChatWindow");
  const closeBtn = document.getElementById("aiCloseBtn");
  const chatForm = document.getElementById("aiChatForm");
  const chatInput = document.getElementById("aiChatInput");
  const messagesContainer = document.getElementById("aiChatMessages");

  // 4. Handle Window Toggle Visibility Functions
  toggleBtn.addEventListener("click", () => {
    isWindowOpen = !isWindowOpen;
    chatWindow.style.display = isWindowOpen ? "flex" : "none";
    if (isWindowOpen) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      chatInput.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    isWindowOpen = false;
    chatWindow.style.display = "none";
  });

  // 5. Build context payload wrapper using your api layout configurations
  async function gatherFinancialContext() {
    try {
      // Create date ranges covering a broad window for data capture
      const today = new Date();
      const priorMonth = new Date();
      priorMonth.setMonth(today.getMonth() - 1);

      const dateParams = {
        startDate: priorMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };

      // Safely run parallel requests using the wrappers from your api.js file
      const [reportData, goalsData, budgetData] = await Promise.allSettled([
        api.reports.get(dateParams),
        api.goals.getAll(),
        api.budgets.getAll()
      ]);

      const context = {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        expenseByCategory: {},
        goals: [],
        budgets: []
      };

      if (reportData.status === "fulfilled") {
        context.totalIncome = reportData.value.totalIncome || 0;
        context.totalExpenses = reportData.value.totalExpenses || 0;
        context.netBalance = reportData.value.netBalance || 0;
        context.expenseByCategory = reportData.value.expenseByCategory || {};
      }

      if (goalsData.status === "fulfilled" && Array.isArray(goalsData.value)) {
        context.goals = goalsData.value.map(g => ({
          goalName: g.goalName,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          isAchieved: g.isAchieved
        }));
      }

      if (budgetData.status === "fulfilled" && Array.isArray(budgetData.value)) {
        context.budgets = budgetData.value.map(b => ({
          category: b.category || b.categoryName,
          limit: b.limit || b.budgetLimit,
          spent: b.spent || b.currentSpent || 0
        }));
      }

      return context;
    } catch (err) {
      console.warn("Could not completely resolve background balance aggregates:", err);
      return { totalIncome: 0, totalExpenses: 0, netBalance: 0, expenseByCategory: {}, goals: [], budgets: [] };
    }
  }

  // 6. Messaging submission routing handler
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Append User message to UI
    appendMessage("user", userText);
    chatInput.value = "";

    // Append Typing status
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "ai-typing-indicator";
    typingIndicator.id = "aiTyping";
    typingIndicator.textContent = "Analyzing your balance data...";
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      // Gather real-time financial background context details dynamically
      const activeContextData = await gatherFinancialContext();

      // Submit data via your api framework update added in Step 1
      const data = await api.ai.chat({
        userMessage: userText,
        chatHistory: chatHistory,
        financialData: activeContextData
      });

      // Remove loading indicator
      document.getElementById("aiTyping")?.remove();

      // Render response text onto conversation thread view containers
      appendMessage("bot", data.reply);

      // Cache details inside localized array structure tracking thread historical records
      chatHistory.push({ sender: "user", text: userText });
      chatHistory.push({ sender: "ai", text: data.reply });

    } catch (error) {
      document.getElementById("aiTyping")?.remove();
      console.error("AI Assistant Exception:", error);
      
      // Provide a more helpful fallback message
      const errorMsg = error?.error || error?.message || "";
      if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
        appendMessage("bot", "Your session has expired. Please log out and log back in to continue using the AI advisor.");
      } else {
        appendMessage("bot", "I'm sorry, I couldn't connect to the AI service right now. This could be due to a network issue or server maintenance. Please check your connection and try again in a moment.");
      }
    }
  });

  function appendMessage(sender, text) {
    const msgBubble = document.createElement("div");
    msgBubble.className = `ai-message ${sender}`;
    
    // Enhanced formatting: Support markdown patterns from Gemini responses
    let formattedText = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // sanitize string
      .replace(/\n/g, "<br/>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold formatting conversion
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // italic formatting
      .replace(/^\s*[\-\*]\s+(.*)$/gm, "• $1") // bullets conversion
      .replace(/^\s*(\d+)\.\s+(.*)$/gm, "<strong>$1.</strong> $2") // numbered lists
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:3px;font-size:0.85em;">$1</code>'); // inline code

    msgBubble.innerHTML = formattedText;
    messagesContainer.appendChild(msgBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});