import { getMarkets } from '@/api/markets.api';
import { slugify } from '@/lib/slugify';
import Link from 'next/link';

export default function Home() {
  const markets = getMarkets();

  return (
    <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            RenAIssance Technologies
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Welcome to our comprehensive market analysis platform. Explore
            detailed insights, trends, and reports across various markets.
            Select a market below to view in-depth analysis and forecasts.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
            Available Markets
          </h2>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {markets.map((market) => (
              <Link
                key={market.title}
                href={`/${slugify(market.title)}`}
                className='block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
              >
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {market.title}
                </h3>
                <p className='text-gray-600'>View market details and reports</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
