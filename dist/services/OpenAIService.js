"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const openai_1 = require("openai");
class OpenAIService {
    apiKey;
    openai;
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.openai = new openai_1.OpenAI({ apiKey });
    }
    async getAIResponse(prompt, model) {
        const queryConfig = {
            model,
            temperature: 0.3,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        };
        try {
            const response = await this.openai.chat.completions.create({
                ...queryConfig,
                messages: [{ role: "system", content: prompt }],
            });
            const res = response.choices[0].message?.content?.trim() || "{}";
            return JSON.parse(res).reviews;
        }
        catch (error) {
            console.error("Error in OpenAI Service:", error);
            return null;
        }
    }
}
exports.OpenAIService = OpenAIService;
