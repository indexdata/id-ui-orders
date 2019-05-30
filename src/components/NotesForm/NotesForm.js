import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import {
  Button,
  Col,
  IconButton,
  TextArea,
} from '@folio/stripes/components';

import { required } from '../Utils/Validate';

const renderNotesField = ({ input, label }) => (
  <Field
    component={TextArea}
    {...input}
    label={label}
  />
);

renderNotesField.propTypes = {
  input: PropTypes.object,
  label: PropTypes.object,
};

const NotesForm = ({ fields }) => (
  <Fragment>
    {fields.map((note, index) => (
      <Fragment key={note.id || index}>
        <Col
          xs={11}
          key={index}
        >
          <Field
            name={note}
            type="text"
            component={renderNotesField}
            validate={required}
          />
        </Col>
        <Col xs={1}>
          <IconButton
            data-test-remove-note-button
            icon="trash"
            onClick={() => fields.remove(index)}
          >
            <FormattedMessage id="ui-orders.orderDetails.removeNoteBtn" />
          </IconButton>
        </Col>
      </Fragment>
    ))}
    <Col xs={12}>
      <Button
        data-test-add-note-button
        onClick={() => fields.push('')}
      >
        <FormattedMessage id="ui-orders.orderDetails.addNoteBtn" />
      </Button>
    </Col>
  </Fragment>
);

NotesForm.displayName = 'NotesForm';

NotesForm.propTypes = {
  fields: PropTypes.object.isRequired,
};

export default NotesForm;
