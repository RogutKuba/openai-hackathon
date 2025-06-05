import { tool } from '@openai/agents';
import z from 'zod';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

export const fredBaseCategorySearchTool = tool({
  name: 'fred_base_category_search',
  description:
    'Search the FRED database for the most relevant base categories for a given topic',
  parameters: z.object({}),
  execute: async () => {
    return FRED_BASE_CATEGORY_OPTIONS;
  },
});

export const fredSubCategorySearchTool = tool({
  name: 'fred_sub_category_search',
  description:
    'Search the FRED database for the most relevant subcategories for a given base category',
  parameters: z.object({
    baseCategoryId: z.string().describe('The base category to search for'),
  }),
  execute: async (params) => {
    const { baseCategoryId } = params;

    const response = await callFredAPI(
      `categories/children?category_id=${baseCategoryId}`
    );

    return response;
  },
});

export const FRED_BASE_CATEGORY_OPTIONS = [
  {
    id: '32991',
    name: 'Money, Banking, & Finance',
    children: [
      { id: 22, name: 'Interest Rates', parent_id: 32991 },
      { id: 15, name: 'Exchange Rates', parent_id: 32991 },
      { id: 24, name: 'Monetary Data', parent_id: 32991 },
      { id: 46, name: 'Financial Indicators', parent_id: 32991 },
      { id: 23, name: 'Banking', parent_id: 32991 },
      { id: 32360, name: 'Business Lending', parent_id: 32991 },
      {
        id: 32145,
        name: 'Foreign Exchange Intervention',
        parent_id: 32991,
      },
    ],
  },
  {
    id: '10',
    name: 'Population, Employment, & Labor Markets',
    children: [
      {
        id: 12,
        name: 'Current Population Survey (Household Survey)',
        parent_id: 10,
      },
      {
        id: 11,
        name: 'Current Employment Statistics (Establishment Survey)',
        parent_id: 10,
      },
      { id: 32250, name: 'ADP Employment', parent_id: 10 },
      { id: 33500, name: 'Education', parent_id: 10 },
      { id: 33001, name: 'Income Distribution', parent_id: 10 },
      {
        id: 32241,
        name: 'Job Openings and Labor Turnover (JOLTS)',
        parent_id: 10,
      },
      { id: 33509, name: 'Labor Market Conditions', parent_id: 10 },
      { id: 104, name: 'Population', parent_id: 10 },
      { id: 2, name: 'Productivity & Costs', parent_id: 10 },
      { id: 33831, name: 'Minimum Wage', parent_id: 10 },
      { id: 32240, name: 'Weekly Initial Claims', parent_id: 10 },
      { id: 33731, name: 'Tax Data', parent_id: 10 },
    ],
  },
  {
    id: '32992',
    name: 'National Accounts',
    children: [
      { id: 18, name: 'National Income & Product Accounts', parent_id: 32992 },
      { id: 5, name: 'Federal Government Debt', parent_id: 32992 },
      { id: 32251, name: 'Flow of Funds', parent_id: 32992 },
      {
        id: 13,
        name: 'U.S. Trade & International Transactions',
        parent_id: 32992,
      },
    ],
  },
  {
    id: '1',
    name: 'Production & Business Activity',
    children: [
      {
        id: 32262,
        name: 'Business Cycle Expansions & Contractions',
        parent_id: 1,
      },
      {
        id: 33936,
        name: 'Business Surveys',
        parent_id: 1,
      },
      {
        id: 32436,
        name: 'Construction',
        parent_id: 1,
      },
      {
        id: 33940,
        name: 'Emissions',
        parent_id: 1,
      },
      {
        id: 33955,
        name: 'Expenditures',
        parent_id: 1,
      },
      {
        id: 33490,
        name: 'Finance Companies',
        parent_id: 1,
      },
      {
        id: 32216,
        name: 'Health Insurance',
        parent_id: 1,
      },
      {
        id: 97,
        name: 'Housing',
        parent_id: 1,
      },
      {
        id: 3,
        name: 'Industrial Production & Capacity Utilization',
        parent_id: 1,
      },
      {
        id: 32429,
        name: 'Manufacturing',
        parent_id: 1,
      },
      {
        id: 33959,
        name: 'Patents',
        parent_id: 1,
      },
      {
        id: 6,
        name: 'Retail Trade',
        parent_id: 1,
      },
      {
        id: 33441,
        name: 'Services',
        parent_id: 1,
      },
      {
        id: 33492,
        name: 'Technology',
        parent_id: 1,
      },
      {
        id: 33202,
        name: 'Transportation',
        parent_id: 1,
      },
      {
        id: 33203,
        name: 'Wholesale Trade',
        parent_id: 1,
      },
    ],
  },
  {
    id: '32455',
    name: 'Prices',
    children: [
      {
        id: 32217,
        name: 'Commodities',
        parent_id: 32455,
      },
      {
        id: 9,
        name: 'Consumer Price Indexes (CPI and PCE)',
        parent_id: 32455,
      },
      {
        id: 33913,
        name: 'Cryptocurrencies',
        parent_id: 32455,
      },
      {
        id: 4,
        name: 'Employment Cost Index',
        parent_id: 32455,
      },
      {
        id: 33717,
        name: 'Health Care Indexes',
        parent_id: 32455,
      },
      {
        id: 32261,
        name: 'House Price Indexes',
        parent_id: 32455,
      },
      {
        id: 31,
        name: 'Producer Price Indexes (PPI)',
        parent_id: 32455,
      },
      {
        id: 32220,
        name: 'Trade Indexes',
        parent_id: 32455,
      },
    ],
  },
  {
    id: '32263',
    name: 'International Data',
    children: [
      {
        id: 32264,
        name: 'Countries',
        parent_id: 32263,
      },
      {
        id: 32955,
        name: 'Geography',
        parent_id: 32263,
        notes:
          'This category contains both data aggregated for a specific geographic region and a way to find country categories based upon geographic region.',
      },
      {
        id: 32265,
        name: 'Indicators',
        parent_id: 32263,
      },
      {
        id: 32956,
        name: 'Institutions',
        parent_id: 32263,
        notes:
          'This category contains data aggregated for multinational institutions and a way to find country series by membership to institutions.',
      },
    ],
  },
  {
    id: '3008',
    name: 'U.S. Regional Data',
    children: [
      {
        id: 27281,
        name: 'States',
        parent_id: 3008,
      },
      {
        id: 32043,
        name: 'Census Regions',
        parent_id: 3008,
      },
      {
        id: 32061,
        name: 'BEA Regions',
        parent_id: 3008,
      },
      {
        id: 32849,
        name: 'BLS Regions',
        parent_id: 3008,
      },
      {
        id: 32071,
        name: 'Federal Reserve Districts',
        parent_id: 3008,
      },
      {
        id: 32233,
        name: 'Freddie Mac Regions',
        parent_id: 3008,
      },
    ],
  },
  {
    id: '33060',
    name: 'Academic Data',
    children: [
      {
        id: 33833,
        name: 'Banking and Monetary Statistics, 1914-1941',
        parent_id: 33060,
        notes:
          "This data is from the Board of Governors' Banking and Monetary Statistics 1914-1941 publication.",
      },
      {
        id: 33951,
        name: 'Daily Federal Funds Rate, 1928-54',
        parent_id: 33060,
      },
      {
        id: 33825,
        name: 'Data on the nominal term structure model from Kim and Wright',
        parent_id: 33060,
      },
      {
        id: 33891,
        name: 'Historical Federal Reserve Data',
        parent_id: 33060,
      },
      {
        id: 33061,
        name: 'NBER Macrohistory Database',
        parent_id: 33060,
      },
      {
        id: 33100,
        name: 'Penn World Table 7.1',
        parent_id: 33060,
      },
      {
        id: 33402,
        name: 'Penn World Table 9.0',
        parent_id: 33060,
      },
      {
        id: 33120,
        name: 'Recession Probabilities',
        parent_id: 33060,
      },
      {
        id: 33123,
        name: 'Weekly U.S. and State Bond Prices, 1855-1865',
        parent_id: 33060,
      },
      {
        id: 33201,
        name: 'Economic Policy Uncertainty',
        parent_id: 33060,
      },
      {
        id: 33442,
        name: 'Sticky Wages and Comovement',
        parent_id: 33060,
      },
      {
        id: 33839,
        name: 'A Millennium of Macroeconomic Data for the UK',
        parent_id: 33060,
      },
      {
        id: 33934,
        name: 'New England Textile Industry, 1815-1860',
        parent_id: 33060,
      },
      {
        id: 34000,
        name: 'The Effects of the 1930s HOLC "Redlining" Maps',
        parent_id: 33060,
      },
    ],
  },
];

const FRED_API_KEY = process.env.FRED_API_KEY;
if (!FRED_API_KEY) {
  throw new Error('FRED_API_KEY is not set');
}

export async function callFredAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(
    `https://api.stlouisfed.org/fred/${endpoint}&api_key=${FRED_API_KEY}&file_type=json`,
    {
      method: 'GET',
    }
  );
  return response.json();
}
