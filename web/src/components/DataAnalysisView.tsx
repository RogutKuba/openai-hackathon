'use client';

import { DataAnalysis } from '@/api/markets.api';
import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
export default function DataAnalysisView({
  dataAnalysis,
}: {
  dataAnalysis: DataAnalysis[];
}) {
  const [activeAnalysis, setActiveAnalysis] = useState<DataAnalysis | null>(
    dataAnalysis[0] || null
  );

  return (
    <div className='flex h-full'>
      {/* Sidebar */}
      <div className='w-64 border-r border-gray-200 overflow-y-auto h-full'>
        <h2 className='text-lg font-semibold mb-4'>Data Analysis</h2>
        <div className='space-y-2'>
          {dataAnalysis.map((analysis) => (
            <button
              key={analysis.fileName}
              onClick={() => setActiveAnalysis(analysis)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors cursor-pointer ${
                activeAnalysis?.fileName === analysis.fileName
                  ? 'bg-primary text-blue-400 underline'
                  : 'hover:bg-gray-200'
              }`}
            >
              {analysis.fileName}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 p-6 overflow-y-auto h-full'>
        {activeAnalysis ? (
          <div className='prose max-w-none'>
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {activeAnalysis.content}
            </Markdown>
          </div>
        ) : (
          <div className='text-center text-gray-500'>
            Select an analysis to view its content
          </div>
        )}
      </div>
    </div>
  );
}
