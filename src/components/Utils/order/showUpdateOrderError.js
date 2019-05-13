import React from 'react';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

export const ERROR_CODES = {
  vendorIsInactive: 'vendorIsInactive',
  accessProviderIsInactive: 'accessProviderIsInactive',
  vendorNotFound: 'vendorNotFound',
  orderOpen: 'orderOpen',
  orderClosed: 'orderClosed',
  accessProviderNotFound: 'accessProviderNotFound',
};

const POL_NUMBER_KEY = 'poLineNumber';

const showUpdateOrderError = async (response, callout, openModal) => {
  let error;

  try {
    error = await response.json();
  } catch (parsingException) {
    error = response;
  }

  const errorCode = get(error, 'errors.0.code');
  const code = get(ERROR_CODES, errorCode, 'orderGenericError1');

  switch (code) {
    case ERROR_CODES.vendorIsInactive:
    case ERROR_CODES.vendorNotFound: {
      openModal([{ code }]);
      break;
    }
    case ERROR_CODES.accessProviderIsInactive:
    case ERROR_CODES.accessProviderNotFound: {
      let errors =
        get(error, 'errors.0.parameters', [])
          .filter(({ key }) => key === POL_NUMBER_KEY)
          .map(({ value }) => ({ code, poLineNumber: value }));

      errors = errors.length ? errors : [{ code }];
      openModal(errors);
      break;
    }
    default: {
      callout.sendCallout({
        message: <FormattedMessage id={`ui-orders.errors.${code}`} />,
        type: 'error',
      });
    }
  }
};

export default showUpdateOrderError;