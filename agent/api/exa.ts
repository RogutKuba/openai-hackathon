import dotenv from 'dotenv';
import { Exa } from 'exa-js';

dotenv.config();

export const exaSearch = async (query: string) => {
  const exa = new Exa(process.env.EXA_API_KEY);
  const response = await exa.searchAndContents(query, {
    summary: true,
  });
  return response.results;
};
