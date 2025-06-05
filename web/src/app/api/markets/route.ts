import { NextResponse } from 'next/server';
import {
  getMarkets,
  getReportsForMarket,
  getProbabilitiesForMarket,
} from '@/api/markets.api';

export async function GET() {
  try {
    const markets = getMarkets();
    return NextResponse.json(markets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { marketTitle, type } = await request.json();

    if (!marketTitle) {
      return NextResponse.json(
        { error: 'Market title is required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'reports':
        const reports = getReportsForMarket(marketTitle);
        return NextResponse.json(reports);
      case 'probabilities':
        const probabilities = getProbabilitiesForMarket(marketTitle);
        return NextResponse.json(probabilities);
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
