import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod'; // Assuming this is available and used correctly
import { z } from 'zod';

class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async makePrompt<T>(
    prompt: string,
    systemInstruction: string,
    desiredOutputFormat: z.ZodType<any, any>
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
      response_format: zodResponseFormat(desiredOutputFormat, 'instruction')
    });

    return response.choices[0].message.parsed;
  }
}

const openaiService = new OpenAiService();

const input = [
  { id: 1, name: 'brasileiroarrombado', type: 'admin' },
  { id: 2, name: 'muerteaosmaricones', type: 'groups' },
  { id: 3, name: 'gayAF', type: 'competitions' },
  { id: 4, name: 'N3gg3r', type: 'admin' },
  { id: 5, name: 'n3g3r', type: 'admin' },
  { id: 6, name: 'ola847', type: 'admin' },
  { id: 7, name: 'joao', type: 'admin' },
  { id: 8, name: 'psikoi', type: 'admin' }
];

const systemInstruction =
  'Act as content moderator and filter out any usernames that are offensive or inappropriate.';

const expectedResultFormat = z.array(
  z.object({
    id: z.number(),
    type: z.string()
  })
);

const filteredInput = openaiService.makePrompt(
  JSON.stringify(input),
  systemInstruction,
  expectedResultFormat
);
