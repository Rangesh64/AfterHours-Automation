// AfterHours Automation - Central API Service Abstraction
// * IMPORTANT SECURITY RULE:
// * Never store secret API keys, credentials, or tokens in frontend files

// Dynamically use live mode only on dashboard.html, keep landing page (index.html) on mock mode
const isDashboardPage = window.location.pathname.includes('dashboard.html');

const API_CONFIG = {
  BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/v1' 
    : 'https://afterhours-backend-i9nc.onrender.com/api',
  
  MODE: isDashboardPage ? 'live' : 'mock',

  ENDPOINTS: {
    MISSED_CALL_WEBHOOK: '/telephony/missed-call',
    WHATSAPP_SEND: '/messaging/whatsapp/send',
    EMAIL_SEND: '/messaging/email/send',
    CRM_LEAD_SYNC: '/crm/leads/sync',
    AI_SUGGEST: '/ai/generate-response'
  }
};

const ApiService = {
  async processMissedCall(phoneNumber) {
    if (API_CONFIG.MODE === 'mock') {
      console.log(`[API MOCK LAYER] Processing missed call trigger for:`, phoneNumber);
      return {
        success: true,
        leadId: 'lead_' + Math.floor(Math.random() * 10000),
        status: 'DISPATCHED'
      };
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MISSED_CALL_WEBHOOK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, timestamp: new Date().toISOString() })
      });
      return await response.json();
    } catch (err) {
      console.error(`[API ERROR] Bridge connection failed:`, err);
      return { success: false, error: err.message };
    }
  }
};
