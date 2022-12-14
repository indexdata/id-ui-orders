import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { stripesConnect } from '@folio/stripes/core';
import {
  DICT_CONTRIBUTOR_NAME_TYPES,
  DICT_IDENTIFIER_TYPES,
  prefixesResource,
  suffixesResource,
  useShowCallout,
} from '@folio/stripes-acq-components';

import {
  IDENTIFIER_TYPES,
  ADDRESSES,
  LOCATIONS,
  FUND,
  CREATE_INVENTORY,
  VENDORS,
  MATERIAL_TYPES,
  ORDER_TEMPLATE,
  CONTRIBUTOR_NAME_TYPES,
} from '../../../components/Utils/resources';
import getIdentifierTypesForSelect from '../../../components/Utils/getIdentifierTypesForSelect';
import getFundsForSelect from '../../../components/Utils/getFundsForSelect';
import getMaterialTypesForSelect from '../../../components/Utils/getMaterialTypesForSelect';
import getContributorNameTypesForSelect from '../../../components/Utils/getContributorNameTypesForSelect';
import {
  getCreateInventorySetting,
  getAddresses,
  getAddressOptions,
} from '../../../common/utils';
import { ORGANIZATION_STATUS_ACTIVE } from '../../../common/constants';

import OrderTemplatesEditor from './OrderTemplatesEditor';

const INITIAL_VALUES = { isPackage: false, hideAll: false };

function OrderTemplatesEditorContainer({ match: { params: { id } }, close, resources, stripes, mutator }) {
  const showToast = useShowCallout();
  const saveOrderTemplate = useCallback((values) => {
    const mutatorMethod = id ? mutator.orderTemplate.PUT : mutator.orderTemplate.POST;

    mutatorMethod({ ...values, hideAll: undefined })
      .then(() => {
        showToast({ messageId: 'ui-orders.settings.orderTemplates.save.success' });
        close();
      })
      .catch(() => {
        showToast({
          messageId: 'ui-orders.settings.orderTemplates.save.error',
          type: 'error',
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [close, id, showToast]);

  const locations = resources?.locations?.records;
  const locationIds = useMemo(() => locations?.map(location => location.id), [locations]);
  const funds = getFundsForSelect(resources);
  const identifierTypes = getIdentifierTypesForSelect(resources);
  const contributorNameTypes = getContributorNameTypesForSelect(resources);
  const createInventorySetting = getCreateInventorySetting(get(resources, ['createInventory', 'records'], []));
  const vendors = get(resources, 'vendors.records', [])
    .filter(({ isVendor, status }) => isVendor && status === ORGANIZATION_STATUS_ACTIVE);
  const prefixesSetting = get(resources, 'prefixesSetting.records', [])
    .map(({ name }) => ({ label: name, value: name }));
  const suffixesSetting = get(resources, 'suffixesSetting.records', [])
    .map(({ name }) => ({ label: name, value: name }));
  const addresses = getAddressOptions(getAddresses(get(resources, 'addresses.records', [])));
  const materialTypes = getMaterialTypesForSelect(resources);
  const orderTemplate = id
    ? {
      ...get(resources, ['orderTemplate', 'records', 0], INITIAL_VALUES),
      hideAll: false,
    }
    : INITIAL_VALUES;
  const title = get(orderTemplate, ['templateName']) || <FormattedMessage id="ui-orders.settings.orderTemplates.editor.titleCreate" />;

  return (
    <OrderTemplatesEditor
      title={title}
      onSubmit={saveOrderTemplate}
      close={close}
      funds={funds}
      initialValues={orderTemplate}
      identifierTypes={identifierTypes}
      locationIds={locationIds}
      locations={locations}
      createInventorySetting={createInventorySetting}
      prefixesSetting={prefixesSetting}
      suffixesSetting={suffixesSetting}
      addresses={addresses}
      materialTypes={materialTypes}
      vendors={vendors}
      contributorNameTypes={contributorNameTypes}
      stripes={stripes}
    />
  );
}

OrderTemplatesEditorContainer.manifest = Object.freeze({
  [DICT_IDENTIFIER_TYPES]: IDENTIFIER_TYPES,
  locations: LOCATIONS,
  fund: FUND,
  createInventory: CREATE_INVENTORY,
  prefixesSetting: prefixesResource,
  suffixesSetting: suffixesResource,
  addresses: ADDRESSES,
  vendors: VENDORS,
  materialTypes: MATERIAL_TYPES,
  orderTemplate: ORDER_TEMPLATE,
  [DICT_CONTRIBUTOR_NAME_TYPES]: CONTRIBUTOR_NAME_TYPES,
});

OrderTemplatesEditorContainer.propTypes = {
  close: PropTypes.func.isRequired,
  mutator: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  stripes: PropTypes.object.isRequired,
};

export default withRouter(stripesConnect(OrderTemplatesEditorContainer));
