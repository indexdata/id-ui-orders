import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Row,
  Col,
  KeyValue,
} from '@folio/stripes/components';
import { AmountWithCurrencyField } from '@folio/stripes-acq-components';

import { FieldIsApproved } from '../../../common/POFields';
import { IfFieldVisible } from '../../../common/IfFieldVisible';
import {
  isWorkflowStatusIsPending,
} from '../util';
import FieldWorkflowStatus from './FieldWorkflowStatus';
import TotalUnits from './TotalUnits';

const SummaryForm = ({ initialValues: order, hiddenFields = {} }) => (
  <Row>
    <Col xs={6} md={3}>
      <TotalUnits value={order.totalItems} />
    </Col>
    <Col xs={6} md={3}>
      <KeyValue label={<FormattedMessage id="ui-orders.orderSummary.totalEstimatedPrice" />}>
        <AmountWithCurrencyField amount={order.totalEstimatedPrice} />
      </KeyValue>
    </Col>

    <IfFieldVisible visible={!hiddenFields.ongoing?.isSubscription} name="approved">
      <Col xs={6} md={3}>
        <FieldIsApproved disabled={Boolean(order.workflowStatus) && !isWorkflowStatusIsPending(order)} />
      </Col>
    </IfFieldVisible>

    <Col xs={6} md={3}>
      <FieldWorkflowStatus isNonInteractive />
    </Col>
  </Row>
);

SummaryForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  hiddenFields: PropTypes.object,
};

export default SummaryForm;
