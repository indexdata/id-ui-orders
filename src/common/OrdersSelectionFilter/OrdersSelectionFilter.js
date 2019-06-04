import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  FilterAccordionHeader,
  Selection,
} from '@folio/stripes/components';

import {
  createClearFilterHandler,
  createOnChangeSelectionFilter,
} from '../utils';
import { selectOptionsShape } from '../shapes';

const OrdersSelectionFilter = ({
  id,
  activeFilters = [],
  closedByDefault = true,
  labelId,
  name,
  onChange,
  options = [],
}) => {
  return (
    <Accordion
      id={id}
      closedByDefault={closedByDefault}
      displayClearButton={activeFilters.length > 0}
      header={FilterAccordionHeader}
      label={<FormattedMessage id={labelId} />}
      onClearFilter={createClearFilterHandler(onChange, name)}
    >
      <Selection
        dataOptions={options}
        value={activeFilters[0] || ''}
        onChange={createOnChangeSelectionFilter(onChange, name)}
      />
    </Accordion>
  );
};

OrdersSelectionFilter.propTypes = {
  id: PropTypes.string,
  activeFilters: PropTypes.arrayOf(PropTypes.string),
  closedByDefault: PropTypes.bool,
  labelId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: selectOptionsShape,
};

export default OrdersSelectionFilter;