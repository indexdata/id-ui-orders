import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  cloneDeep,
  get,
  set,
} from 'lodash';
import ReactRouterPropTypes from 'react-router-prop-types';
import queryString from 'query-string';

import {
  Callout,
  Layer,
} from '@folio/stripes/components';
import {
  getConfigSetting,
  sourceValues,
} from '@folio/stripes-acq-components';

import { WORKFLOW_STATUS } from '../../common/constants';
import getCreateInventorySetting from '../../common/utils/getCreateInventorySetting';
import {
  DISCOUNT_TYPE,
  POL_TEMPLATE_FIELDS_MAP,
} from '../POLine/const';
import { cloneOrder } from '../Utils/orderResource';
import {
  lineMutatorShape,
  orderRecordsMutatorShape,
} from '../Utils/mutators';
import {
  OPEN_ORDER_SETTING,
  ORDER,
} from '../Utils/resources';
import { POLineForm } from '../POLine';
import LinesLimit from '../PurchaseOrder/LinesLimit';
import { DEFAULT_CURRENCY } from '../POLine/Cost/FieldCurrency';
import getOrderTemplateValue from '../Utils/getOrderTemplateValue';

const ERROR_CODES = {
  accessProviderIsInactive: 'accessProviderIsInactive',
  accessProviderNotFound: 'accessProviderNotFound',
  costQtyPhysicalExceedsLoc: 'costQtyPhysicalExceedsLoc',
  locQtyElectronicExceedsCost: 'locQtyElectronicExceedsCost',
  locQtyPhysicalExceedsCost: 'locQtyPhysicalExceedsCost',
  materialTypeRequired: 'materialTypeRequired',
  nonZeroCostQtyElectronic: 'nonZeroCostQtyElectronic',
  nonZeroLocQtyPhysical: 'nonZeroLocQtyPhysical',
  orderNotFound: 'orderNotFound',
  zeroCostQty: 'zeroCostQty',
  zeroCostQtyElectronic: 'zeroCostQtyElectronic',
  zeroCostQtyPhysical: 'zeroCostQtyPhysical',
};

class LayerPOLine extends Component {
  static manifest = Object.freeze({
    order: ORDER,
    openOrderSetting: OPEN_ORDER_SETTING,
  });

  static propTypes = {
    connectedSource: PropTypes.object.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    match: ReactRouterPropTypes.match,
    parentMutator: PropTypes.shape({
      poLine: lineMutatorShape,
      records: orderRecordsMutatorShape,
    }),
    parentResources: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    stripes: PropTypes.shape({
      store: PropTypes.object.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    mutator: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      isLinesLimitExceededModalOpened: false,
      line: null,
    };
    this.connectedPOLineForm = props.stripes.connect(POLineForm);
    this.callout = React.createRef();
  }

  openLineLimitExceededModal = (line) => {
    this.setState({
      isLinesLimitExceededModalOpened: true,
      line,
    });
  };

  closeLineLimitExceededModal = () => {
    this.setState({
      isLinesLimitExceededModalOpened: false,
      line: null,
    });
  };

  handleErrorResponse = async (e, line) => {
    let response;

    try {
      response = await e.json();
    } catch (parsingException) {
      response = e;
    }
    if (response.errors && response.errors.length) {
      if (response.errors.find(el => el.code === 'lines_limit')) {
        this.openLineLimitExceededModal(line);
      } else {
        const messageCode = get(ERROR_CODES, response.errors[0].code, 'lineWasNotCreated');

        this.callout.current.sendCallout({
          message: <FormattedMessage id={`ui-orders.errors.${messageCode}`} />,
          type: 'error',
        });
      }
    }
  };

  submitPOLine = ({ saveAndOpen, ...line }) => {
    const newLine = cloneDeep(line);
    const { parentMutator: { poLine }, onCancel } = this.props;

    delete newLine.template;

    poLine.POST(newLine)
      .then(() => this.openOrder(saveAndOpen))
      .then(() => onCancel())
      .catch(e => this.handleErrorResponse(e, line));
  };

  getOrder = () => get(this.props, 'resources.order.records.0');

  getLine = () => {
    const { match: { params: { lineId } } } = this.props;
    const lines = get(this.getOrder(), 'compositePoLines', []);

    return lines.find(u => u.id === lineId);
  };

  createNewOrder = async () => {
    const { parentMutator } = this.props;
    const order = this.getOrder();

    try {
      const newOrder = await cloneOrder(order, parentMutator.records, this.state.line);

      parentMutator.query.update({
        _path: `/orders/view/${newOrder.id}`,
        layer: null,
      });
    } catch (e) {
      this.callout.sendCallout({
        message: <FormattedMessage id="ui-orders.errors.noCreatedOrder" />,
        type: 'error',
      });
    } finally {
      this.closeLineLimitExceededModal();
    }
  };

  openOrder = (saveAndOpen) => {
    const { mutator } = this.props;
    const order = this.getOrder();

    return saveAndOpen
      ? mutator.order.PUT({
        ...order,
        workflowStatus: WORKFLOW_STATUS.open,
      })
      : Promise.resolve();
  }

  updatePOLine = ({ saveAndOpen, ...data }) => {
    const line = cloneDeep(data);
    const { location: { pathname }, parentMutator } = this.props;

    parentMutator.poLine.PUT(line)
      .then(() => this.callout.current.sendCallout({
        type: 'success',
        message: <FormattedMessage id="ui-orders.success" />,
      }))
      .then(() => this.openOrder(saveAndOpen))
      .then(() => {
        parentMutator.query.update({
          _path: `${pathname}`,
          layer: null,
        });
      })
      .catch(e => this.handleErrorResponse(e, line));
  };

  getCreatePOLIneInitialValues = (order, vendor) => {
    const { parentResources, stripes } = this.props;
    const { id: orderId } = order;
    const createInventorySetting = getCreateInventorySetting(get(parentResources, ['createInventory', 'records'], []));

    const newObj = {
      template: get(order, 'template', ''),
      source: sourceValues.user,
      cost: {
        currency: get(vendor, 'vendorCurrencies[0]', DEFAULT_CURRENCY),
      },
      vendorDetail: {
        instructions: '',
        vendorAccount: get(vendor, 'accounts[0].accountNo', ''),
      },
      details: {
        subscriptionInterval: get(vendor, 'subscriptionInterval'),
      },
      purchaseOrderId: orderId,
      eresource: {
        createInventory: createInventorySetting.eresource,
      },
      physical: {
        createInventory: createInventorySetting.physical,
      },
      locations: [],
    };

    if (vendor) {
      newObj.eresource.accessProvider = vendor.id;
      newObj.physical.materialSupplier = vendor.id;

      if (vendor.discountPercent) {
        newObj.cost.discountType = DISCOUNT_TYPE.percentage;
        newObj.cost.discount = vendor.discountPercent;
      }
    }
    const templateValue = getOrderTemplateValue(parentResources, order.template);

    const { form } = stripes.store.getState();

    Object.keys(get(form, 'POLineForm.registeredFields', {}))
      .forEach(field => {
        const templateField = POL_TEMPLATE_FIELDS_MAP[field] || field;
        const templateFieldValue = get(templateValue, templateField);

        if (templateFieldValue !== undefined) set(newObj, field, templateFieldValue);
      });

    return newObj;
  };

  isConfigLoaded() {
    return Boolean(get(this.props.parentResources, 'createInventory.hasLoaded'));
  }

  isOrderLoaded() {
    return Boolean(get(this.props.resources, 'order.hasLoaded'));
  }

  isLoading() {
    return Boolean(!this.isOrderLoaded() || !this.isConfigLoaded());
  }

  render() {
    const {
      connectedSource,
      location,
      onCancel,
      parentMutator,
      parentResources,
      resources,
      stripes,
    } = this.props;
    const { layer } = location.search ? queryString.parse(location.search) : {};
    const order = this.getOrder();
    const { vendor: vendorId } = order || {};
    const vendor = get(parentResources, 'vendors.records', []).find(d => d.id === vendorId);
    const { isOpenOrderEnabled } = getConfigSetting(get(resources, 'openOrderSetting.records', {}));
    const isSaveAndOpenButtonVisible = isOpenOrderEnabled
      && get(order, 'approved')
      && get(order, 'workflowStatus') === WORKFLOW_STATUS.pending;

    if (this.isLoading()) {
      return null;
    } else if (layer === 'create-po-line') {
      return (
        <Layer
          isOpen
          contentLabel="Create PO Line Dialog"
        >
          <this.connectedPOLineForm
            connectedSource={connectedSource}
            initialValues={this.getCreatePOLIneInitialValues(order, vendor)}
            onCancel={onCancel}
            onSubmit={this.submitPOLine}
            order={order}
            vendor={vendor}
            parentMutator={parentMutator}
            parentResources={parentResources}
            stripes={stripes}
            isSaveAndOpenButtonVisible={isSaveAndOpenButtonVisible}
          />
          {this.state.isLinesLimitExceededModalOpened && (
            <LinesLimit
              cancel={this.closeLineLimitExceededModal}
              createOrder={this.createNewOrder}
            />
          )}
          <Callout ref={this.callout} />
        </Layer>
      );
    } else if (layer === 'edit-po-line') {
      return (
        <Layer
          isOpen
          contentLabel="Edit PO Line Dialog"
        >
          <this.connectedPOLineForm
            connectedSource={connectedSource}
            initialValues={this.getLine()}
            onCancel={onCancel}
            onSubmit={this.updatePOLine}
            order={order}
            vendor={vendor}
            parentMutator={parentMutator}
            parentResources={parentResources}
            stripes={stripes}
            isSaveAndOpenButtonVisible={isSaveAndOpenButtonVisible}
          />
          <Callout ref={this.callout} />
        </Layer>
      );
    }

    return null;
  }
}

export default LayerPOLine;
