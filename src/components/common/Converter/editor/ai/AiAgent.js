import axios from 'axios';

export function createConversation(config) {
    const client = axios.create({
        baseURL: config.baseURL,
        headers: { 'Authorization': `Bearer ${config.secretKey}` }
    });

    const messages = [];
    let abortController = null;
    return {
        config: config,
        system: message => {
            messages.push({ role: 'system', content: message });
        },
        user: message => {
            messages.push({ role: 'user', content: message });
        },
        chat: async () => {
            // Cancel any existing request
            if (abortController) {
                abortController.abort();
            }
            abortController = new AbortController();

            try {
                const response = await client.post("/chat/completions", 
                    { model: config.model, messages },
                    { signal: abortController.signal }
                );
                const content = response.data.choices[0].message.content;
                messages.push({ role: 'assistant', content });
                return { content };
            } finally {
                abortController = null;
            }
        },
        cancel: () => {
            if (abortController) {
                abortController.abort();
                abortController = null;
            }
        },
        isEmpty: () => messages.length === 0,
        clear: () => messages.length = 0
    }
}

export function isCancelError(error) {
    return error.name === "CanceledError";
}