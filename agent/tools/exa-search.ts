import { tool } from '@openai/agents';
import { z } from 'zod';
import { exaSearch } from '../api/exa';

export const exaSearchTool = tool({
  name: 'exa_search',
  description:
    'Search the web for reports, articles, and documents using Exa search. Returns comprehensive search results with summaries and content.',
  parameters: z.object({
    query: z
      .string()
      .describe(
        'The search query to find relevant web content, reports, and articles'
      ),
  }),
  execute: async (params) => {
    const { query } = params;

    try {
      const results = await exaSearch(query);
      return results;
    } catch (error) {
      console.error('Error in Exa search:', error);
      throw new Error(
        `Failed to search web content: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },
});
