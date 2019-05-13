import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Field,
} from 'redux-form';

import { includes } from 'lodash';

import {
  Button,
  Checkbox,
  Col,
  Modal,
  ModalFooter,
  Row,
  Select,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';
import stripesForm from '@folio/stripes/form';

import { EMPTY_OPTION } from '../Utils/const';
import { INVENTORY_RECORDS_TYPE } from '../POLine/const';
import { Required } from '../Utils/Validate';
import { ADD_PIECE_MODAL_FORM } from './const';
import FieldPieceFormat from './FieldPieceFormat';

const footer = (close, save, checkIn) => (
  <ModalFooter>
    <Button
      buttonStyle="primary"
      data-test-add-piece-save
      onClick={save}
    >
      <FormattedMessage id="ui-orders.checkIn.buttons.save" />
    </Button>
    <Button
      buttonStyle="primary"
      data-test-add-piece-check-in
      onClick={checkIn}
    >
      <FormattedMessage id="ui-orders.checkIn.buttons.checkIn" />
    </Button>
    <Button
      data-test-add-piece-cancel
      onClick={close}
    >
      <FormattedMessage id="ui-orders.checkIn.buttons.cancel" />
    </Button>
  </ModalFooter>
);

class AddPieceModal extends Component {
  static propTypes = {
    checkIn: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    createInventoryValues: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    stripes: PropTypes.object.isRequired,
    locations: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })),
    showPieceFormatField: PropTypes.bool,
    instanceId: PropTypes.string,
    dispatch: PropTypes.func,
    change: PropTypes.func,
    formValues: PropTypes.object,
  }

  onAddItem = (item = {}) => {
    const { dispatch, change } = this.props;

    if (item.id) {
      dispatch(change('itemId', item.id));
    }
  }

  render() {
    const {
      checkIn,
      close,
      createInventoryValues,
      handleSubmit,
      locations = [],
      showPieceFormatField = false,
      stripes,
      instanceId,
      formValues = {},
    } = this.props;
    const { format, locationId } = formValues;
    const isLocationRequired = includes(createInventoryValues[format], INVENTORY_RECORDS_TYPE.instanceAndHolding);
    const isAddItemRequired = includes(createInventoryValues[format], INVENTORY_RECORDS_TYPE.all);
    let isAddItemButtonDisabled = true;
    let locationFieldProps = {
      dataOptions: [EMPTY_OPTION, ...locations],
    };

    if (isLocationRequired) {
      locationFieldProps = {
        dataOptions: locations,
        placeholder: ' ',
        required: true,
        validate: Required,
      };
    }

    if (locationId && isAddItemRequired) {
      isAddItemButtonDisabled = false;
    }

    const disabledButtonProps = isAddItemButtonDisabled ? { disabled: isAddItemButtonDisabled } : {};

    return (
      <Modal
        id="add-piece-modal"
        label={<FormattedMessage id="ui-orders.checkIn.addPieceModal.title" />}
        footer={footer(close, handleSubmit, checkIn)}
        open
      >
        <form>
          <Row>
            <Col xs>
              <Field
                component={TextField}
                fullWidth
                label={<FormattedMessage id="ui-orders.checkIn.caption" />}
                name="caption"
                required
                type="text"
                validate={Required}
              />
            </Col>
            <Col xs>
              <Field
                component={TextArea}
                fullWidth
                label={<FormattedMessage id="ui-orders.checkIn.comment" />}
                name="comment"
              />
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Field
                component={Select}
                fullWidth
                label={<FormattedMessage id="ui-orders.checkIn.location" />}
                name="locationId"
                {...locationFieldProps}
              />
            </Col>
            <Col xs>
              <Field
                component={Checkbox}
                fullWidth
                label={<FormattedMessage id="ui-orders.checkIn.supplement" />}
                name="supplement"
                type="checkbox"
              />
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Pluggable
                disabled={isAddItemButtonDisabled}
                aria-haspopup="true"
                instanceId={instanceId}
                locationId={locationId}
                searchButtonStyle="default"
                searchLabel={<FormattedMessage id="ui-orders.checkIn.buttons.addItem" />}
                stripes={stripes}
                type="create-item"
                addItem={this.onAddItem}
              >
                <span
                  data-test-add-item
                  {...disabledButtonProps}
                >
                  <FormattedMessage id="ui-orders.errors.noCreateItemPlugin" />
                </span>
              </Pluggable>
            </Col>
            {showPieceFormatField && (
              <Col xs>
                <FieldPieceFormat />
              </Col>
            )}
          </Row>
        </form>
      </Modal>
    );
  }
}

export default stripesForm({
  form: ADD_PIECE_MODAL_FORM,
})(AddPieceModal);