import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { get } from 'lodash';

import { POLineView } from '../../components/POLine';
import {
  ORDERS_API,
  LINES_API,
} from '../../components/Utils/api';
import { FILTERS as ORDER_FILTERS } from '../../OrdersList';

class OrderLineDetails extends Component {
  static manifest = Object.freeze({
    order: {
      type: 'okapi',
      path: `${ORDERS_API}/%{orderId}`,
      throwErrors: false,
      fetch: false,
      accumulate: true,
    },
    orderLine: {
      type: 'okapi',
      path: `${LINES_API}/:{id}`,
      throwErrors: false,
      fetch: false,
      accumulate: true,
    },
    orderId: {},
  });

  static propTypes = {
    parentMutator: PropTypes.object.isRequired,
    parentResources: PropTypes.object.isRequired,
    match: ReactRouterPropTypes.match,
    resources: PropTypes.object.isRequired,
    mutator: PropTypes.object.isRequired,
    showToast: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.fetchLineDetails();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.fetchLineDetails();
    }
  }

  fetchLineDetails = () => {
    const { mutator } = this.props;

    mutator.orderLine.reset();
    mutator.order.reset();
    mutator.orderLine.GET()
      .then(({ purchaseOrderId }) => {
        mutator.orderId.replace(purchaseOrderId);
        mutator.order.GET();
      });
  }

  goToOrderDetails = () => {
    const order = get(this.props.resources, ['order', 'records', 0], {});

    this.props.parentMutator.query.replace({
      _path: `/orders/view/${order.id}`,
      filters: `${ORDER_FILTERS.PO_NUMBER}.${order.poNumber}`,
    });
  };

  getLine = () => get(this.props.resources, ['orderLine', 'records', 0]);

  deleteLine = () => {
    const { mutator, parentMutator, showToast } = this.props;
    const line = this.getLine();
    const lineNumber = line.poLineNumber;

    mutator.orderLine.DELETE(line).then(() => {
      showToast('ui-orders.line.delete.success', 'success', { lineNumber });
      parentMutator.query.update({ _path: '/orders/lines' });
    });
  };

  render() {
    const { match: { params: { id } } } = this.props;
    const line = this.getLine();
    const order = get(this.props.resources, ['order', 'records', 0], {});
    const locations = get(this.props.parentResources, 'locations.records', []);
    const materialTypes = get(this.props.parentResources, 'materialTypes.records', []);
    const vendors = get(this.props.parentResources, 'vendors.records', []);
    const funds = get(this.props.parentResources, 'funds.records', []);

    const receivingURL = `/orders/view/${order.id}/po-line/view/${id}/receiving`;
    const checkinURL = `/orders/view/${order.id}/po-line/view/${id}/check-in/items`;

    return (
      <POLineView
        {...this.props}
        line={line}
        order={order}
        locations={locations}
        materialTypes={materialTypes}
        vendors={vendors}
        receivingURL={receivingURL}
        checkinURL={checkinURL}
        funds={funds}
        editable={false}
        goToOrderDetails={this.goToOrderDetails}
        deleteLine={this.deleteLine}
      />
    );
  }
}

export default OrderLineDetails;