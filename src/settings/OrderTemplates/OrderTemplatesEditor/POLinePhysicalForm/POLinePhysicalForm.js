import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  Row,
  Col,
} from '@folio/stripes/components';

import {
  FieldMaterialSupplier,
  FieldMaterialType,
  FieldReceiptDue,
  FieldExpectedReceiptDate,
  FieldsVolume,
} from '../../../../common/POLFields';
import InventoryRecordTypeSelectField from '../../../InventoryRecordTypeSelectField';

const POLinePhysicalForm = ({ materialTypes, vendors }) => {
  return (
    <Fragment>
      <Row>
        <Col
          xs={3}
          data-col-order-template-fresources-material-supplier
        >
          <FieldMaterialSupplier vendors={vendors} />
        </Col>

        <Col
          xs={3}
          data-col-order-template-fresources-receipt-due
        >
          <FieldReceiptDue />
        </Col>

        <Col
          xs={3}
          data-col-order-template-fresources-expected-receipt-date
        >
          <FieldExpectedReceiptDate />
        </Col>

        <Col xs={3}>
          <InventoryRecordTypeSelectField
            label="ui-orders.physical.createInventory"
            name="physical.createInventory"
          />
        </Col>

        <Col
          xs={3}
          data-col-order-template-fresources-material-type
        >
          <FieldMaterialType
            materialTypes={materialTypes}
            name="physical.materialType"
            required={false}
          />
        </Col>
      </Row>

      <Row start="xs">
        <Col
          xs={3}
          data-col-order-template-fresources-volumes
        >
          <FieldsVolume />
        </Col>
      </Row>
    </Fragment>
  );
};

POLinePhysicalForm.propTypes = {
  materialTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vendors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default POLinePhysicalForm;
