import { CreateRuleRequest, Rule, UpdateRule } from '../schemas';

const API_BASE_URL = '/api/internal/rules';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();

  if (result && typeof result === 'object' && 'success' in result) {
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    return result.data;
  } else {
    return result as T;
  }
}

export const rulesAPI = {
  async getRules(): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}`);
    return handleApiResponse<Rule[]>(response);
  },

  async getRule(id: string): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return handleApiResponse<Rule>(response);
  },

  async createRule(data: CreateRuleRequest): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<Rule>(response);
  },

  async deleteRule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return;
  },

  async updateRule(id: string, data: UpdateRule): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<Rule>(response);
  },
};
