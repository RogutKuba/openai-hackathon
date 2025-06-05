import { getMarkets } from '@/api/markets.api';
import Image from 'next/image';
import Link from 'next/link';

export default function Sidebar() {
  const markets = getMarkets();

  return (
    <div className='w-64 h-screen bg-white border-r border-gray-200 flex flex-col'>
      <Link href='/' className='p-4 border-b border-gray-200 cursor-pointer'>
        <img src='/logo.png' alt='Logo' className='mx-auto' />
      </Link>

      <nav className='flex-1 overflow-y-auto p-4'>
        <h2 className='text-sm font-semibold text-gray-600 mb-4'>Markets</h2>
        <ul className='space-y-2'>
          {markets.map((market) => (
            <li key={market.title}>
              <Link
                href={`/${market.title}`}
                className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
              >
                {market.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
