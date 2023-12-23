import OpenAI from "openai";

export class OpenAIService {
  private openai: OpenAI;

  constructor(private apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async getAIResponse(prompt: string, model: string): Promise<Array<{ lineNumber: string; reviewComment: string; }> | null> {
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
}
