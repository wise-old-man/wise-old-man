import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod'; // Assuming this is available and used correctly
import { z, ZodUnknown } from 'zod';

class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * @param prompt - The input that will be sent to the model.
   * @param systemInstruction - System message providing instructions for the AI on how to behave, example: Act as content moderator and..
   * @param expectedOutputFormat - Expected Zod type for validating the response format
   * @returns A parsed response in the expected format.
   */
  async makePrompt<T>(
    prompt: string,
    systemInstruction: string,
    expectedOutputFormat: z.ZodType<ZodUnknown, ZodUnknown>
  ): Promise<T> {
    const response = await this.openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: systemInstruction
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: zodResponseFormat(expectedOutputFormat, 'expected')
    });
    return response.choices[0].message.parsed as T;
  }
}

export default new OpenAiService();
