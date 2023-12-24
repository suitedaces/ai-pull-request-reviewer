import { OpenAI } from "openai";

export class OpenAIService {
  private openai: OpenAI;

  constructor(private apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async getAIResponse(prompt: string, model: string): Promise<Array<{ lineNumber: string; reviewComment: string; }> | null> {
    const queryConfig = {
      model,

  }
}
