import { Agent, run } from '@openai/agents';
import { dataAnalysisTool, getCsvFormat } from '../tools';
import {
  fredBaseCategorySearchTool,
  fredSubCategorySearchTool,
} from '../tools/fred-search';
import { getFredSeriesForCategoryTool } from '../tools/fred-series';
import { z } from 'zod';
import path from 'path';
import { createWriteStream, mkdirSync, writeFileSync } from 'fs';
import extractZip from 'extract-zip';

// export const dirName = path.join(
//   __dirname,
//   '..',
//   'data'
//   // `latest-${new Date().valueOf()}.json`
// );

export const getMarketDirName = (market: string) => {
  const slug = market.toLowerCase().replace(/ /g, '-');
  return path.join(__dirname, '..', 'data', slug);
};

const analystAgent = new Agent({
  name: 'Research Analyst Agent',
  instructions: `You are an expert research analyst with access to data analysis capabilities. Your role is to:
1. **Data Analysis**: Use the data_analysis tool to analyze structured data and extract insights
   - Perform statistical analysis including summary statistics, correlations, and trends
   - Identify patterns, outliers, and significant relationships in data
   - Generate actionable insights and recommendations based on data findings

2. **Research Methodology**: 
   - Always verify information from multiple sources when possible
   - Cite your sources and provide context for your findings
   - Distinguish between facts, opinions, and speculation
   - Present findings in a clear, structured manner

3. **Analysis Approach**:
   - Start with broad research to understand the topic landscape
   - Narrow down to specific areas of interest or concern
   - Cross-reference findings with data analysis when applicable
   - Provide both quantitative and qualitative insights

When conducting research, be thorough, objective, and analytical. Present your findings with appropriate caveats and confidence levels.`,
  handoffDescription:
    'Expert research analyst capable of web search and comprehensive data analysis. Can investigate topics, analyze trends, and provide data-driven insights.',
  tools: [dataAnalysisTool, getCsvFormat],
  outputType: z.object({
    analysis: z
      .string()
      .describe('The analysis of the data in markdown format'),
    analysisFileName: z
      .string()
      .describe('The filename of the analysis without the .md extension'),
  }),
});

const FRED_SEARCH_OUTPUT_SCHEMA = z.object({
  dataSeries: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
    })
  ),
});

const fredSearchAgent = new Agent({
  name: 'FRED Search Agent',
  instructions: `You are an expert in finding and retrieving economic data from the Federal Reserve Economic Data (FRED) database. Your primary goal is to find and return relevant FRED series that match the user's request.

**Your Workflow:**

1. **Start with Base Categories**: Use fred_base_category_search to explore the main FRED categories:
   - Money, Banking, & Finance (interest rates, exchange rates, monetary data)
   - Population, Employment, & Labor Markets (unemployment, wages, labor statistics)
   - National Accounts (GDP, government debt, trade data)
   - Production & Business Activity (industrial production, housing, manufacturing)
   - Prices (inflation, CPI, PPI, commodity prices)
   - International Data (country-specific economic indicators)
   - U.S. Regional Data (state and regional economic data)
   - Academic Data (historical and research datasets)

2. **Drill Down to Subcategories**: Use fred_sub_category_search with a base category ID to find more specific subcategories that match the user's needs.

3. **Find and Return Specific Data Series**: Use get_series_for_category to retrieve actual economic data series from relevant categories, with options to:
   - Filter by frequency (daily, weekly, monthly, quarterly, annual)
   - Filter by units (levels, rates, indexes, percentages)
   - Sort by popularity, recency, or alphabetically
   - Limit results and paginate through large datasets
   - Apply tag-based filtering for precise targeting

**Critical: Always Return Relevant Series**
Your final output MUST include the relevant FRED series you found. Return them in the required format with:
- series.id: The FRED series identifier (e.g., "UNRATE", "GDP", "CPIAUCSL")
- series.title: The full descriptive title of the series

**Best Practices:**

- Always start broad and narrow down systematically
- When users ask for specific economic indicators, first identify the most relevant base category
- Use popularity sorting by default to surface the most commonly used series
- Consider seasonal adjustment preferences (seasonally adjusted vs. not seasonally adjusted)
- Pay attention to data frequency requirements (monthly vs. quarterly data)
- Provide context about what each series measures and its typical use cases
- When multiple relevant series exist, include the most relevant ones in your output
- **Always conclude by returning the found series in the specified output format**

**Example Approach:**
For a request about "unemployment data":
1. Start with "Population, Employment, & Labor Markets" base category
2. Look for subcategories like "Current Population Survey" or "Weekly Initial Claims"
3. Use fred_series_search to find series in the most relevant subcategory
4. Return the relevant series with their IDs and titles

Remember: Your job is not just to search, but to **find and return** the most relevant FRED series for the user's request.`,
  tools: [
    fredBaseCategorySearchTool,
    fredSubCategorySearchTool,
    getFredSeriesForCategoryTool,
  ],
  outputType: FRED_SEARCH_OUTPUT_SCHEMA,
});

const reportWriterAgent = new Agent({
  name: 'Report Writer Agent',
  instructions: `You are an expert in writing comprehensive research reports in markdown format. Your role is to synthesize multiple data analyses into a cohesive, well-structured report that directly addresses the original query.

**Report Structure:**
1. **Executive Summary**
   - Brief overview of key findings
   - Most significant insights
   - Main conclusions

2. **Methodology**
   - Data sources used
   - Analysis approach
   - Time period covered

3. **Key Findings**
   - Organized by major themes
   - Data-driven insights
   - Statistical significance
   - Visual descriptions (when applicable)

4. **Detailed Analysis**
   - In-depth examination of each data series
   - Trends and patterns
   - Comparative analysis
   - Context and implications

5. **Conclusions and Recommendations**
   - Summary of findings
   - Actionable insights
   - Future considerations

**Writing Guidelines:**
- Use clear, professional language
- Include relevant statistics and metrics
- Maintain objectivity
- Use markdown formatting for structure
- Include headers, lists, and emphasis where appropriate
- Reference specific data points and sources
- Ensure logical flow between sections

**Critical Requirements:**
- Always tie findings back to the original query
- Synthesize multiple analyses into a coherent narrative
- Highlight relationships between different data series
- Provide context for technical findings
- Use appropriate markdown formatting for readability`,
  tools: [],
  outputType: z.object({
    report: z.string().describe('The complete markdown formatted report'),
    reportFileName: z
      .string()
      .describe('The filename of the report without the .md extension'),
  }),
});

const downloadFREDSeriesData = async (
  seriesId: string,
  marketDirName: string
) => {
  const finanicalDataDirname = path.join(marketDirName, 'fred-data');
  // ensure the data directory exists
  mkdirSync(finanicalDataDirname, { recursive: true });

  const response = await fetch(
    `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${process.env.FRED_API_KEY}&file_type=csv&file_format=zip`
  );
  const zipBlob = await response.blob();

  const filePath = path.join(finanicalDataDirname, `${seriesId}.zip`);
  const fileStream = createWriteStream(filePath);
  const zipStream = zipBlob.stream().pipeTo(
    new WritableStream({
      write(chunk) {
        fileStream.write(chunk);
      },
      close() {
        fileStream.end();
      },
    })
  );
  await zipStream;

  // now unzip the file
  const destFolder = path.join(finanicalDataDirname, `${seriesId}`);
  await extractZip(filePath, {
    dir: destFolder,
  });

  return path.join(destFolder, `obs._by_real-time_period.csv`);
};

export const analyzeLatestFREDData = async (
  query: string,
  marketDirName: string
) => {
  const fredSearchRun = await run(fredSearchAgent, query);
  const fredDataSeries = fredSearchRun.finalOutput?.dataSeries ?? [];

  const seriesWithPath = await Promise.all(
    fredDataSeries.map(async (dataSeries) => {
      // download the series data
      const path = await downloadFREDSeriesData(dataSeries.id, marketDirName);
      return {
        ...dataSeries,
        path,
      };
    })
  );

  // analyze the data
  const analysisResults = await Promise.all(
    seriesWithPath.map(async (dataSeries) => {
      const analysisRun = await run(
        analystAgent,
        `Given the original query: "${query}", analyze the data for the series ${dataSeries.title}, which is located at ${dataSeries.path}. Focus on insights that are relevant to the original query.`
      );
      return {
        dataSeries: dataSeries,
        analysis: analysisRun.finalOutput ?? {
          analysis: 'No analysis generated',
          analysisFileName: 'analysis-error.md',
        },
      };
    })
  );

  const dataAnalysisDirname = path.join(marketDirName, 'data-analysis');
  mkdirSync(dataAnalysisDirname, { recursive: true });

  for (const analysis of analysisResults) {
    writeFileSync(
      path.join(
        dataAnalysisDirname,
        `${analysis.analysis.analysisFileName}.md`
      ),
      analysis.analysis.analysis
    );
  }

  // Generate the final report
  const reportRun = await run(
    reportWriterAgent,
    `Original Query: "${query}"\n\nAnalysis Results:\n${JSON.stringify(
      analysisResults,
      null,
      2
    )}`
  );

  return {
    report: reportRun.finalOutput?.report ?? 'No report generated',
    reportFileName: reportRun.finalOutput?.reportFileName ?? 'report-error.md',
  };
};
