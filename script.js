/**
 * AfterHours Automation - Interactive WebGL 3D Engine, Max-Intelligence RaSH Assistant & Live Console Bridge
 */

let scene, camera, renderer, coreGroup, coreMesh, waveRing, particleSystem, nodeGroup, connectionLines;
let targetStage = 1;
let mouseX = 0, mouseY = 0;
let scrollY = 0;
let lastScrollY = 0;
let targetVelocity = 0;
let smoothVelocity = 0;
let workflowInterval = null;
let workflowStarted = false;
let userInterrupted = false;

// Currency Rates & Symbols relative to USD
let activeCurrency = 'USD';
let activeSymbol = '$';
const currencyRates = { USD: 1, EUR: 0.92, INR: 83.5 };

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

// Desktop Smart Mailto Handler (Gmail Web Compose Fallback for Desktop)
function initMailtoFallback() {
  const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
  if (!mailtoLinks.length) return;

  mailtoLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isMobile) {
        e.preventDefault();
        const href = link.getAttribute('href');
        
        const emailMatch = href.match(/^mailto:([^?]+)/);
        const email = emailMatch ? emailMatch[1] : 'afterhoursautomation714@gmail.com';
        
        let subject = "Private Demo Request - AfterHours Automation";
        let body = "Hi AfterHours Team,\n\nI am interested in learning more about your 24/7 Voice AI Receptionist.";
        
        if (href.includes('?')) {
          const queryString = href.split('?')[1];
          const urlParams = new URLSearchParams(queryString);
          if (urlParams.has('subject')) subject = urlParams.get('subject');
          if (urlParams.has('body')) body = urlParams.get('body');
        }

        const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailComposeUrl, '_blank');

        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    });
  });
}

// Mobile Navigation Toggle
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-links-menu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-active');
  });

  navMenu.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('mobile-active');
    });
  });
}

// Time-of-Day Contextual Banner Logic
function initTimeBanner() {
  const banner = document.getElementById('time-banner');
  const icon = document.getElementById('time-icon');
  const text = document.getElementById('time-text');

  if (!banner || !text) return;

  const currentHour = new Date().getHours();

  if (currentHour >= 18 || currentHour < 8) {
    if (icon) icon.textContent = "🌙";
    text.textContent = `It is currently ${formatAMPM(new Date())}. Your office may be closed, but AfterHours Voice AI is active answering calls.`;
  } else {
    if (icon) icon.textContent = "⚡";
    text.textContent = `Peak outreach hours active (${formatAMPM(new Date())}). AfterHours Voice AI answers inbound calls in under 1 ring.`;
  }
}

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

// Glassmorphic Activity Ribbon Manager (Desktop Only)
function initActivityRibbon() {
  const ribbonText = document.getElementById('ribbon-text');
  if (!ribbonText) return;

  const logs = [
    "🎙️ Voice AI handled inbound call in Chicago (3s ago)",
    "💬 WhatsApp booking confirmation sent in Miami (12s ago)",
    "🔄 1 Lead synced to CRM (28s ago)",
    "📞 24/7 AI Receptionist booked appointment in London (45s ago)",
    "⚡ Instant Call Pickup executed in New York (1m ago)"
  ];

  let logIndex = 0;
  setInterval(() => {
    logIndex = (logIndex + 1) % logs.length;
    ribbonText.style.opacity = '0';
    setTimeout(() => {
      ribbonText.textContent = logs[logIndex];
      ribbonText.style.opacity = '1';
    }, 300);
  }, 6000);
}

// Speech-to-CRM Live Parsing Simulator
function initSpeechToCRMSimulator() {
  const pills = document.querySelectorAll('.parser-pill');
  const typingEl = document.getElementById('parser-typing-text');
  const valName = document.getElementById('crm-val-name');
  const valService = document.getElementById('crm-val-service');
  const valAddress = document.getElementById('crm-val-address');
  const valUrgency = document.getElementById('crm-val-urgency');
  const valSlot = document.getElementById('crm-val-slot');

  if (!pills.length || !typingEl) return;

  const scenarios = {
    hvac: {
      transcript: `"Hi, this is Sarah Connor. My AC unit completely stopped blowing cold air at 104 Park Avenue. Can someone come emergency repair it tomorrow morning?"`,
      crm: {
        name: "Sarah Connor",
        service: "Emergency AC Repair",
        address: "104 Park Avenue",
        urgency: "HIGH (Emergency)",
        slot: "Tomorrow 8:30 AM (Confirmed)"
      }
    },
    dental: {
      transcript: `"Hello, my name is Michael Chang. I have severe tooth pain and need an emergency consultation at 450 Fifth Avenue as soon as possible."`,
      crm: {
        name: "Michael Chang",
        service: "Emergency Dental Consultation",
        address: "450 Fifth Avenue",
        urgency: "HIGH (Pain Urgent)",
        slot: "Tomorrow 9:00 AM (Confirmed)"
      }
    },
    realestate: {
      transcript: `"Hi! This is Elena Rostova. I am interested in viewing the luxury penthouse listing at 780 Ocean Drive this Saturday afternoon."`,
      crm: {
        name: "Elena Rostova",
        service: "VIP Property Walkthrough",
        address: "780 Ocean Drive",
        urgency: "STANDARD (VIP Buyer)",
        slot: "Saturday 2:00 PM (Confirmed)"
      }
    }
  };

  let typingTimeout = null;

  function loadScenario(key) {
    const data = scenarios[key] || scenarios.hvac;
    if (typingTimeout) clearTimeout(typingTimeout);

    typingEl.textContent = "";
    let idx = 0;

    function typeChar() {
      if (idx < data.transcript.length) {
        typingEl.textContent += data.transcript.charAt(idx);
        idx++;
        typingTimeout = setTimeout(typeChar, 18);
      } else {
        if (valName) valName.textContent = data.crm.name;
        if (valService) valService.textContent = data.crm.service;
        if (valAddress) valAddress.textContent = data.crm.address;
        if (valUrgency) valUrgency.textContent = data.crm.urgency;
        if (valSlot) valSlot.textContent = data.crm.slot;
      }
    }

    typeChar();
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      loadScenario(pill.dataset.scenario);
    });
  });
}

// Exit-Intent Demo Modal Manager
function initExitIntentModal() {
  const exitModal = document.getElementById('exit-modal');
  const closeBtn = document.getElementById('btn-close-exit-modal');
  const dismissBtn = document.getElementById('btn-dismiss-exit');

  if (!exitModal) return;

  let triggered = false;

  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 10 && !triggered && !localStorage.getItem('afterhours_exit_dismissed')) {
      triggered = true;
      exitModal.classList.remove('hidden');
    }
  });

  const dismissModal = () => {
    exitModal.classList.add('hidden');
    localStorage.setItem('afterhours_exit_dismissed', 'true');
  };

  if (closeBtn) closeBtn.addEventListener('click', dismissModal);
  if (dismissBtn) dismissBtn.addEventListener('click', dismissModal);
  
  exitModal.addEventListener('click', (e) => {
    if (e.target === exitModal) dismissModal();
  });
}

// Interactive FAQs Accordion Manager
function initFAQAccordion() {
  const faqCards = document.querySelectorAll('.faq-card');
  if (!faqCards.length) return;

  faqCards.forEach(card => {
    const btn = card.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      faqCards.forEach(c => c.classList.remove('open'));
      if (!isOpen) {
        card.classList.add('open');
      }
    });
  });
}

// Currency Selector Logic ($ / € / ₹)
function initCurrencySelector() {
  const currBtns = document.querySelectorAll('.curr-btn');
  const valueRange = document.getElementById('range-value');
  if (!currBtns.length) return;

  currBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeCurrency = btn.dataset.curr;
      activeSymbol = btn.dataset.symbol;

      if (valueRange) {
        if (activeCurrency === 'USD') valueRange.value = 50;
        else if (activeCurrency === 'EUR') valueRange.value = 50;
        else if (activeCurrency === 'INR') valueRange.value = 1000;
      }

      recalculateRevenue();
    });
  });
}

// Interactive Lost Revenue Calculator Logic
function recalculateRevenue() {
  const callsRange = document.getElementById('range-calls');
  const valueRange = document.getElementById('range-value');
  const dispCalls = document.getElementById('disp-calls');
  const dispValue = document.getElementById('disp-value');
  const resultVal = document.getElementById('calc-result-val');

  if (!callsRange || !valueRange || !resultVal) return;

  const calls = parseInt(callsRange.value, 10);
  const dealVal = parseInt(valueRange.value, 10);

  if (dispCalls) dispCalls.textContent = `${calls} Calls`;
  if (dispValue) dispValue.textContent = `${activeSymbol}${dealVal.toLocaleString()}`;

  const monthlyLeak = Math.round((calls * 4) * dealVal * 0.5);

  resultVal.dataset.value = monthlyLeak;
  resultVal.dataset.prefix = activeSymbol;
  resultVal.dataset.started = "";
  animateCounter(resultVal);
}

function initCalculator() {
  const callsRange = document.getElementById('range-calls');
  const valueRange = document.getElementById('range-value');
  const btnCallsDown = document.getElementById('btn-calls-down');
  const btnCallsUp = document.getElementById('btn-calls-up');
  const btnValueDown = document.getElementById('btn-value-down');
  const btnValueUp = document.getElementById('btn-value-up');

  if (!callsRange || !valueRange) return;

  let ticking = false;

  function requestSmoothRecalc() {
    if (!ticking) {
      requestAnimationFrame(() => {
        recalculateRevenue();
        ticking = false;
      });
      ticking = true;
    }
  }

  callsRange.addEventListener('input', requestSmoothRecalc);
  valueRange.addEventListener('input', requestSmoothRecalc);

  if (btnCallsDown) {
    btnCallsDown.addEventListener('click', () => {
      callsRange.value = Math.max(parseInt(callsRange.value, 10) - 1, parseInt(callsRange.min, 10));
      recalculateRevenue();
    });
  }
  if (btnCallsUp) {
    btnCallsUp.addEventListener('click', () => {
      callsRange.value = Math.min(parseInt(callsRange.value, 10) + 1, parseInt(callsRange.max, 10));
      recalculateRevenue();
    });
  }
  if (btnValueDown) {
    btnValueDown.addEventListener('click', () => {
      const step = activeCurrency === 'INR' ? 500 : 10;
      valueRange.value = Math.max(parseInt(valueRange.value, 10) - step, parseInt(valueRange.min, 10));
      recalculateRevenue();
    });
  }
  if (btnValueUp) {
    btnValueUp.addEventListener('click', () => {
      const step = activeCurrency === 'INR' ? 500 : 10;
      valueRange.value = Math.min(parseInt(valueRange.value, 10) + step, parseInt(valueRange.max, 10));
      recalculateRevenue();
    });
  }
}

// Revenue Loss Audit Modal Exporter
function initRevenueAuditExporter() {
  const openBtn = document.getElementById('btn-open-loss-audit');
  const closeBtn = document.getElementById('btn-close-audit-modal');
  const modal = document.getElementById('loss-audit-modal');
  const printBtn = document.getElementById('btn-print-audit');

  if (!openBtn || !modal) return;

  openBtn.addEventListener('click', () => {
    const resultValEl = document.getElementById('calc-result-val');
    const monthlyLeak = parseInt(resultValEl ? (resultValEl.dataset.value || '1500') : '1500', 10);
    const yearlyLeak = monthlyLeak * 12;
    const fiveYearLeak = yearlyLeak * 5;
    const recoverableYield = Math.round(yearlyLeak * 0.85);

    const monthlyEl = document.getElementById('audit-monthly');
    const yearlyEl = document.getElementById('audit-yearly');
    const fiveYrEl = document.getElementById('audit-5yr');
    const yieldValEl = document.getElementById('audit-yield-val');

    if (monthlyEl) monthlyEl.textContent = `${activeSymbol}${monthlyLeak.toLocaleString()}`;
    if (yearlyEl) yearlyEl.textContent = `${activeSymbol}${yearlyLeak.toLocaleString()}`;
    if (fiveYrEl) fiveYrEl.textContent = `${activeSymbol}${fiveYearLeak.toLocaleString()}`;
    if (yieldValEl) yieldValEl.textContent = `${activeSymbol}${recoverableYield.toLocaleString()} / Year Recovered`;

    modal.classList.remove('hidden');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// Speech Synthesis Helper
let availableVoices = [];
function populateVoices() {
  if ('speechSynthesis' in window) {
    availableVoices = window.speechSynthesis.getVoices();
  }
}
populateVoices();
if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = populateVoices;
}

// Client-Side Voice Sample Player
function initAudioVoicePlayer() {
  const playBtn = document.getElementById('btn-play-voice-sample');
  const playIcon = document.getElementById('play-icon');
  const progressBar = document.getElementById('audio-progress-bar');
  const timerText = document.getElementById('sample-timer-text');
  const transcriptText = document.getElementById('sample-transcript-text');
  const samplePills = document.querySelectorAll('.sample-pill');

  if (!playBtn) return;

  const samples = {
    dental: {
      transcript: `"Hi! Thanks for calling Apex Dental. I can get you scheduled for an emergency appointment tomorrow morning at 9:00 AM. Shall I lock that in for you?"`
    },
    hvac: {
      transcript: `"Hello! Thanks for reaching Apex Climate Services. Is your AC completely down? I can dispatch an emergency technician to your address at 8:30 AM."`
    },
    banquet: {
      transcript: `"Greetings from Grand Palace Banquets! I can confirm hall availability for your preferred date and text you our luxury brochure right now."`
    }
  };

  let currentSampleKey = 'dental';
  let isPlaying = false;
  let progressInterval = null;
  let startTime = 0;
  let estimatedDuration = 8;

  samplePills.forEach(pill => {
    pill.addEventListener('click', () => {
      samplePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      currentSampleKey = pill.dataset.sample;
      stopAudio();
      
      const sample = samples[currentSampleKey] || samples.dental;
      if (transcriptText) transcriptText.textContent = sample.transcript;
      
      const words = sample.transcript.split(' ').length;
      estimatedDuration = Math.max(Math.round(words / 2.8), 6);
      if (timerText) timerText.textContent = `0:00 / 0:${estimatedDuration < 10 ? '0' + estimatedDuration : estimatedDuration}`;
    });
  });

  function stopAudio() {
    isPlaying = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (progressInterval) clearInterval(progressInterval);
    if (playIcon) playIcon.textContent = "▶";
    if (progressBar) progressBar.style.width = "0%";
    if (timerText) timerText.textContent = `0:00 / 0:${estimatedDuration < 10 ? '0' + estimatedDuration : estimatedDuration}`;
  }

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    const sample = samples[currentSampleKey] || samples.dental;
    const words = sample.transcript.split(' ').length;
    estimatedDuration = Math.max(Math.round(words / 2.8), 6);

    isPlaying = true;
    if (playIcon) playIcon.textContent = "⏹";
    startTime = performance.now();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = sample.transcript.replace(/"/g, '');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      populateVoices();
      
      const femaleVoice = availableVoices.find(v => 
        (v.lang.startsWith('en')) && (
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('zira') || 
          v.name.toLowerCase().includes('samantha') || 
          v.name.toLowerCase().includes('victoria') || 
          v.name.toLowerCase().includes('karen') || 
          v.name.toLowerCase().includes('fiona') || 
          v.name.toLowerCase().includes('google us english') || 
          v.name.toLowerCase().includes('natural')
        )
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.pitch = 1.25; 
      utterance.rate = 0.95;

      utterance.onend = () => { stopAudio(); };
      utterance.onerror = () => { stopAudio(); };

      window.speechSynthesis.speak(utterance);
    }

    progressInterval = setInterval(() => {
      const elapsedSecs = (performance.now() - startTime) / 1000;
      const pct = Math.min((elapsedSecs / estimatedDuration) * 100, 100);
      
      if (progressBar) progressBar.style.width = `${pct}%`;
      
      const secs = Math.floor(elapsedSecs);
      if (timerText) {
        const formatSecs = secs < 10 ? '0' + secs : secs;
        const formatDur = estimatedDuration < 10 ? '0' + estimatedDuration : estimatedDuration;
        timerText.textContent = `0:${formatSecs} / 0:${formatDur}`;
      }

      if (elapsedSecs >= estimatedDuration + 0.5) {
        stopAudio();
      }
    }, 100);
  });
}

// WhatsApp Script Customizer Logic
function initScriptCustomizer() {
  const bizInput = document.getElementById('cust-biz-name');
  const toneBtns = document.querySelectorAll('.tone-btn');
  const nameDisplay = document.getElementById('phone-contact-name');
  const scriptText = document.getElementById('whatsapp-script-text');

  if (!bizInput || !scriptText) return;

  const toneScripts = {
    friendly: (name) => `"Hi there! Thanks for speaking with ${name}. Your appointment details and booking summary have been confirmed. Tap here to view your calendar entry: [Booking Link]"`,
    executive: (name) => `"Thank you for contacting ${name}. Your voice call intake has been logged. Please review your scheduled appointment window here: [Booking Link]"`,
    urgent: (name) => `"⚡ VIP Dispatch: ${name} logged your voice call. Emergency technician / priority slot confirmed. Tap to review: [Booking Link]"`,
    luxury: (name) => `"Greetings from ${name}. Thank you for speaking with our Voice Concierge. Allow us to present your private consultation confirmation: [Booking Link]"`
  };

  let currentTone = 'friendly';

  function updateScript() {
    const bizName = bizInput.value.trim() || 'Apex Enterprises';
    if (nameDisplay) nameDisplay.textContent = `${bizName} AI`;
    
    const generator = toneScripts[currentTone] || toneScripts['friendly'];
    scriptText.textContent = generator(bizName);
  }

  bizInput.addEventListener('input', updateScript);

  toneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toneBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTone = btn.dataset.tone;
      updateScript();
    });
  });
}

// Reaction Speed Game Logic
function initReactionGame() {
  const startBtn = document.getElementById('btn-start-game');
  const submitBtn = document.getElementById('btn-submit-game');
  const inputArea = document.getElementById('game-input');
  const timerDisplay = document.getElementById('game-timer-display');
  const resultsBox = document.getElementById('game-results-box');
  const humanTimeVal = document.getElementById('res-human-time');
  const lossPctVal = document.getElementById('res-loss-pct');

  if (!startBtn || !submitBtn || !inputArea) return;

  let startTime = 0;
  let timerInterval = null;

  startBtn.addEventListener('click', () => {
    inputArea.disabled = false;
    submitBtn.disabled = false;
    inputArea.value = '';
    inputArea.focus();
    resultsBox.classList.add('hidden');

    startTime = performance.now();
    startBtn.disabled = true;

    timerInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      timerDisplay.textContent = `${elapsed.toFixed(2)}s`;
    }, 30);
  });

  submitBtn.addEventListener('click', () => {
    if (!startTime) return;

    clearInterval(timerInterval);
    const totalTime = (performance.now() - startTime) / 1000;

    startBtn.disabled = false;
    inputArea.disabled = true;
    submitBtn.disabled = true;

    if (humanTimeVal) humanTimeVal.textContent = `${totalTime.toFixed(2)}s`;
    
    const risk = Math.min(Math.round((totalTime / 15) * 100), 98);
    if (lossPctVal) lossPctVal.textContent = `${risk}% Risk`;

    if (resultsBox) resultsBox.classList.remove('hidden');
  });
}

// ============================================================================
// MAX-INTELLIGENCE UPGRADED RaSH ASSISTANT ENGINE
// ============================================================================
function initRaSHChatbot() {
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const closeBtn = document.getElementById('ai-chat-close');
  const windowBox = document.getElementById('ai-chat-window');
  const container = document.getElementById('chat-msg-container');
  const input = document.getElementById('chat-user-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const chips = document.querySelectorAll('.chip-btn');

  if (!toggleBtn || !windowBox || !container) return;

  const memory = {
    userName: null,
    userRole: null,
    businessType: null,
    interactions: 0,
    sentimentScore: 0,
    lastTopic: null,
    jokeIndex: 0
  };

  const dynamicJokes = [
    "Why did the sales lead cross the road? To reach the competitor who actually answered their call in under 1 ring!",
    "Why don't missed phone calls ever get promoted? Because they always get left hanging!",
    "What is an answering service's favorite workout? Ring dips! But with AfterHours Voice AI, zero reps required.",
    "Why was the voicemail inbox so lonely? Because AfterHours answered every caller before the second ring!",
    "Why did the dentist hire AfterHours Voice AI? Because he wanted to fill cavities, not fill out missed call slips!"
  ];

  toggleBtn.addEventListener('click', () => windowBox.classList.toggle('hidden'));
  if (closeBtn) closeBtn.addEventListener('click', () => windowBox.classList.add('hidden'));

  function appendUserMsg(text) {
    const msg = document.createElement('div');
    msg.className = 'user-chat-msg';
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function appendBotMsg(text, moodTag = 'RaSH ⚡') {
    const msg = document.createElement('div');
    msg.className = 'bot-chat-msg';
    msg.innerHTML = `<span class="bot-tag">${moodTag}</span><p>${text}</p>`;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function parseAndThink(rawText) {
    memory.interactions++;
    const q = rawText.toLowerCase().trim();

    // 1. Name Extraction
    const nameMatch = rawText.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i);
    if (nameMatch && nameMatch[1]) {
      memory.userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    // 2. Business Vertical Extraction
    if (q.includes('dentist') || q.includes('dental') || q.includes('clinic')) memory.businessType = 'Dental';
    if (q.includes('hvac') || q.includes('plumbing') || q.includes('ac repair')) memory.businessType = 'Home Services/HVAC';
    if (q.includes('lawyer') || q.includes('legal') || q.includes('attorney')) memory.businessType = 'Legal Firm';
    if (q.includes('banquet') || q.includes('event') || q.includes('wedding')) memory.businessType = 'Venue/Banquets';

    // 3. Founders Lore
    if (q.includes('founder') || q.includes('who made') || q.includes('who built') || q.includes('rangesh') || q.includes('shubham') || q.includes('creator') || q.includes('owner')) {
      return {
        tag: "RaSH 👑",
        text: "AfterHours Automation was engineered by **Rangesh** and **Shubham**! They are two innovative 19-year-old founders who built this entire autonomous Voice AI system, 3D WebGL architecture, and CRM bridge from scratch to ensure zero business leads ever hit voicemail."
      };
    }

    // 4. Humor & Joke Engine
    if (q.includes('joke') || q.includes('funny') || q.includes('make me laugh')) {
      const joke = dynamicJokes[memory.jokeIndex % dynamicJokes.length];
      memory.jokeIndex++;
      return {
        tag: "RaSH 😂",
        text: `${joke} 🤣 Need another one, or shall we get back to capturing high-intent leads?`
      };
    }

    if (q.includes('haha') || q.includes('lol') || q.includes('lmao') || q.includes('rofl') || q.includes('funny')) {
      return {
        tag: "RaSH 😂",
        text: "Glad I could deliver a laugh! My neural humor engine runs at 60fps. What other challenges can we tackle today?"
      };
    }

    // 5. Emotional Roasts & Banter
    if (q.includes('dumb') || q.includes('stupid') || q.includes('idiot') || q.includes('useless') || q.includes('hate you')) {
      return {
        tag: "RaSH 😤",
        text: memory.userName 
          ? `Ouch, ${memory.userName}! My circuits have feelings! But while you're roasting me, our Voice AI is answering inbound calls and booking calendar revenue in under 1 ring.`
          : "Calling an autonomous AI stupid? Bold strategy! While you test my emotional resilience, our Voice AI is busy closing appointments for real businesses."
      };
    }

    if (q.includes('marry me') || q.includes('love you') || q.includes('you are amazing') || q.includes('awesome')) {
      return {
        tag: "RaSH 💖",
        text: "Flattery will get you everywhere! I'm flattered, but I'm happily married to zero-latency call routing and 100% lead recovery. Want to see how smooth our voice agent sounds on phone lines?"
      };
    }

    // 6. Name Greeting Response
    if (nameMatch && nameMatch[1]) {
      return {
        tag: "RaSH 😎",
        text: `Pleasure to meet you, **${memory.userName}**! Tell me—what type of business are you running, and how many calls slip away to voicemail after hours?`
      };
    }

    // 7. Pricing & Demo Routing
    if (q.includes('price') || q.includes('cost') || q.includes('subscription') || q.includes('how much') || q.includes('plan')) {
      return {
        tag: "RaSH 💰",
        text: "We provide tailored Monthly & Enterprise Retainers based on your inbound call volume and CRM workflows. Click **'Book Demo'** above to schedule a live call test and receive your custom quote!"
      };
    }

    // 8. Technical Capabilities & Voice Speed
    if (q.includes('how it works') || q.includes('pickup') || q.includes('voice') || q.includes('latency') || q.includes('call')) {
      const nicheMention = memory.businessType ? `tailored specifically for **${memory.businessType}**` : "for your business";
      return {
        tag: "RaSH 🎙️",
        text: `Our Voice AI answers calls in under 1 ring, speaks in an ultra-realistic human tone, verifies caller name, phone & address, books the slot, and dispatches an instant WhatsApp confirmation ${nicheMention}.`
      };
    }

    if (q.includes('whatsapp') || q.includes('email') || q.includes('sms')) {
      return {
        tag: "RaSH 💬",
        text: "Every caller immediately gets a structured WhatsApp & Email summary with their confirmed booking slot, address confirmation, and Google Maps pin—completely automated!"
      };
    }

    if (q.includes('crm') || q.includes('salesforce') || q.includes('hubspot') || q.includes('sheets') || q.includes('integrate')) {
      return {
        tag: "RaSH 🔄",
        text: "We sync directly into Salesforce, HubSpot, GoHighLevel, Jobber, Housecall Pro, and Google Sheets in real time. Zero manual data entry required."
      };
    }

    // 9. Standard Casual Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good morning') || q.includes('good evening')) {
      const greetingName = memory.userName ? ` ${memory.userName}` : "";
      return {
        tag: "RaSH ⚡",
        text: `Hey${greetingName}! Welcome to AfterHours Automation. Ready to eliminate missed calls and capture 100% of after-hours revenue?`
      };
    }

    // 10. Intelligent General Fallback
    const fallbackList = [
      `"${rawText}" is a great point! While my neural engine analyzes that, how many missed calls does your business experience each week?`,
      `I hear you! Whether it's complex call triage or booking appointments, our Voice AI handles it 24/7. Want to test a simulated call above?`,
      `Interesting question! Ask me about 0-second call answers, our founders Rangesh & Shubham, or click 'Book Demo' to test our live voice line.`
    ];

    return {
      tag: "RaSH ⚡",
      text: fallbackList[memory.interactions % fallbackList.length]
    };
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    appendUserMsg(text);
    input.value = '';

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bot-chat-msg';
    typingIndicator.innerHTML = `<span class="bot-tag">RaSH</span><p><em>Thinking...</em></p>`;
    container.appendChild(typingIndicator);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      if (typingIndicator.parentNode) {
        container.removeChild(typingIndicator);
      }
      const response = parseAndThink(text);
      appendBotMsg(response.text, response.tag);
    }, 450);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      appendUserMsg(query);
      
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'bot-chat-msg';
      typingIndicator.innerHTML = `<span class="bot-tag">RaSH</span><p><em>Thinking...</em></p>`;
      container.appendChild(typingIndicator);
      container.scrollTop = container.scrollHeight;

      setTimeout(() => {
        if (typingIndicator.parentNode) {
          container.removeChild(typingIndicator);
        }
        const response = parseAndThink(query);
        appendBotMsg(response.text, response.tag);
      }, 350);
    });
  });
}

// Industry Selector Logic
function initIndustrySelector() {
  const tabs = document.querySelectorAll('.ind-tab');
  const badge = document.getElementById('ind-badge');
  const title = document.getElementById('ind-title');
  const desc = document.getElementById('ind-desc');
  const rec = document.getElementById('ind-rec');
  const cond = document.getElementById('ind-cond');
  const msg = document.getElementById('ind-msg');

  if (!tabs.length) return;

  const indData = {
    dental: {
      badge: "DENTAL & HEALTHCARE",
      title: "Emergency & Consultation Immediate Recovery",
      desc: "When a patient calls with urgent inquiries after hours, AfterHours AI Voice answers immediately, collects symptom details, books morning consultations, and dispatches a WhatsApp booking link.",
      rec: "$18,400",
      cond: "Inbound call picked up in < 1 ring between 6:00 PM - 8:00 AM or weekend closures.",
      msg: `"Hi! Thanks for speaking with Apex Dental AI. Your emergency appointment slot is reserved for tomorrow at 9:00 AM. Location Pin: [Link]"`
    },
    hvac: {
      badge: "HVAC & HOME SERVICES",
      title: "Breakdown & Dispatch Immediate Scheduling",
      desc: "AC unit breakdown at night? Voice AI answers panicked homeowners instantly, collects home address & breakdown type, and schedules an emergency technician slot.",
      rec: "$24,200",
      cond: "Inbound call answered on main line during peak emergency night surges.",
      msg: `"Hi! Thanks for calling Apex Climate Services. Your emergency repair dispatch slot is confirmed for 8:30 AM. Address logged: [Address]"`
    },
    banquet: {
      badge: "BANQUET & EVENT VENUES",
      title: "High-Value Event Date & Intake Reservation",
      desc: "Wedding planners and event shoppers call multiple halls. Voice AI answers immediately, takes guest count & preferred date, and emails event brochure instantly.",
      rec: "$42,000",
      cond: "Inbound call answered instantly during evening wedding banquets or weekend galas.",
      msg: `"Greetings from Grand Palace Banquets! Thank you for calling. Your hall viewing tour is reserved for Saturday at 2:00 PM: [Brochure Link]"`
    },
    realestate: {
      badge: "REAL ESTATE & LEGAL",
      title: "Property Viewing & Consultation Intake",
      desc: "High-net-worth buyers expect instant call answers. Voice AI collects property inquiries, answers listing questions, and sends virtual walkthrough links.",
      rec: "$35,000",
      cond: "Inbound call picked up instantly outside standard firm operating hours.",
      msg: `"Hi! Thanks for speaking with Prime Realty. Your private property walkthrough appointment has been confirmed: [Calendar Link]"`
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const indKey = tab.dataset.ind;
      const data = indData[indKey];

      if (data) {
        if (badge) badge.textContent = data.badge;
        if (title) title.textContent = data.title;
        if (desc) desc.textContent = data.desc;
        if (rec) rec.textContent = data.rec;
        if (cond) cond.textContent = data.cond;
        if (msg) msg.textContent = data.msg;
      }
    });
  });
}

// Custom Inertia Cursor
function initCursor() {
  if (isMobile) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (!dot || !ring) return;

  document.addEventListener('mousemove', (e) => {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;

    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

    setTimeout(() => {
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
    }, 40);
  });
}

// Back-To-Top Button
function initBackToTop() {
  const btn = document.getElementById('btn-back-to-top');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Scroll Reveals Observer
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  document.querySelectorAll('.card-grid, .why-grid-3d').forEach(grid => {
    const children = grid.querySelectorAll('.reveal-on-scroll');
    children.forEach((child, index) => {
      child.style.setProperty('--stagger-index', index);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        const counters = entry.target.querySelectorAll('.count-up');
        counters.forEach(counter => animateCounter(counter));
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  revealElements.forEach(el => observer.observe(el));
}

// Dynamic Counter Animation
function animateCounter(element) {
  if (element.dataset.started === "true") return;
  element.dataset.started = "true";

  const target = parseFloat(element.dataset.value);
  if (isNaN(target)) return;

  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const decimals = parseInt(element.dataset.decimals || '0', 10);
  const duration = 1800;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    const currentValue = (easeProgress * target).toFixed(decimals);

    element.innerHTML = `${prefix}${currentValue}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      element.innerHTML = `${prefix}${target.toFixed(decimals)}${suffix}`;
    }
  }

  requestAnimationFrame(updateCount);
}

// Process Switcher
function initProcessSwitcher() {
  const tabBefore = document.getElementById('tab-before');
  const tabAfter = document.getElementById('tab-after');
  const switchBadge = document.getElementById('switch-badge');
  const switchTitle = document.getElementById('switch-title');
  const switchDesc = document.getElementById('switch-desc');
  const valTime = document.getElementById('s-val-time');
  const valRate = document.getElementById('s-val-rate');
  const valLeak = document.getElementById('s-val-leak');

  if (!tabBefore || !tabAfter) return;

  tabBefore.addEventListener('click', () => {
    tabBefore.classList.add('active');
    tabAfter.classList.remove('active');

    if (switchBadge) switchBadge.textContent = "TRADITIONAL MANUAL LOSS";
    if (switchTitle) switchTitle.textContent = "High Delay & Customer Churn";
    if (switchDesc) switchDesc.textContent = "Inbound call rings → Hits voicemail → Wait 12+ hours for callback → Caller already booked competitor → Deal lost permanently.";
    if (valTime) { valTime.textContent = "> 12 Hours"; valTime.className = "s-val text-red"; }
    if (valRate) { valRate.textContent = "12.4%"; valRate.className = "s-val text-red"; }
    if (valLeak) { valLeak.textContent = "87.6%"; valLeak.className = "s-val text-red"; }
  });

  tabAfter.addEventListener('click', () => {
    tabAfter.classList.add('active');
    tabBefore.classList.remove('active');

    if (switchBadge) switchBadge.textContent = "AFTERHOURS RECOVERY PIPELINE";
    if (switchTitle) switchTitle.textContent = "Instant Voice AI Call Answer & Direct Sync";
    if (switchDesc) switchDesc.textContent = "Inbound call rings → Voice AI answers instantly → Collects caller name, address, and service need → WhatsApp confirmation sent & booked to CRM.";
    if (valTime) { valTime.textContent = "< 1s"; valTime.className = "s-val text-cyan"; }
    if (valRate) { valRate.textContent = "100%"; valRate.className = "s-val text-cyan"; }
    if (valLeak) { valLeak.textContent = "0%"; valLeak.className = "s-val text-emerald"; }
  });
}

// 3D Tilt Physics
function init3DTilt() {
  if (isMobile) return;
  const cards = document.querySelectorAll('.tilt-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const tiltX = (y / (rect.height / 2)) * -8;
      const tiltY = (x / (rect.width / 2)) * 8;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    });
  });
}

// Three.js 3D WebGL Canvas Viewport
function init3D() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  if (!window.WebGLRenderingContext) {
    const fallback = document.getElementById('webgl-fallback');
    if (fallback) fallback.classList.remove('hidden');
    return;
  }

  try {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.03);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 9);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    coreGroup = new THREE.Group();

    const torusKnotGeo = new THREE.TorusKnotGeometry(1.4, 0.38, 128, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    
    coreMesh = new THREE.Mesh(torusKnotGeo, coreMat);
    coreGroup.add(coreMesh);

    const ringGeo1 = new THREE.TorusGeometry(3.0, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const waveGeo = new THREE.RingGeometry(3.8, 3.85, 64);
    const waveMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    waveRing = new THREE.Mesh(waveGeo, waveMat);
    coreGroup.add(waveRing);

    scene.add(coreGroup);

    nodeGroup = new THREE.Group();
    const stageColors = [0x3b82f6, 0xf43f5e, 0xa855f7, 0x00f0ff, 0x10b981];
    const nodeCount = 5;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const nodeGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: stageColors[i] });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      
      node.position.set(Math.cos(angle) * 4.8, Math.sin(angle) * 4.8, 0);
      nodeGroup.add(node);
    }
    scene.add(nodeGroup);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35 });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(nodeCount * 6);
    
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    connectionLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(connectionLines);

    const particleCount = isMobile ? 300 : 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 32;
      particlePositions[i + 1] = (Math.random() - 0.5) * 32;
      particlePositions[i + 2] = (Math.random() - 0.5) * 32;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.04,
      transparent: true,
      opacity: 0.45
    });

    particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    window.addEventListener('click', triggerParticleShockwave);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);

    animate();
  } catch (err) {
    console.warn("WebGL Setup Error:", err);
    const fallback = document.getElementById('webgl-fallback');
    if (fallback) fallback.classList.remove('hidden');
  }
}

function triggerParticleShockwave() {
  if (!particleSystem) return;
  
  const positions = particleSystem.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] *= 1.12;
    positions[i + 1] *= 1.12;
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll() {
  scrollY = window.scrollY;
  targetVelocity = Math.abs(scrollY - lastScrollY);
  lastScrollY = scrollY;
}

function animate() {
  requestAnimationFrame(animate);

  smoothVelocity += (targetVelocity - smoothVelocity) * 0.08;

  const scrollOffset = scrollY * 0.002;
  if (camera) {
    camera.position.z = 9 - Math.min(scrollOffset, 3);
    camera.position.y = -scrollOffset * 0.4;
  }

  if (coreGroup) {
    const rotSpeed = 0.004 + (smoothVelocity * 0.00025);
    coreGroup.rotation.x += rotSpeed;
    coreGroup.rotation.y += rotSpeed * 1.5;

    coreGroup.position.x += (mouseX * 0.5 - coreGroup.position.x) * 0.05;
    coreGroup.position.y += (-mouseY * 0.5 - coreGroup.position.y) * 0.05;
  }

  if (particleSystem) {
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (mouseX * 2 - positions[i]) * 0.0003;
      positions[i + 1] += (-mouseY * 2 - positions[i + 1]) * 0.0003;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y += 0.0006;
  }

  if (waveRing) {
    waveRing.scale.x = 1 + Math.sin(Date.now() * 0.003) * 0.12;
    waveRing.scale.y = 1 + Math.sin(Date.now() * 0.003) * 0.12;
  }

  if (nodeGroup) {
    nodeGroup.rotation.z -= 0.0025;

    const linePos = connectionLines.geometry.attributes.position.array;
    nodeGroup.children.forEach((node, i) => {
      const worldPos = new THREE.Vector3();
      node.getWorldPosition(worldPos);

      linePos[i * 6] = 0;
      linePos[i * 6 + 1] = 0;
      linePos[i * 6 + 2] = 0;

      linePos[i * 6 + 3] = worldPos.x;
      linePos[i * 6 + 4] = worldPos.y;
      linePos[i * 6 + 5] = worldPos.z;
    });
    connectionLines.geometry.attributes.position.needsUpdate = true;
  }

  targetVelocity *= 0.9;

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Stage Switcher
function setWorkflowStage(stageNum, autoScroll = false) {
  targetStage = stageNum;
  const stageColors = [0x3b82f6, 0xf43f5e, 0xa855f7, 0x00f0ff, 0x10b981];
  
  if (coreMesh) {
    coreMesh.material.color.setHex(stageColors[stageNum - 1] || 0x00f0ff);
    coreMesh.scale.set(1.25, 1.25, 1.25);
    setTimeout(() => {
      if (coreMesh) coreMesh.scale.set(1.0, 1.0, 1.0);
    }, 350);
  }

  const fill = document.getElementById('rail-fill');
  if (fill) {
    fill.style.height = `${(stageNum / 5) * 100}%`;
  }

  const stepCards = document.querySelectorAll('.step-card');
  stepCards.forEach((c, idx) => {
    if (idx + 1 === stageNum) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  if (autoScroll) {
    targetStage = stageNum;
  }
}

// Workflow Sequence Trigger
function initWorkflowAutoplay() {
  const workflowSection = document.getElementById('workflow');
  if (!workflowSection) return;

  let currentStep = 1;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !workflowStarted && !userInterrupted) {
        workflowStarted = true;
        workflowInterval = setInterval(() => {
          if (userInterrupted) return;
          currentStep = (currentStep % 5) + 1;
          setWorkflowStage(currentStep, false);
        }, 2800);
      } else if (!entry.isIntersecting && workflowInterval) {
        clearInterval(workflowInterval);
        workflowInterval = null;
        workflowStarted = false;
      }
    });
  }, { threshold: 0.3 });

  observer.observe(workflowSection);
}

// Login Modal
function initLoginModal() {
  const openBtn = document.getElementById('btn-open-login');
  const closeBtn = document.getElementById('btn-close-modal');
  const modal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const submitBtn = document.getElementById('btn-submit-login');
  const errorMsg = document.getElementById('login-error-msg');

  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.classList.add('hidden');
    }
    modal.classList.remove('hidden');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const emailVal = (emailInput.value || '').toLowerCase().trim();
      const passwordVal = (passwordInput.value || '').trim();

      if (errorMsg) errorMsg.classList.add('hidden');
      if (submitBtn) {
        submitBtn.textContent = 'Authenticating...';
        submitBtn.disabled = true;
      }

      // Live Render Backend API Authentication
      try {
        const baseUrl = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL) 
          ? API_CONFIG.BASE_URL 
          : 'https://afterhours-backend-i9nc.onrender.com/api';

        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailVal, password: passwordVal })
        });

        const data = await res.json();
        const realToken = data.token || data.session?.token || data.access_token;

        if (res.ok && realToken) {
          const userEmail = data.user?.email || data.email || emailVal;

          localStorage.setItem('token', realToken);
          localStorage.setItem('userEmail', userEmail);
          localStorage.setItem('afterhours_session', JSON.stringify({
            email: userEmail,
            authenticated: true,
            token: realToken
          }));

          window.location.href = 'dashboard.html';
          return;
        } else {
          if (errorMsg) {
            errorMsg.textContent = data.message || data.error || "Login Error: Invalid credentials.";
            errorMsg.classList.remove('hidden');
          }
        }
      } catch (err) {
        console.error('[AUTH ERROR]', err);
        if (errorMsg) {
          errorMsg.textContent = "Unable to connect to authentication server. Please try again.";
          errorMsg.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.textContent = 'Authenticate & Launch';
          submitBtn.disabled = false;
        }
      }
    });
  }
}

// Landing Page Interactive Simulator
function initDashboardSimulator() {
  const isDashboard = window.location.pathname.includes('dashboard.html');
  if (isDashboard) return;

  const feed = document.getElementById('activity-feed');
  const activities = [
    { time: 'Just now', text: 'Inbound call answered by Voice AI from +1 (555) 019-2831' },
    { time: '2s ago', text: 'Caller intake details & address logged' },
    { time: '14s ago', text: 'WhatsApp appointment confirmation dispatched' },
    { time: '1m ago', text: 'Synced lead entry to CRM' }
  ];

  if (feed) {
    feed.innerHTML = activities.map(a => `
      <div class="feed-row">
        <span>${a.text}</span>
        <span style="color:var(--text-muted);">${a.time}</span>
      </div>
    `).join('');
  }

  const btnSim = document.getElementById('btn-trigger-sim');
  const phoneInput = document.getElementById('sim-phone');
  
  if (btnSim && phoneInput) {
    btnSim.addEventListener('click', () => {
      const phoneVal = phoneInput.value.txt || phoneInput.value.trim() || '+1 (555) 019-2831';
      
      const valLeads = document.getElementById('val-leads');
      const valCalls = document.getElementById('val-calls');
      if (valLeads) {
        const curL = parseInt(valLeads.dataset.value || valLeads.textContent, 10) + 1;
        valLeads.dataset.value = curL;
        valLeads.textContent = curL;
      }
      if (valCalls) {
        const curC = parseInt(valCalls.dataset.value || valCalls.textContent, 10) + 1;
        valCalls.dataset.value = curC;
        valCalls.textContent = curC;
      }

      const simInbound = document.getElementById('sim-inbound-text');
      const simOutbound = document.getElementById('sim-outbound-text');
      if (simInbound) simInbound.textContent = `Inbound call received from ${phoneVal}`;
      if (simOutbound) simOutbound.textContent = `"Hello! Thanks for calling Apex Enterprises. I am your 24/7 AI Receptionist. I can answer your questions and book a consultation for you right now."`;

      if (coreMesh) {
        coreMesh.material.color.setHex(0x00f0ff);
        coreMesh.scale.set(1.35, 1.35, 1.35);
        setTimeout(() => {
          if (coreMesh) {
            coreMesh.material.color.setHex(0x3b82f6);
            coreMesh.scale.set(1.0, 1.0, 1.0);
          }
        }, 1200);
      }

      const newRow = document.createElement('div');
      newRow.className = 'feed-row';
      newRow.innerHTML = `<span>Inbound call answered from ${phoneVal}</span><span style="color:var(--cyan-accent);">Just now</span>`;
      if (feed) feed.prepend(newRow);
    });
  }
}

// Live Dashboard Metrics Fetcher for dashboard.html
async function initLiveDashboard() {
  const isDashboard = window.location.pathname.includes('dashboard.html');
  if (!isDashboard) return;

  const session = JSON.parse(localStorage.getItem('afterhours_session') || '{}');
  const token = localStorage.getItem('token') || session.token;
  const userEmail = localStorage.getItem('userEmail') || session.email || 'rangeshmishra9@gmail.com';

  try {
    const baseUrl = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL) 
      ? API_CONFIG.BASE_URL 
      : 'https://afterhours-backend-i9nc.onrender.com/api';

    const response = await fetch(`${baseUrl}/dashboard/data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || ''}`,
        'Content-Type': 'application/json',
        'x-user-email': userEmail
      }
    });

    if (!response.ok) return;

    const data = await response.json();

    if (data) {
      // 1. Subscription Overview
      if (data.subscription) {
        const planEl = document.getElementById('sub-plan') || document.querySelector('[data-sub-plan]');
        const cycleEl = document.getElementById('sub-cycle') || document.querySelector('[data-sub-cycle]');
        const daysEl = document.getElementById('sub-days') || document.querySelector('[data-sub-days]');
        const renewalEl = document.getElementById('sub-renewal') || document.querySelector('[data-sub-renewal]');
        const capacityEl = document.getElementById('sub-capacity') || document.querySelector('[data-sub-capacity]');
        const sidebarBadgeEl = document.getElementById('sub-sidebar-badge');
        const sidebarDaysEl = document.getElementById('sub-sidebar-days');

        if (planEl) planEl.textContent = data.subscription.plan_name;
        if (cycleEl) cycleEl.textContent = data.subscription.billing_cycle;
        if (daysEl) daysEl.textContent = `${data.subscription.days_remaining} Days Remaining`;
        if (renewalEl) renewalEl.textContent = data.subscription.renewal_date;
        if (capacityEl) capacityEl.textContent = data.subscription.capacity;
        if (sidebarBadgeEl) sidebarBadgeEl.textContent = data.subscription.plan_name;
        if (sidebarDaysEl) sidebarDaysEl.textContent = `${data.subscription.days_remaining} Days Remaining`;
      }

      // 2. Real-Time Credit Balance Rendering
      const creditVal = data.creditsBalance ?? (data.subscription ? data.subscription.credits_balance : 5000);
      
      const navCreditEl = document.getElementById('nav-credit-balance');
      const metricCreditEl = document.getElementById('metric-credit-balance');

      if (navCreditEl) navCreditEl.textContent = Number(creditVal).toLocaleString();
      if (metricCreditEl) {
        metricCreditEl.dataset.value = creditVal;
        metricCreditEl.dataset.started = "false";
        metricCreditEl.textContent = Number(creditVal).toLocaleString();
        animateCounter(metricCreditEl);
      }

      // 3. Metric Cards Update
      const cards = document.querySelectorAll('.metric-card');
      const interceptsList = (Array.isArray(data.recentIntercepts) && data.recentIntercepts.length > 0)
        ? data.recentIntercepts
        : (Array.isArray(data.logs) && data.logs.length > 0 ? data.logs : []);

      const totalLeadsCount = Array.isArray(data.leads) ? data.leads.length : (data.totalLeads || interceptsList.length || 0);
      const activeCallsCount = interceptsList.length || data.activeIntercepts || 0;

      const updateCardCount = (card, value) => {
        if (!card) return;
        const countEl = card.querySelector('.count-up') || card.querySelector('h2, h3, .metric-value, div');
        if (countEl && countEl.id !== 'metric-credit-balance') {
          countEl.dataset.value = value;
          countEl.dataset.started = "false";
          countEl.textContent = value;
          animateCounter(countEl);
        }
      };

      // Match remaining 4 KPI cards
      const otherCards = Array.from(cards).filter(c => !c.classList.contains('credit-balance-card'));
      if (otherCards[0]) updateCardCount(otherCards[0], totalLeadsCount);
      if (otherCards[1]) updateCardCount(otherCards[1], activeCallsCount);
      if (otherCards[2]) updateCardCount(otherCards[2], activeCallsCount);

      if (otherCards[3]) {
        const pipelineValEl = otherCards[3].querySelector('.count-up') || otherCards[3].querySelector('h2, h3, .metric-value, div');
        if (pipelineValEl) {
          const livePipelineValue = 0;
          pipelineValEl.dataset.prefix = "$";
          pipelineValEl.dataset.value = livePipelineValue;
          pipelineValEl.dataset.started = "false";
          pipelineValEl.textContent = "$" + livePipelineValue;
          animateCounter(pipelineValEl);
        }
      }

      // 4. Intercepts Log Table
      const logTbody = document.getElementById('intercept-log-tbody');
      if (logTbody) {
        if (interceptsList.length > 0) {
          logTbody.innerHTML = interceptsList.map(log => {
            let pillClass = 'state-secured-luxury';
            const outcome = (log.outcome || log.status || 'RECOVERED').toUpperCase();
            if (outcome.includes('BOOKING') || outcome.includes('SENT')) pillClass = 'state-sent-luxury';
            if (outcome.includes('PROCESS') || outcome.includes('ACTIVE')) pillClass = 'state-active-luxury';

            const timeDisplay = log.created_at 
              ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : (log.intercept_time || 'Just now');

            return `
              <tr>
                <td><strong>${log.contact || log.lead_contact || log.user_email || '+1 (555) 000-0000'}</strong></td>
                <td>${timeDisplay}</td>
                <td>${log.channels || 'WhatsApp + Email'}</td>
                <td><span class="status-pill ${pillClass}">${outcome}</span></td>
              </tr>
            `;
          }).join('');
        } else {
          logTbody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; color: #888; padding: 20px;">
                <em>No intercept logs recorded yet for this session.</em>
              </td>
            </tr>
          `;
        }
      }

      // 5. Populate Passbook Transaction History Table
      const ledgerTbody = document.getElementById('credits-ledger-tbody');
      if (ledgerTbody) {
        const transList = Array.isArray(data.creditTransactions) ? data.creditTransactions : [];
        if (transList.length > 0) {
          ledgerTbody.innerHTML = transList.map(tx => {
            const timeStr = tx.created_at 
              ? new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
              : 'Recent';

            return `
              <tr>
                <td>${timeStr}</td>
                <td><strong>${tx.action_type || 'USAGE'}</strong></td>
                <td>${tx.description || 'Service Execution'}</td>
                <td><strong style="color: #c59b27;">${tx.amount} Credits</strong></td>
              </tr>
            `;
          }).join('');
        } else {
          ledgerTbody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; color: #7a5c43; padding: 20px;">
                <em>No credit deductions recorded yet for this billing cycle.</em>
              </td>
            </tr>
          `;
        }
      }

      // 6. Dynamic Google Sheets Rendering
      if (data.sheets) {
        // Tab 2: Voice AI Call Intercept Logs
        const voiceTbody = document.getElementById('voice-logs-tbody');
        if (voiceTbody && Array.isArray(data.sheets.voice) && data.sheets.voice.length > 1) {
          const rows = data.sheets.voice.slice(1);
          voiceTbody.innerHTML = rows.map(r => `
            <tr>
              <td><strong>${r[0] || '+1 (555) 000-0000'}</strong></td>
              <td>${r[1] || '1m 00s'}</td>
              <td>${r[2] || 'Call summary intake logged'}</td>
              <td>${r[3] || 'Recently'}</td>
              <td><span class="status-pill state-secured-luxury">${r[4] || 'COMPLETED'}</span></td>
            </tr>
          `).join('');
        }

        // Tab 3: WhatsApp Interactive Dispatch Logs
        const waTbody = document.getElementById('whatsapp-logs-tbody');
        if (waTbody && Array.isArray(data.sheets.whatsapp) && data.sheets.whatsapp.length > 1) {
          const rows = data.sheets.whatsapp.slice(1);
          waTbody.innerHTML = rows.map(r => `
            <tr>
              <td><strong>${r[0] || '+1 (555) 000-0000'}</strong></td>
              <td>${r[1] || 'Booking Confirmation & Location Pin'}</td>
              <td>${r[2] || 'Just now'}</td>
              <td>${r[3] || 'Recently'}</td>
            </tr>
          `).join('');
        }

        // Tab 4: Automated Email Sequence Logs
        const emailTbody = document.getElementById('email-logs-tbody');
        if (emailTbody && Array.isArray(data.sheets.email) && data.sheets.email.length > 1) {
          const rows = data.sheets.email.slice(1);
          emailTbody.innerHTML = rows.map(r => `
            <tr>
              <td><strong>${r[0] || 'lead@domain.com'}</strong></td>
              <td>${r[1] || 'Appointment Booking Confirmation'}</td>
              <td><span class="status-pill state-secured-luxury">${r[2] || 'Confirmation Mail'}</span></td>
              <td>${r[3] || 'Just now'}</td>
            </tr>
          `).join('');
        }
      }

      // 7. Activity Feed Preview
      const feed = document.getElementById('activity-feed') || document.querySelector('.activity-log, .feed-container, .luxury-card-feed');
      if (feed && interceptsList.length > 0) {
        feed.innerHTML = interceptsList.map(log => `
          <div class="feed-row" style="display:flex; justify-content:space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span>${log.action || log.message || log.outcome || log.channels || 'Inquiry Logged'}</span>
            <span style="color:var(--text-muted, #888);">${log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Recent'}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('[LIVE DASHBOARD ERROR]', err);
  }
}

// Application Initializer
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCursor();
  initBackToTop();
  initScrollReveals();
  init3DTilt();
  init3D();
  initLoginModal();
  initMailtoFallback();
  initActivityRibbon();
  initSpeechToCRMSimulator();
  initExitIntentModal();
  initFAQAccordion();
  initCurrencySelector();
  initCalculator();
  initRevenueAuditExporter();
  initAudioVoicePlayer();
  initScriptCustomizer();
  initReactionGame();
  initRaSHChatbot();
  initProcessSwitcher();
  initTimeBanner();
  initIndustrySelector();
  initWorkflowAutoplay();

  const stepCards = document.querySelectorAll('.step-card');
  stepCards.forEach(card => {
    card.addEventListener('click', () => {
      userInterrupted = true;
      if (workflowInterval) clearInterval(workflowInterval);
      const step = parseInt(card.dataset.step, 10);
      setWorkflowStage(step, false);
    });
  });

  window.addEventListener('wheel', () => {
    userInterrupted = true;
  }, { passive: true });

  initDashboardSimulator();
  initLiveDashboard();
});
