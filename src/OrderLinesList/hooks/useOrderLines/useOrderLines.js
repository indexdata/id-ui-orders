import { useQuery } from 'react-query';
import { useLocation } from 'react-router';
import queryString from 'query-string';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import {
  getFiltersCount,
  LINES_API,
} from '@folio/stripes-acq-components';

import { getLinesQuery } from '@folio/plugin-find-po-line';

export const useOrderLines = ({ pagination, fetchReferences }) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'order-lines-list' });

  const { search } = useLocation();
  const queryParams = queryString.parse(search);
  const buildQuery = getLinesQuery(queryParams, ky);
  const filtersCount = getFiltersCount(queryParams);

  const { isFetching, data = {} } = useQuery(
    [namespace, pagination.timestamp, pagination.limit, pagination.offset],
    async () => {
      const query = await buildQuery();

      if (!filtersCount || !query) {
        return { orderLines: [], orderLinesCount: 0, query };
      }

      const searchParams = {
        limit: pagination.limit,
        offset: pagination.offset,
        query,
      };

      const { poLines, totalRecords } = await ky.get(LINES_API, { searchParams }).json();
      const { ordersMap = {}, acqUnitsMap = {} } = await fetchReferences(poLines);
      const orderLines = poLines.map(orderLine => ({
        ...orderLine,
        orderWorkflow: ordersMap[orderLine.purchaseOrderId]?.workflowStatus,
        acqUnit: ordersMap[orderLine.purchaseOrderId]?.acqUnitIds
          ?.map(unitId => acqUnitsMap[unitId]?.name)
          .filter(Boolean)
          .join(', '),
      }));

      return {
        orderLines,
        orderLinesCount: totalRecords,
        query,
      };
    },
    {
      enabled: Boolean(pagination.timestamp),
      keepPreviousData: true,
    },
  );

  return ({
    ...data,
    isLoading: isFetching,
  });
};
