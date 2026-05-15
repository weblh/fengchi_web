import request from '../utils/request';

export interface ChatRequest {
  msg: string;
  model?: string;
}

export interface ChatResponse {
  content: string;
  model?: string;
}

export const aiService = {
  chat: async (msg: string, model: string = 'deepseek'): Promise<ChatResponse> => {
    const response = await request.get('/api/ai/chat', {
      msg,
      model,
    });
    return response;
  },

  chatStream: async function* (
    msg: string,
    model: string = 'deepseek',
    onToken?: (token: string) => void
  ): AsyncGenerator<string> {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/ai/chat/stream?msg=${encodeURIComponent(msg)}&model=${model}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('AI service error');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const token = line.slice(6);
          if (token === '[DONE]') return;
          if (onToken) onToken(token);
          yield token;
        }
      }
    }
  },
};

export default aiService;
