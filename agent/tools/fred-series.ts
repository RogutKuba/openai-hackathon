import { tool } from '@openai/agents';
import { z } from 'zod';
import { callFredAPI } from './fred-search';

export const getFredSeriesForCategoryTool = tool({
  name: 'get_series_for_category',
  description:
    'Get all series for a given category from FRED (Federal Reserve Economic Data). Returns economic data series with comprehensive filtering and sorting options.',
  parameters: z.object({
    categoryId: z.string().describe('The category ID to get series for'),
    // realtimeStart: z
    //   .string()
    //   .optional()
    //   .nullable()
    //   .describe(
    //     "Start of real-time period (YYYY-MM-DD format). Defaults to today's date for latest data."
    //   ),
    // realtimeEnd: z
    //   .string()
    //   .optional()
    //   .nullable()
    //   .describe(
    //     "End of real-time period (YYYY-MM-DD format). Defaults to today's date for latest data."
    //   ),
    limit: z
      .number()
      .min(1)
      .max(1000)
      .nullable()
      .default(100)
      .describe(
        'Maximum number of results to return (1-1000). Default 100 for analyst efficiency.'
      ),
    offset: z
      .number()
      .min(0)
      .nullable()
      .default(0)
      .describe('Number of results to skip (for pagination)'),
    orderBy: z
      .enum([
        'series_id',
        'title',
        'units',
        'frequency',
        'seasonal_adjustment',
        'realtime_start',
        'realtime_end',
        'last_updated',
        'observation_start',
        'observation_end',
        'popularity',
        'group_popularity',
      ])
      .nullable()
      .default('popularity')
      .describe(
        'Order results by specified attribute. Default is popularity for most relevant series first.'
      ),
    sortOrder: z
      .enum(['asc', 'desc'])
      .nullable()
      .default('desc')
      .describe('Sort order. Default desc to get most popular/recent first.'),
    // filterVariable: z
    //   .enum(['frequency', 'units', 'seasonal_adjustment'])
    //   .optional()
    //   .nullable()
    //   .describe('Attribute to filter results by'),
    // filterValue: z
    //   .string()
    //   .optional()
    //   .nullable()
    //   .describe('Value of the filter_variable to filter by'),
    // tagNames: z
    //   .string()
    //   .optional()
    //   .nullable()
    //   .describe(
    //     'Semicolon-delimited list of tag names that series must match all of (e.g., "income;bea")'
    //   ),
    // excludeTagNames: z
    //   .string()
    //   .optional()
    //   .nullable()
    //   .describe(
    //     'Semicolon-delimited list of tag names that series must match none of (requires tagNames to be set)'
    //   ),
  }),
  execute: async (params) => {
    const {
      categoryId,
      // realtimeStart,
      // realtimeEnd,
      limit = 100,
      offset = 0,
      orderBy = 'popularity',
      sortOrder = 'desc',
      // filterVariable,
      // filterValue,
      // tagNames,
      // excludeTagNames,
    } = params;

    // Build query string
    let query = `category/series?category_id=${categoryId}`;

    // Add optional parameters
    // if (realtimeStart) query += `&realtime_start=${realtimeStart}`;
    // if (realtimeEnd) query += `&realtime_end=${realtimeEnd}`;
    query += `&limit=${limit}`;
    query += `&offset=${offset}`;
    query += `&order_by=${orderBy}`;
    query += `&sort_order=${sortOrder}`;

    // if (filterVariable && filterValue) {
    //   query += `&filter_variable=${filterVariable}&filter_value=${filterValue}`;
    // }
    // if (tagNames) query += `&tag_names=${tagNames}`;
    // if (excludeTagNames) query += `&exclude_tag_names=${excludeTagNames}`;

    // console.log('query', query);

    const response = await callFredAPI<FredSeriesResponse>(query);
    return response;
  },
});

interface FredSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  series: FredSeries[];
}

interface FredSeries {
  id: string;
  realtime_start: string;
  realtime_end: string;
  title: string;
  observation_start: string;
  observation_end: string;
  frequency: string;
  frequency_short: string;
  units: string;
  units_short: string;
  seasonal_adjustment: string;
  seasonal_adjustment_short: string;
  last_updated: string;
  popularity: number;
  group_popularity: number;
  notes: string;
}

export const getFredSeriesForCategory = async (params: {
  category_id: number;
  realtime_start?: string;
  realtime_end?: string;
  limit?: number;
  offset?: number;
  order_by?:
    | 'series_id'
    | 'title'
    | 'units'
    | 'frequency'
    | 'seasonal_adjustment'
    | 'realtime_start'
    | 'realtime_end'
    | 'last_updated'
    | 'observation_start'
    | 'observation_end'
    | 'popularity'
    | 'group_popularity';
  sort_order?: 'asc' | 'desc';
  filter_variable?: 'frequency' | 'units' | 'seasonal_adjustment';
  filter_value?: string;
  tag_names?: string;
  exclude_tag_names?: string;
}) => {
  let query = `series/search?category_id=${params.category_id}`;
  if (params.realtime_start)
    query += `&realtime_start=${params.realtime_start}`;
  if (params.realtime_end) query += `&realtime_end=${params.realtime_end}`;
  if (params.limit) query += `&limit=${params.limit}`;
  if (params.offset) query += `&offset=${params.offset}`;
  if (params.order_by) query += `&order_by=${params.order_by}`;
  if (params.sort_order) query += `&sort_order=${params.sort_order}`;
  if (params.filter_variable && params.filter_value)
    query += `&filter_variable=${params.filter_variable}&filter_value=${params.filter_value}`;
  if (params.tag_names) query += `&tag_names=${params.tag_names}`;
  if (params.exclude_tag_names)
    query += `&exclude_tag_names=${params.exclude_tag_names}`;

  const seriesData = await callFredAPI<FredSeriesResponse>(query);
  return seriesData;
};
