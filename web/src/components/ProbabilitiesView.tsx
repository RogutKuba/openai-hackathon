import { Probability } from '@/api/markets.api';
import { cx } from '@/ui/lib/utils';
import { Tooltip } from '@/ui/tooltip';

export default function ProbabilitiesView(props: {
  probabilities: Probability[];
}) {
  const { probabilities } = props;

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Ticker
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Market Type
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Yes Bid
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Yes Ask
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              No Bid
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              No Ask
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Yes Probability
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              No Probability
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Expected Value (Yes)
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Expected Value (No)
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {probabilities.map((probability) => {
            const description =
              probability.description.length > 0
                ? probability.description
                : 'No description available';

            // scale between 0 and 1
            const isYes = probability.probability.yesProbability;
            const isNo = probability.probability.noProbability;

            const expectedValueYes =
              (isYes * (1 - probability.yes_ask) -
                (1 - isYes) * probability.yes_ask) /
              100;

            const expectedValueNo =
              (isNo * (1 - probability.no_ask) -
                (1 - isNo) * probability.no_ask) /
              100;

            return (
              <tr key={probability.ticker}>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  <Tooltip content={description}>{probability.ticker}</Tooltip>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {probability.market_type}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {probability.yes_bid}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {probability.yes_ask}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {probability.no_bid}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {probability.no_ask}
                </td>
                <td
                  className={cx(
                    'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                  )}
                >
                  {probability.probability.yesProbability.toFixed(2)}%
                </td>
                <td
                  className={cx(
                    'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                  )}
                >
                  {probability.probability.noProbability.toFixed(2)}%
                </td>

                <td
                  className={cx(
                    'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
                    expectedValueYes > 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {expectedValueYes.toFixed(2)}
                </td>

                <td
                  className={cx(
                    'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
                    expectedValueNo > 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {expectedValueNo.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
