import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import {
  Checkbox,
  KeyValue,
  MultiColumnList,
  TextField,
  Select,
} from '@folio/stripes/components';

import { getItemStatusLabel } from '../../common/constants';
import centeredRowFormatter from '../../common/centeredRowFormatter';

const visibleColumns = [
  'isChecked',
  'barcode',
  'format',
  'callNumber',
  'hasRequest',
  'comment',
  'location',
  'itemStatus',
];

const LineDetails = ({
  allChecked,
  isItemChecked,
  isLoading,
  itemsMap,
  lineItems,
  locationsOptions,
  onChangeField,
  poLineId,
  toggleAll,
  toggleItem,
}) => {
  const isSelected = ({ item }) => isItemChecked(item);
  const isDisabled = (itemId) => isLoading || itemsMap[itemId] === undefined;
  const resultFormatter = {
    'isChecked': (item) => (
      <Checkbox
        checked={isItemChecked(item)}
        onChange={() => toggleItem(item)}
        type="checkbox"
      />
    ),
    'barcode': (item) => (
      <TextField
        data-test-barcode
        disabled={isDisabled(item.itemId)}
        onChange={(e) => onChangeField(item, e.target.value, 'barcode')}
        type="text"
        value={item.barcode}
        marginBottom0
      />
    ),
    'format': (item) => (
      <KeyValue value={get(item, 'pieceFormat', '')} />
    ),
    'callNumber': (item) => (
      <TextField
        data-test-call-number
        disabled={isDisabled(item.itemId)}
        onChange={(e) => onChangeField(item, e.target.value, 'callNumber')}
        type="text"
        value={item.callNumber}
        marginBottom0
      />
    ),
    'hasRequest': (item) => Boolean(item.request) && <FormattedMessage id="ui-orders.requests.request.isOpened" />,
    'comment': (item) => (
      <TextField
        data-test-comment
        onChange={(e) => onChangeField(item, e.target.value, 'comment')}
        type="text"
        value={item.comment}
        marginBottom0
      />
    ),
    'location': (item) => (
      <Select
        dataOptions={locationsOptions}
        fullWidth
        onChange={(e) => onChangeField(item, e.target.value, 'locationId')}
        value={get(item, 'locationId', '')}
        marginBottom0
      />
    ),
    'itemStatus': (item) => getItemStatusLabel(item.itemStatus),
  };

  return (
    <MultiColumnList
      contentData={lineItems[poLineId]}
      formatter={resultFormatter}
      visibleColumns={visibleColumns}
      columnMapping={{
        isChecked: <Checkbox type="checkbox" checked={allChecked[poLineId]} onChange={() => toggleAll(poLineId)} />,
        barcode: <FormattedMessage id="ui-orders.receiving.barcode" />,
        format: <FormattedMessage id="ui-orders.receiving.format" />,
        callNumber: <FormattedMessage id="ui-orders.receiving.callNumber" />,
        hasRequest: <FormattedMessage id="ui-orders.requests.request" />,
        comment: <FormattedMessage id="ui-orders.receiving.comment" />,
        location: <FormattedMessage id="ui-orders.receiving.location" />,
        itemStatus: <FormattedMessage id="ui-orders.receiving.itemStatus" />,
      }}
      onRowClick={undefined}
      isSelected={isSelected}
      interactive={false}
      selectedClass="noClass"
      rowFormatter={centeredRowFormatter}
    />
  );
};

LineDetails.propTypes = {
  allChecked: PropTypes.object.isRequired,
  isItemChecked: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  itemsMap: PropTypes.object,
  lineItems: PropTypes.object.isRequired,
  locationsOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChangeField: PropTypes.func.isRequired,
  poLineId: PropTypes.string.isRequired,
  toggleAll: PropTypes.func.isRequired,
  toggleItem: PropTypes.func.isRequired,
};

export default LineDetails;
