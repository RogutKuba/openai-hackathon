'use client';

import { Report } from '@/api/markets.api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

export default function ReportsView(props: { reports: Report[] }) {
  const [activeReport, setActiveReport] = useState<Report | null>(
    props.reports[0] || null
  );

  return (
    <div className='flex h-full'>
      {/* Sidebar */}
      <div className='w-64 border-r border-gray-200 overflow-y-auto h-full'>
        <h2 className='text-lg font-semibold mb-4'>Reports</h2>
        <div className='space-y-2'>
          {props.reports.map((report) => (
            <button
              key={report.fileName}
              onClick={() => setActiveReport(report)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors cursor-pointer ${
                activeReport?.fileName === report.fileName
                  ? 'bg-primary text-blue-400 underline'
                  : 'hover:bg-gray-200'
              }`}
            >
              {report.fileName}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 p-6 overflow-y-auto h-full'>
        {activeReport ? (
          <div className='prose max-w-none'>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activeReport.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className='text-center text-gray-500'>
            Select a report to view its content
          </div>
        )}
      </div>
    </div>
  );
}
