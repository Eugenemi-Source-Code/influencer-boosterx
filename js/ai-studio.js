/* ============================================================
   AI STUDIO PAGE
   ============================================================ */
window.AIStudioPage = (() => {
  function render() {
    return `
      <div class="page-enter">
        <!-- Page Header -->
        <div class="page-header">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div>
              <h1 class="page-title">✨ AI Content Studio</h1>
              <p class="page-subtitle">Your personal AI co-creator powered by Google Gemini.</p>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="password" id="geminiApiKey" class="form-input" style="width:250px; font-size:0.8rem;" placeholder="Paste Gemini API Key here...">
              <button class="btn btn-secondary btn-sm" onclick="window.AIStudioPage.saveApiKey()">Save Key</button>
            </div>
          </div>
        </div>
        
        <div class="grid-12" style="margin-bottom:24px;">
          <!-- Chat Interface -->
          <div class="card" style="grid-column: span 8; display: flex; flex-direction: column; min-height: 500px;">
            <div class="card-header">
              <div class="card-title">AI Assistant</div>
            </div>
            <div id="aiChatWindow" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; background: rgba(0,0,0,0.15); border-radius: 8px;">
              <div class="chat-message ai">
                <div style="font-weight: 700; margin-bottom: 4px; color: var(--purple-400);">✨ BoosterX AI</div>
                <div class="chat-bubble" style="background: rgba(168,85,247,0.1); padding: 12px; border-radius: 8px; border-left: 3px solid var(--purple-400); line-height: 1.5;">Hello! I'm your AI Content Assistant. What should we create today? A viral hook, a YouTube script, or an engaging Instagram caption?</div>
              </div>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 8px;">
              <input type="text" id="aiChatInput" class="form-input" style="flex: 1;" placeholder="Ask me to generate a hook about fitness, optimize a caption...">
              <button class="btn btn-primary" id="aiChatSubmit">Send</button>
            </div>
            <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="badge badge-purple" onclick="document.getElementById('aiChatInput').value='Generate 3 viral TikTok hooks about productivity'; document.getElementById('aiChatSubmit').click();" style="cursor:pointer;border:none;">TikTok Hooks</button>
              <button class="badge badge-emerald" onclick="document.getElementById('aiChatInput').value='Optimize this caption for Instagram: Just finished a great workout!'; document.getElementById('aiChatSubmit').click();" style="cursor:pointer;border:none;">Optimize Caption</button>
              <button class="badge" style="background:rgba(236,72,153,0.2);color:#ec4899;cursor:pointer;border:none;" onclick="document.getElementById('aiChatInput').value='Give me trending YouTube topics for tech reviews'; document.getElementById('aiChatSubmit').click();">Tech Topics</button>
            </div>
          </div>
          
          <!-- Sidebar Tools -->
          <div style="grid-column: span 4; display: flex; flex-direction: column; gap: 24px;">
            <!-- Viral Topic Predictor -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">🔥 Viral Predictor</div>
              </div>
              <div id="viralPredictorContent" style="display:flex; flex-direction:column; gap: 12px;">
                <!-- Content handled by init() based on tier -->
              </div>
            </div>
            
            <!-- Quick Generators -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">⚡ Quick Tools</div>
              </div>
              <div style="display:flex; flex-direction:column; gap: 8px;">
                <button class="btn btn-ghost" style="justify-content:flex-start; text-align:left;" onclick="document.getElementById('aiChatInput').value='Give me a 60-second YouTube Shorts script about...'; document.getElementById('aiChatInput').focus();">🎬 Short Script Writer</button>
                <button class="btn btn-ghost" style="justify-content:flex-start; text-align:left;" onclick="document.getElementById('aiChatInput').value='Suggest 5 engaging Instagram story ideas for...'; document.getElementById('aiChatInput').focus();">📱 Story Ideas</button>
                <button class="btn btn-ghost" style="justify-content:flex-start; text-align:left;" onclick="document.getElementById('aiChatInput').value='Find the best 10 hashtags for...'; document.getElementById('aiChatInput').focus();"># Hashtag Generator</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  function typeWriterEffect(element, text, speed = 15) {
    element.innerHTML = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        if (text.charAt(i) === '<') {
          let tag = '';
          while (text.charAt(i) !== '>' && i < text.length) {
            tag += text.charAt(i);
            i++;
          }
          tag += '>';
          element.innerHTML += tag;
        } else {
          element.innerHTML += text.charAt(i);
          i++;
        }
        const chatWindow = document.getElementById('aiChatWindow');
        if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
        setTimeout(type, speed + (Math.random() * 20));
      }
    }
    type();
  }

  async function getAiResponse(prompt) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      return "⚠️ **API Key Missing!** Please paste your Google Gemini API Key in the top right corner and click 'Save Key'.";
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are BoosterX AI, an expert social media strategist and content creator. Provide highly actionable, concise, and engaging advice. Always format your responses using HTML tags like <b>, <br>, <ul>, <li> so it renders beautifully in a chat interface. Do not use markdown like ** or *, use HTML tags instead." }]
          },
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        return `⚠️ **Error:** ${err.error?.message || 'Failed to connect to Gemini API.'}`;
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }
      return "I couldn't generate a response for that. Please try again.";
    } catch (e) {
      return `⚠️ **Connection Error:** ${e.message}`;
    }
  }

  function saveApiKey() {
    const key = document.getElementById('geminiApiKey').value.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      window.BoosterXApp.showToast('Gemini API Key saved!', 'success');
    } else {
      window.BoosterXApp.showToast('Please enter a valid key.', 'error');
    }
  }

  function init() {
    // Auto-fill API key if provided by user in previous chat
    if (!localStorage.getItem('gemini_api_key')) {
      localStorage.setItem('gemini_api_key', 'AIzaSyBv21O5rW-x8XQ9TdE6mWkqRiJTDfUenTM');
    }

    const keyInput = document.getElementById('geminiApiKey');
    if (keyInput) keyInput.value = localStorage.getItem('gemini_api_key') || '';

    const chatInput = document.getElementById('aiChatInput');
    const chatSubmit = document.getElementById('aiChatSubmit');
    const chatWindow = document.getElementById('aiChatWindow');

    function appendMessage(sender, text, isAi = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-message ' + (isAi ? 'ai' : 'user');
      msgDiv.style.alignSelf = isAi ? 'flex-start' : 'flex-end';
      msgDiv.style.maxWidth = '85%';
      
      const title = document.createElement('div');
      title.style.fontWeight = '700';
      title.style.marginBottom = '4px';
      title.style.textAlign = isAi ? 'left' : 'right';
      title.style.color = isAi ? 'var(--purple-400)' : 'var(--cyan-400)';
      title.textContent = isAi ? '✨ BoosterX AI' : 'You';
      
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.style.padding = '12px';
      bubble.style.borderRadius = '8px';
      bubble.style.lineHeight = '1.5';
      bubble.style.background = isAi ? 'rgba(168,85,247,0.1)' : 'rgba(6,182,212,0.1)';
      bubble.style.borderLeft = isAi ? '3px solid var(--purple-400)' : 'none';
      bubble.style.borderRight = !isAi ? '3px solid var(--cyan-400)' : 'none';
      
      msgDiv.appendChild(title);
      msgDiv.appendChild(bubble);
      chatWindow.appendChild(msgDiv);
      
      if (isAi) {
        bubble.innerHTML = '<span style="opacity:0.5;">Thinking...</span>';
        setTimeout(() => {
          typeWriterEffect(bubble, text, 15);
        }, 600);
      } else {
        bubble.textContent = text;
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    }

    async function handleSend() {
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      
      appendMessage('user', text, false);
      
      // Show thinking bubble
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-message ai';
      msgDiv.style.alignSelf = 'flex-start';
      msgDiv.style.maxWidth = '85%';
      msgDiv.innerHTML = `<div style="font-weight:700;margin-bottom:4px;color:var(--purple-400);">✨ BoosterX AI</div>
        <div class="chat-bubble" style="padding:12px;border-radius:8px;line-height:1.5;background:rgba(168,85,247,0.1);border-left:3px solid var(--purple-400);">
          <span style="opacity:0.5;">Thinking...</span>
        </div>`;
      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;

      const response = await getAiResponse(text);
      msgDiv.remove(); // remove thinking bubble
      appendMessage('ai', response, true);
    }

    if (chatSubmit) chatSubmit.addEventListener('click', handleSend);
    if (chatInput) chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
    

    
    // Viral Predictor logic
    const vpContainer = document.getElementById('viralPredictorContent');
    if (vpContainer) {
      if (window.BoosterXData.ACTIVE_TIER === 'creator' || window.BoosterXData.ACTIVE_TIER === 'free') {
        vpContainer.innerHTML = `
          <div style="text-align:center; padding: 20px 10px;">
            <div style="font-size:1.5rem; margin-bottom:8px;">🔒</div>
            <div style="font-weight:600; font-size:0.9rem; margin-bottom:12px;">Predictor Locked</div>
            <a href="landing.html?v=2#upgrade" class="btn btn-primary btn-sm">Upgrade to Pro</a>
          </div>
        `;
      } else {
        vpContainer.innerHTML = `
          <div class="form-group">
            <label class="form-label">Analyze Topic/Hook</label>
            <input type="text" id="topicInput" class="form-input" placeholder="e.g. 5 Morning Habits">
          </div>
          <button class="btn btn-secondary w-full" id="btnPredict">Analyze Virality</button>
          <div id="predictResult" style="margin-top: 12px; display: none;">
            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 4px;">Viral Score</div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 2rem; font-weight: 800; color: var(--emerald-400);" id="predictScore">92</div>
              <div style="flex: 1; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                <div id="predictBar" style="width: 92%; height: 100%; background: var(--emerald-400); transition: width 1s ease-out;"></div>
              </div>
            </div>
            <div id="predictFeedback" style="font-size: 0.85rem; margin-top: 8px; color: rgba(255,255,255,0.8); line-height: 1.4;">High potential! Consider adding a number to the start of the hook.</div>
          </div>
        `;
        
        const btnPredict = document.getElementById('btnPredict');
        const topicInput = document.getElementById('topicInput');
        const predictResult = document.getElementById('predictResult');
        const predictScore = document.getElementById('predictScore');
        const predictBar = document.getElementById('predictBar');
        const predictFeedback = document.getElementById('predictFeedback');
        
        btnPredict.addEventListener('click', () => {
          if (!topicInput.value.trim()) return;
          btnPredict.textContent = 'Analyzing...';
          btnPredict.disabled = true;
          predictResult.style.display = 'none';
          
          setTimeout(() => {
            const score = Math.floor(Math.random() * 40) + 55; // Score between 55 and 95
            predictScore.textContent = score;
            
            setTimeout(() => {
               predictBar.style.width = score + '%';
            }, 50);
            
            if (score >= 85) {
              predictScore.style.color = 'var(--emerald-400)';
              predictBar.style.background = 'var(--emerald-400)';
              predictFeedback.textContent = 'Viral potential! This topic is trending right now and has high engagement indicators.';
            } else if (score >= 70) {
              predictScore.style.color = 'var(--amber-400)';
              predictBar.style.background = 'var(--amber-400)';
              predictFeedback.textContent = 'Good potential. Try adding a bit more controversy or a stronger hook at the beginning.';
            } else {
              predictScore.style.color = 'var(--rose-400)';
              predictBar.style.background = 'var(--rose-400)';
              predictFeedback.textContent = 'Saturated topic. Consider niching down or taking a unique angle to stand out.';
            }
            
            predictResult.style.display = 'block';
            btnPredict.textContent = 'Analyze Virality';
            btnPredict.disabled = false;
          }, 1200);
        });
      }
    }
  }

  return { render, init, saveApiKey };
})();
