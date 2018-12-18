import React, { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Button,
  Col,
  Modal,
  Row,
  Select,
  TextArea,
} from '@folio/stripes/components';

import { WORKFLOW_STATUS } from '../../POLine/POLineDetails/FieldWorkflowStatus';
import css from './CloseOrderModal.css';

class CloseOrderModal extends Component {
  static propTypes = {
    orderId: PropTypes.string,
    workflowStatus: PropTypes.string,
    closingReasons: PropTypes.arrayOf(PropTypes.object),
    closeOrderSubmit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      openModal: false,
      reason: '',
      note: '',
    };
  }

  openModal = () => {
    this.setState({
      openModal: true,
    });
  }

  closeModal = () => {
    this.setState({
      openModal: false,
    });
  }

  render() {
    const { orderId, workflowStatus, closingReasons, closeOrderSubmit } = this.props;
    const isVisible = orderId && workflowStatus === WORKFLOW_STATUS.open;
    const reasons = closingReasons.map((reason) => ({
      label: reason.value,
      value: reason.value,
    }));

    if (!isVisible) {
      return null;
    }

    return (
      <Fragment>
        <Button
          buttonStyle="primary"
          marginBottom0
          onClick={this.openModal}
          style={{ marginRight: '10px' }}
        >
          <FormattedMessage id="ui-orders.paneBlock.closeBtn" />
        </Button>
        <Modal
          label={<FormattedMessage id="ui-orders.closeOrderModal.title" values={{ orderId }} />}
          open={this.state.openModal}
        >
          <Row>
            <Col xs={12}>
              <Select
                dataOptions={reasons}
                label={<FormattedMessage id="ui-orders.closeOrderModal.reason" />}
                onChange={e => this.setState({ reason: e.target.value })}
                required
              />
              <TextArea
                label={<FormattedMessage id="ui-orders.closeOrderModal.notes" />}
                onChange={e => this.setState({ note: e.target.value })}
              />
            </Col>
          </Row>
          <Row>
            <Col
              className={css.buttonsLine}
              xs={12}
            >
              <Button
                buttonStyle="primary"
                onClick={() => {
                  closeOrderSubmit(this.state);
                  this.closeModal();
                }}
              >
                <FormattedMessage id="ui-orders.closeOrderModal.submit" />
              </Button>
              <Button onClick={() => this.closeModal()}>
                <FormattedMessage id="ui-orders.closeOrderModal.cancel" />
              </Button>
            </Col>
          </Row>
        </Modal>
      </Fragment>
    );
  }
}

export default CloseOrderModal;
