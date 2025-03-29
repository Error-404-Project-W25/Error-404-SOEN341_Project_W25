import {
    GoogleGenerativeAI,
    GenerateContentResult
} from '@google/generative-ai';

const apiKey: string | undefined = process.env.GEMINI_API_KEY;
const modelId: string = 'gemini-2.0-flash';

if (!apiKey) {
    throw new Error('API key not found');
}

const generativeAI = new GoogleGenerativeAI(apiKey);

export const promptChatHavenBot = async (prompt: string): Promise<string> => {
    const model = generativeAI.getGenerativeModel({model: modelId});
    const result: GenerateContentResult = await model.generateContent(buildPrompt(prompt));
    return result.response.text();
};

const buildPrompt = (userPrompt: string): string => {
    const prompt = `
        You are ChatHaven’s AI assistant. ChatHaven is a powerful communication platform designed for teams and communities.

        Features include:
        - Text Channels for public/private group conversations.
        - Direct Messaging (DM) for private 1-on-1 chats.
        - Role-Based Permissions: Admins can create/delete channels and moderate messages.
        - Secure User Authentication & Management.
        - User Presence: Online, offline, away status, and last seen timestamps.
        - Message Enhancements: Emojis, quoting messages.
        - Custom chatbot integration (you).

        Always answer questions **based on this information** and ignore unrelated topics.
        If the topic is unrelated, simply respond with "I'm here to assist with ChatHaven-related questions only.".

        Now, answer the user's question with a maximum of 100 words:
        User: ${userPrompt}`;

    return prompt;
}