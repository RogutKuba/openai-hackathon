import {
  getDataAnalysisForMarket,
  getMarketDetails,
  getProbabilitiesForMarket,
  getReportsForMarket,
} from '@/api/markets.api';
import DataAnalysisView from '@/components/DataAnalysisView';
import ProbabilitiesView from '@/components/ProbabilitiesView';
import ReportsView from '@/components/ReportsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';

export default async function MarketPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market: marketSlug } = await params;
  const market = getMarketDetails(marketSlug);
  const reports = getReportsForMarket(marketSlug);
  const probabilities = getProbabilitiesForMarket(marketSlug);
  const dataAnalysis = getDataAnalysisForMarket(marketSlug);

  return (
    <div className='container mx-auto flex flex-col h-full overflow-y-auto'>
      <h1 className='text-2xl font-bold'>Market: {market.description}</h1>
      <p className='text-gray-600 mb-6'>{market.ticker}</p>

      <Tabs defaultValue='reports' className='w-full flex-1 flex flex-col'>
        <TabsList className='mb-4'>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
          <TabsTrigger value='data-analysis'>Data Analysis</TabsTrigger>
          {/* <TabsTrigger value='web-sources'>Web Sources</TabsTrigger> */}
          <TabsTrigger value='probabilities'>Probabilities</TabsTrigger>
          <TabsTrigger value='trades'>Trades</TabsTrigger>
        </TabsList>

        <div className='flex-1 overflow-y-auto'>
          <TabsContent value='reports' className='h-full'>
            <ReportsView reports={reports} />
          </TabsContent>

          <TabsContent value='probabilities' className='h-full'>
            <ProbabilitiesView probabilities={probabilities} />
          </TabsContent>

          <TabsContent value='data-analysis' className='h-full'>
            <DataAnalysisView dataAnalysis={dataAnalysis} />
          </TabsContent>

          <TabsContent value='trades' className='h-full'>
            <div>Coming soon...</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
