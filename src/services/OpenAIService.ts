import { OpenAI } from "openai";

export class OpenAIService {
  private openai: OpenAI;

  constructor(private apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async getAIPullRequestResponse(prompt: string, model: string): Promise<Array<{ lineNumber: string; reviewComment: string; }> | null> {
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
    } catch (error) {
      console.error("Error in OpenAI Service:", error);
      return null;
    }
  }

  async getAIPullRequestCommentResponse(prompt: string, model: string): Promise<string> {
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

      const res = response.choices[0].message?.content?.trim() || "";
      return res;
    } catch (error) {
      console.error("Error in OpenAI Service:", error);
      return "I'm sorry, I couldn't generate a response at this time.";
    }
  }
}
