/**
 * AfterHours Automation - Interactive WebGL 3D Engine, RaSH Assistant & Live API Integration
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

// Whitelisted Authorized Executive Emails & Temporary Password
const AUTHORIZED_EMAILS = [
  "rangeshmishra9@gmail.com",
  "mahmiasubham@gmail.com",
  "afterhoursautomation714@gmail.com"
];
const TEMP_PORTAL_PASSWORD = "after hours 2026";

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

// Time-of-Day Live Contextual Banner Logic
function initTimeBanner() {
  const banner = document.getElementById('time-banner');
  const icon = document.getElementById('time-icon');
  const text = document.getElementById('time-text');

  if (!banner || !text) return;

  const currentHour = new Date().getHours();

  if (currentHour >= 18 || currentHour < 8) {
    if (icon) icon.textContent = "🌙";
    text.textContent = `It is currently ${formatAMPM(new Date())}. Your office may be closed, but AfterHours RaSH is active recovering leads.`;
  } else {
    if (icon) icon.textContent = "⚡";
    text.textContent = `Peak outreach hours active (${formatAMPM(new Date())}). AfterHours RaSH intercepts overflow lead drops in under 7 seconds.`;
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

// 3-Currency Selector Logic ($ / € / ₹)
function initCurrencySelector() {
  const currBtns = document.querySelectorAll('.curr-btn');
  if (!currBtns.length) return;

  currBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeCurrency = btn.dataset.curr;
      activeSymbol = btn.dataset.symbol;

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
  const baseUsdVal = parseInt(valueRange.value, 10);

  const rate = currencyRates[activeCurrency] || 1;
  const convertedDealVal = Math.round(baseUsdVal * rate);

  if (dispCalls) dispCalls.textContent = `${calls} Inquiries`;
  if (dispValue) dispValue.textContent = `${activeSymbol}${convertedDealVal.toLocaleString()}`;

  const monthlyLeak = Math.round((calls * 4) * convertedDealVal * 0.5);

  resultVal.dataset.value = monthlyLeak;
  resultVal.dataset.prefix = activeSymbol;
  resultVal.dataset.started = "";
  animateCounter(resultVal);
}

function initCalculator() {
  const callsRange = document.getElementById('range-calls');
  const valueRange = document.getElementById('range-value');

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
}

// WhatsApp Script & Tone Customizer Logic
function initScriptCustomizer() {
  const bizInput = document.getElementById('cust-biz-name');
  const toneBtns = document.querySelectorAll('.tone-btn');
  const nameDisplay = document.getElementById('phone-contact-name');
  const scriptText = document.getElementById('whatsapp-script-text');

  if (!bizInput || !scriptText) return;

  const toneScripts = {
    friendly: (name) => `"Hi there! Thanks for reaching out to ${name}. We missed your inquiry, but we'd love to help! Tap here to pick a time or send us a quick note: [Booking Link]"`,
    executive: (name) => `"Thank you for contacting ${name}. An account executive is unavailable. Please select a priority callback window here: [Booking Link]"`,
    urgent: (name) => `"⚡ VIP Intercept: ${name} received your inquiry. For immediate emergency dispatch or priority intake, tap here now: [Booking Link]"`,
    luxury: (name) => `"Greetings from ${name}. We apologize for missing your inquiry. Allow us to reserve a private consultation for you: [Booking Link]"`
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

// "Human vs AI" Reaction Speed Game Logic
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

// RaSH Chatbot
function initRaSHChatbot() {
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const closeBtn = document.getElementById('ai-chat-close');
  const windowBox = document.getElementById('ai-chat-window');
  const container = document.getElementById('chat-msg-container');
  const input = document.getElementById('chat-user-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const chips = document.querySelectorAll('.chip-btn');

  if (!toggleBtn || !windowBox || !container) return;

  toggleBtn.addEventListener('click', () => {
    windowBox.classList.toggle('hidden');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      windowBox.classList.add('hidden');
    });
  }

  function appendUserMsg(text) {
    const msg = document.createElement('div');
    msg.className = 'user-chat-msg';
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function appendBotMsg(text) {
    const msg = document.createElement('div');
    msg.className = 'bot-chat-msg';
    msg.innerHTML = `<span class="bot-tag">RaSH</span><p>${text}</p>`;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function generateRaSHResponse(userText) {
    const query = userText.toLowerCase();

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bot-chat-msg';
    typingIndicator.innerHTML = `<span class="bot-tag">RaSH</span><p><em>RaSH is thinking...</em></p>`;
    container.appendChild(typingIndicator);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      container.removeChild(typingIndicator);

      let reply = "";

      if (query.includes('speed') || query.includes('time') || query.includes('fast') || query.includes('latency') || query.includes('seconds')) {
        reply = "Under 7 seconds flat. That's faster than your coffee maker can even think about brewing. While your competitors are still letting inquiries ring into the void, I'm already high-fiving your new leads on WhatsApp.";
      } else if (query.includes('crm') || query.includes('salesforce') || query.includes('hubspot') || query.includes('gohighlevel') || query.includes('integrate') || query.includes('webhook')) {
        reply = "We plug right into Salesforce, HubSpot, GoHighLevel, and custom Webhooks. No manual data entry, no spreadsheets—just clean, automated pipeline harmony.";
      } else if (query.includes('price') || query.includes('cost') || query.includes('demo') || query.includes('plan') || query.includes('pricing') || query.includes('tier')) {
        reply = "Our pricing scales smoothly with your outreach volume. But honestly, losing just *one* client to an unanswered inquiry probably costs more than our entire platform. Let's get you booked for a private demo via our email button!";
      } else if (query.includes('weekend') || query.includes('after hours') || query.includes('night') || query.includes('hours') || query.includes('closed')) {
        reply = "While you're sleeping, eating pizza, or binge-watching shows, I'm working 24/7/365. Because prospects don't care about operating hours—and neither do I.";
      } else if (query.includes('joke') || query.includes('funny') || query.includes('laugh')) {
        reply = "Why don't missed inquiries ever get promoted? Because they always get left hanging. 😂 Bad jokes aside, my lead recovery rate is no laughing matter—it's pure conversion gold.";
      } else if (query.includes('who are you') || query.includes('what are you') || query.includes('your name')) {
        reply = "I'm RaSH, your hyper-intelligent digital concierge. I turn missed inquiries into paying customers while making it look effortlessly cool.";
      } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        reply = "Hey there! Ready to stop letting prospect inquiries slip through your fingers and start printing revenue?";
      } else {
        reply = `That is a fascinating question: "${userText}". Honestly, my neural circuits didn't learn that in school, but I respect the curiosity! If you want to talk business or see how I can save your pipeline from leaking cash, click 'Book a Private Demo' below and let's chat!`;
      }

      appendBotMsg(reply);
    }, 900);
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    appendUserMsg(text);
    input.value = '';
    generateRaSHResponse(text);
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
      generateRaSHResponse(query);
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
      badge: "DENTAL & HEALTHCARE PROTOCOL",
      title: "Emergency & Consultation Immediate Recovery",
      desc: "When a patient reaches out with urgent inquiries after hours, AfterHours sends an instant WhatsApp triage link and automated morning appointment booking calendar.",
      rec: "$18,400",
      cond: "Unreturned outreach detected between 6:00 PM - 8:00 AM or during weekend closures.",
      msg: `"Hi! We noticed your inquiry at Apex Dental. If this is an urgent consultation or appointment request, tap here to pick an immediate slot: [Link]"`
    },
    hvac: {
      badge: "HVAC & HOME SERVICES MESH",
      title: "Breakdown & Dispatch Immediate Scheduling",
      desc: "AC unit breakdown or plumbing leak at night? Intercept panicked homeowners instantly before they call the next contractor on Google Search.",
      rec: "$24,200",
      cond: "Dropped inquiry on main dispatch line during peak weather emergency surges.",
      msg: `"Hi! Thanks for reaching out to Apex Climate Services. Need emergency repair or a technician visit? Tap here to confirm your address & dispatch slot: [Link]"`
    },
    banquet: {
      badge: "BANQUET & EVENT VENUE ROUTER",
      title: "High-Value Event Date & Intake Reservation",
      desc: "Wedding planners and corporate venue shoppers reach out to multiple halls simultaneously. Lock in date inquiries within 7 seconds before competing venues reply.",
      rec: "$42,000",
      cond: "Inbound inquiry missed during ongoing evening wedding banquets or weekend galas.",
      msg: `"Greetings from Grand Palace Banquets! We missed your inquiry regarding hall availability. Tap to download our luxury brochure & reserve a tour date: [Link]"`
    },
    realestate: {
      badge: "REAL ESTATE & LEGAL VAULT",
      title: "Property Viewing & Consultation Intake",
      desc: "High-net-worth buyers expect instant answers. Automatically dispatch virtual property walkthroughs and calendar scheduling links directly inside WhatsApp.",
      rec: "$35,000",
      cond: "Unanswered listing inquiry outside standard firm operating hours.",
      msg: `"Hi! Thanks for reaching out to Prime Realty. To view property floor plans or schedule a private walkthrough, tap to select your preferred time: [Link]"`
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

// Intersection Observer for Smooth Scroll Reveals
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

// Smooth Dynamic Counter Animation
function animateCounter(element) {
  if (element.dataset.started) return;
  element.dataset.started = "true";

  const target = parseFloat(element.dataset.value);
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
    if (switchDesc) switchDesc.textContent = "Inquiry drops → Wait 12+ hours for manual staff callback → Prospect already contacted competitor → Deal lost permanently.";
    if (valTime) { valTime.textContent = "> 12 Hours"; valTime.className = "s-val text-red"; }
    if (valRate) { valRate.textContent = "12.4%"; valRate.className = "s-val text-red"; }
    if (valLeak) { valLeak.textContent = "87.6%"; valLeak.className = "s-val text-red"; }
  });

  tabAfter.addEventListener('click', () => {
    tabAfter.classList.add('active');
    tabBefore.classList.remove('active');

    if (switchBadge) switchBadge.textContent = "AFTERHOURS RECOVERY PIPELINE";
    if (switchTitle) switchTitle.textContent = "Sub-10 Second Multi-Channel Intercept";
    if (switchDesc) switchDesc.textContent = "Inquiry drops → Trigger fires in 800ms → Personalized WhatsApp & booking calendar sent → Appointment confirmed & synced to CRM.";
    if (valTime) { valTime.textContent = "< 7s"; valTime.className = "s-val text-cyan"; }
    if (valRate) { valRate.textContent = "98.4%"; valRate.className = "s-val text-cyan"; }
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

// Non-intrusive Workflow Sequence triggered ONLY when section is in view
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

// Login Modal with Integrated Live Render API & Fallback
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
        submitBtn.textContent = 'Authenticating Executive Mesh...';
        submitBtn.disabled = true;
      }

      // 1. Try Live Render API Login
      try {
        const baseUrl = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL) 
          ? API_CONFIG.BASE_URL 
          : 'https://afterhours-backend-i9nc.onrender.com/api';

        const res = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailVal, password: passwordVal })
        });

        const data = await res.json();

        if (res.ok && (data.token || data.session?.token)) {
          const realToken = data.token || data.session.token;

          localStorage.setItem('token', realToken);
          localStorage.setItem('afterhours_session', JSON.stringify({
            email: emailVal,
            authenticated: true,
            token: realToken
          }));

          window.location.href = 'dashboard.html';
          return;
        } else {
          throw new Error(data.message || data.error || 'Login failed');
        }
      } catch (err) {
        console.warn('[AUTH] Live API login error:', err.message);
        if (errorMsg) {
          errorMsg.textContent = `Login Error: ${err.message}`;
          errorMsg.classList.remove('hidden');
        }
        if (submitBtn) {
          submitBtn.textContent = 'Login';
          submitBtn.disabled = false;
        }
        return;
      }
    });
  }
}

// Landing Page Interactive Simulator
function initDashboardSimulator() {
  const feed = document.getElementById('activity-feed');
  const activities = [
    { time: 'Just now', text: 'Missed inquiry from +1 (555) 019-2831' },
    { time: '2s ago', text: 'WhatsApp intro message dispatched' },
    { time: '14s ago', text: 'Lead booked consultation slot' },
    { time: '1m ago', text: 'Synced lead entry to Salesforce CRM' }
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
      if (simInbound) simInbound.textContent = `Missed inquiry logged from ${phoneVal}`;
      if (simOutbound) simOutbound.textContent = `"Hi! We missed your inquiry from ${phoneVal}. Tap here to confirm a callback slot: [Link]"`;

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
      newRow.innerHTML = `<span>Missed inquiry from ${phoneVal}</span><span style="color:var(--cyan-accent);">Just now</span>`;
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

  try {
    const baseUrl = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL) 
      ? API_CONFIG.BASE_URL 
      : 'https://afterhours-backend-i9nc.onrender.com/api';

    const response = await fetch(`${baseUrl}/dashboard/data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || ''}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return;

    const data = await response.json();
    console.log('[LIVE DASHBOARD DATA]', data);

    if (data) {
      const valLeads = document.getElementById('val-leads') || document.querySelector('[data-metric="total-leads"]');
      const valCalls = document.getElementById('val-calls') || document.querySelector('[data-metric="active-calls"]');
      
      if (valLeads && data.totalLeads !== undefined) valLeads.textContent = data.totalLeads;
      if (valCalls && data.activeIntercepts !== undefined) valCalls.textContent = data.activeIntercepts;
    }
  } catch (err) {
    console.error('[LIVE DASHBOARD ERROR]', err);
  }
}

// Initialize Application Modules
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCursor();
  initBackToTop();
  initScrollReveals();
  init3DTilt();
  init3D();
  initLoginModal();
  initCurrencySelector();
  initCalculator();
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
