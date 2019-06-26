import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { FormattedMessage } from 'react-intl';

import { get } from 'lodash';

import {
  IDENTIFIER_TYPES,
  ADDRESSES,
  ORDER_TEMPLATES,
  LOCATIONS,
  FUND,
  CREATE_INVENTORY,
  PREFIXES_SETTING,
  SUFFIXES_SETTING,
  VENDORS,
  MATERIAL_TYPES,
  ORDER_TEMPLATE,
} from '../../../components/Utils/resources';
import {
  MODULE_ORDERS,
  CONFIG_ORDER_TEMPLATES,
} from '../../../components/Utils/const';
import getIdentifierTypesForSelect from '../../../components/Utils/getIdentifierTypesForSelect';
import getLocationsForSelect from '../../../components/Utils/getLocationsForSelect';
import getFundsForSelect from '../../../components/Utils/getFundsForSelect';
import getMaterialTypesForSelect from '../../../components/Utils/getMaterialTypesForSelect';
import {
  getCreateInventorySetting,
  getAddresses,
  getAddressOptions,
  getSettingsList,
  getVendorOptions,
} from '../../../common/utils';

import { getOrderTemplatesList } from '../util';
import OrderTemplatesEditor from './OrderTemplatesEditor';

const INITIAL_VALUES = {};

class OrderTemplatesEditorContainer extends Component {
  static manifest = Object.freeze({
    orderTemplates: {
      ...ORDER_TEMPLATES,
      fetch: false,
    },
    identifierTypes: IDENTIFIER_TYPES,
    locations: LOCATIONS,
    fund: FUND,
    createInventory: CREATE_INVENTORY,
    prefixesSetting: PREFIXES_SETTING,
    suffixesSetting: SUFFIXES_SETTING,
    addresses: ADDRESSES,
    vendors: VENDORS,
    materialTypes: MATERIAL_TYPES,
    orderTemplate: ORDER_TEMPLATE,
  });

  static propTypes = {
    close: PropTypes.func.isRequired,
    mutator: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
  };

  saveOrderTemplate = (values) => {
    const { close, mutator: { orderTemplates, orderTemplate }, match, resources } = this.props;
    const id = get(match, ['params', 'id']);
    const mutator = id ? orderTemplate.PUT : orderTemplates.POST;
    const value = JSON.stringify(values);
    let orderTemplateBody;

    if (id) {
      orderTemplateBody = get(resources, ['orderTemplate', 'records', 0], {});
    } else {
      orderTemplateBody = {
        module: MODULE_ORDERS,
        configName: `${MODULE_ORDERS}.${CONFIG_ORDER_TEMPLATES}`,
        code: (new Date()).valueOf(),
      };
    }

    orderTemplateBody = { ...orderTemplateBody, value };

    mutator(orderTemplateBody).then(close);
  };

  render() {
    const { close, resources, match } = this.props;
    const locations = getLocationsForSelect(resources);
    const funds = getFundsForSelect(resources);
    const identifierTypes = getIdentifierTypesForSelect(resources);
    const createInventorySetting = getCreateInventorySetting(get(resources, ['createInventory', 'records'], []));
    const vendors = getVendorOptions(get(resources, 'vendors.records', []));
    const prefixesSetting = getSettingsList(get(resources, 'prefixesSetting.records', {}));
    const suffixesSetting = getSettingsList(get(resources, 'suffixesSetting.records', {}));
    const addresses = getAddressOptions(getAddresses(get(resources, 'addresses.records', [])));
    const materialTypes = getMaterialTypesForSelect(resources);
    const orderTemplate = getOrderTemplatesList(get(resources, 'orderTemplate.records', []));
    const id = get(match, ['params', 'id']);
    const template = id
      ? get(orderTemplate, 0, {})
      : { orderTemplate: INITIAL_VALUES };
    const title = get(template, 'title') || <FormattedMessage id="ui-orders.settings.orderTemplates.editor.titleCreate" />;

    return (
      <OrderTemplatesEditor
        title={title}
        onSubmit={this.saveOrderTemplate}
        close={close}
        funds={funds}
        initialValues={template.orderTemplate}
        identifierTypes={identifierTypes}
        locations={locations}
        createInventorySetting={createInventorySetting}
        prefixesSetting={prefixesSetting.selectedItems}
        suffixesSetting={suffixesSetting.selectedItems}
        addresses={addresses}
        vendors={vendors}
        materialTypes={materialTypes}
      />
    );
  }
}

export default OrderTemplatesEditorContainer;
