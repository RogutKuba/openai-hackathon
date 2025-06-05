import { z } from 'zod';
import { tool } from '@openai/agents';
import { DuckDBConnection } from '@duckdb/node-api';
import { readFileSync } from 'fs';

export const dataAnalysisTool = tool({
  name: 'data_analysis',
  description:
    'Load CSV data using DuckDB and perform SQL queries for analysis and insights. Ensure to load the data from the CSV file using DuckDB. Example: "SELECT * FROM \'flights.csv\'"',
  parameters: z.object({
    // csvPath: z
    //   .string()
    //   .describe('Path to CSV file to load (relative to project root)'),
    query: z.string().describe('SQL query to execute on the data using DuckDB'),
  }),
  execute: async (params) => {
    const { query } = params;

    // const instance = await DuckDBInstance.create('my_duckdb.db');
    const connection = await DuckDBConnection.create();

    const reader = await connection.runAndReadAll(query);
    const result = reader.getRowObjectsJson();

    return result;
  },
});

export const testduckdb = async () => {
  const connection = await DuckDBConnection.create();

  const reader = await connection.runAndReadAll(`SELECT 
    MIN(period_start_date) AS first_date,
    MAX(period_start_date) AS last_date,
    COUNT(*) AS num_observations,
    AVG(CAST(USSLIND AS DOUBLE)) AS avg_value,
    MIN(CAST(USSLIND AS DOUBLE)) AS min_value,
    MAX(CAST(USSLIND AS DOUBLE)) AS max_value,
    STDDEV(CAST(USSLIND AS DOUBLE)) AS stddev_value
  FROM '/Users/kubarogut/Documents/Projects/codeinterview/test-agents/data/fred/latest-1749085033330.json/USSLIND/obs._by_real-time_period.csv';`);

  const result = reader.getRowObjectsJson();
  return result;
};

export const getCsvFormat = tool({
  name: 'get_csv_format',
  description:
    'Get the format of a CSV file. Returns the headers and first 2 rows of the data.',
  parameters: z.object({
    csvPath: z
      .string()
      .describe('Path to CSV file to load (relative to project root)'),
  }),
  execute: async (params) => {
    const { csvPath } = params;

    const csvData = readFileSync(csvPath, 'utf8');
    const headers = csvData.split('\n')[0].split(',');
    const data = csvData
      .split('\n')
      .slice(1)
      .map((row) => row.split(','));
    return { headers, data };
  },
});
