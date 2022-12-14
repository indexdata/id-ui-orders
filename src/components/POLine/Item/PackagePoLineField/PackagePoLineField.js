import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import { Button, TextField } from '@folio/stripes/components';
import { Pluggable, stripesConnect } from '@folio/stripes/core';
import {
  baseManifest,
  LINES_API,
} from '@folio/stripes-acq-components';

import styles from './PackagePoLineField.css';

function PackagePoLineField({ disabled, poLineId, resources, onSelectLine }) {
  const { id, titleOrPackage } = resources?.linkedPoLine?.records?.[0] ?? {};
  const title = poLineId && poLineId === id && titleOrPackage;
  const onClearField = useCallback(() => onSelectLine([]), [onSelectLine]);
  const pluginButton = useCallback(({ buttonRef, onClick }) => (
    <Button
      buttonRef={buttonRef}
      buttonStyle="link"
      data-test-plugin-find-po-line
      key="searchButton"
      marginBottom0
      onClick={onClick}
    >
      <FormattedMessage id="ui-orders.itemDetails.linkPackageLookUp" />
    </Button>
  ), []);

  return (
    <div className={styles.packagePoLineField}>
      {/* non-rendering Field component for updating value with form.change() and affecting FormState */}
      <Field name="packagePoLineId">{() => null}</Field>
      <TextField
        data-test-package-line-title
        fullWidth
        id="linkPackageTitle"
        label={<FormattedMessage id="ui-orders.itemDetails.linkPackage" />}
        marginBottom0
        onClearField={onClearField}
        value={title || ''}
      />
      {!disabled && (
        <Pluggable
          addLines={onSelectLine}
          aria-haspopup="true"
          dataKey="find-po-line"
          initialFilters={{ isPackage: ['true'] }}
          isSingleSelect
          type="find-po-line"
          renderTrigger={pluginButton}
        >
          <FormattedMessage id="ui-orders.find-po-line-plugin-unavailable" />
        </Pluggable>
      )}
    </div>
  );
}

PackagePoLineField.manifest = Object.freeze({
  linkedPoLine: {
    ...baseManifest,
    path: `${LINES_API}/!{poLineId}`,
  },
});

PackagePoLineField.propTypes = {
  disabled: PropTypes.bool,
  onSelectLine: PropTypes.func.isRequired,
  poLineId: PropTypes.string,
  resources: PropTypes.object.isRequired,
};

export default stripesConnect(PackagePoLineField, { dataKey: 'linkedPoLine' });
