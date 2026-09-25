// Typed API Client for Anchor Backend

const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('anchor_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('anchor_auth_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('anchor_auth_token');
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      errMsg = errData.error || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json();
}

// ── Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },
  register: async (payload: { name: string; email: string; businessName: string; password: string; phone?: string }) => {
    const data = await apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(data.token);
    return data;
  },
  getMe: () => apiRequest('/auth/me'),
  getTeam: () => apiRequest('/auth/team'),
  updateOrg: (payload: any) =>
    apiRequest('/auth/org', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// ── Leads API
export const leadsApi = {
  getLeads: (params?: { status?: string; tag?: string; search?: string; ctwa?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.tag) q.append('tag', params.tag);
    if (params?.search) q.append('search', params.search);
    if (params?.ctwa !== undefined) q.append('ctwa', String(params.ctwa));
    return apiRequest(`/leads?${q.toString()}`);
  },
  getLead: (id: string) => apiRequest(`/leads/${id}`),
  createLead: (payload: any) =>
    apiRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateLead: (id: string, payload: any) =>
    apiRequest(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  bulkUpdate: (leadIds: string[], action: 'STATUS' | 'ASSIGN', value: string) =>
    apiRequest('/leads/bulk', {
      method: 'POST',
      body: JSON.stringify({ leadIds, action, value }),
    }),
};

// ── Messages API
export const messagesApi = {
  getMessages: (leadId: string) => apiRequest(`/messages/${leadId}`),
  sendMessage: (leadId: string, text: string, templateId?: string) =>
    apiRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ leadId, text, templateId }),
    }),
};

// ── Auto-Reply & Intent API
export const autoReplyApi = {
  getRules: () => apiRequest('/auto-replies'),
  createRule: (rule: any) =>
    apiRequest('/auto-replies', {
      method: 'POST',
      body: JSON.stringify(rule),
    }),
  updateRule: (id: string, updates: any) =>
    apiRequest(`/auto-replies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteRule: (id: string) =>
    apiRequest(`/auto-replies/${id}`, {
      method: 'DELETE',
    }),
};

// ── Templates API
export const templatesApi = {
  getTemplates: () => apiRequest('/templates'),
  createTemplate: (template: any) =>
    apiRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    }),
};

// ── Drip API
export const dripApi = {
  getSequences: () => apiRequest('/drip/sequences'),
  createSequence: (payload: { name: string; steps: any[] }) =>
    apiRequest('/drip/sequences', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSequence: (id: string, updates: any) =>
    apiRequest(`/drip/sequences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  enrollLeads: (sequenceId: string, leadIds: string[]) =>
    apiRequest('/drip/enroll', {
      method: 'POST',
      body: JSON.stringify({ sequenceId, leadIds }),
    }),
};

// ── Commerce & Payments API
export const commerceApi = {
  getFlows: () => apiRequest('/commerce/flows'),
  createFlow: (flow: any) =>
    apiRequest('/commerce/flows', {
      method: 'POST',
      body: JSON.stringify(flow),
    }),
  getPayments: () => apiRequest('/commerce/payments'),
  createPaymentLink: (payload: { leadId: string; amountINR: number; description?: string; paymentMethod?: string }) =>
    apiRequest('/commerce/payments/create-link', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  simulatePaymentSuccess: (paymentId: string) =>
    apiRequest('/commerce/payments/simulate-success', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),
};

// ── Routing & SLA API
export const routingApi = {
  getRules: () => apiRequest('/routing/rules'),
  createRule: (rule: any) =>
    apiRequest('/routing/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    }),
  updateRule: (id: string, updates: any) =>
    apiRequest(`/routing/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getSLA: () => apiRequest('/routing/sla'),
  updateSLA: (updates: any) =>
    apiRequest('/routing/sla', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getAgents: () => apiRequest('/routing/agents'),
  updateAgentStatus: (id: string, isOnline: boolean) =>
    apiRequest(`/routing/agents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isOnline }),
    }),
};

// ── Analytics API
export const analyticsApi = {
  getKPIs: () => apiRequest('/analytics/kpis'),
  getLeakage: () => apiRequest('/analytics/leakage'),
  getLeaderboard: () => apiRequest('/analytics/leaderboard'),
  getCosts: () => apiRequest('/analytics/costs'),
  getExecutiveReport: () => apiRequest('/analytics/executive-report'),
};

// ── Simulator API
export const simulatorApi = {
  sendInbound: (payload: {
    name?: string;
    phone?: string;
    message: string;
    isCtwa?: boolean;
    adHeadline?: string;
  }) =>
    apiRequest('/simulator/send-inbound', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
