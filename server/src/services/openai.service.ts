import { AsyncResult, complete, errored } from '@attio/fetchable';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async makePrompt<T>(
    model: string,
    prompt: string,
    systemInstruction: string,
    expectedOutputFormat: z.ZodType<T>
  ): AsyncResult<T, { code: 'INVALID_RESPONSE' }> {
    const response = await this.openai.beta.chat.completions.parse({
      model,
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

    if (response.choices.length === 0 || response.choices[0].message.parsed === null) {
      return errored({
        code: 'INVALID_RESPONSE'
      });
    }

    return complete(response.choices[0].message.parsed as T);
  }
}
