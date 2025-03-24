import axios from 'axios';

export function createConversation(config) {
    const client = axios.create({
        baseURL: config.baseURL,
        headers: { 'Authorization': `Bearer ${config.secretKey}` }
    });

    const messages = [];
    return {
        config: config,
        system: message => {
            messages.push({ role: 'system', content: message });
        },
        user: message => {
            messages.push({ role: 'user', content: message });
        },
        chat: async () => {
            const response = await client.post("/chat/completions", { model: config.model, messages });
            const content = response.data.choices[0].message.content;
            messages.push({ role: 'assistant', content });
            return { content };
        },
        isEmpty: () => messages.length === 0,
        clear: () => messages.length = 0
    }
}