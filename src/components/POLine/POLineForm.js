import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import {
  getFormSyncErrors,
  getFormValues,
} from 'redux-form';
import { FormattedMessage } from 'react-intl';

import { IfPermission } from '@folio/stripes/core';
import {
  Accordion,
  AccordionSet,
  Button,
  Col,
  ExpandAllButton,
  Icon,
  Pane,
  PaneMenu,
  Row,
} from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';

import { EresourcesForm } from './Eresources';
import { PhysicalForm } from './Physical';
import { POLineDetailsForm } from './POLineDetails';
import { VendorForm } from './Vendor';
import { CostForm } from './Cost';
import { FundDistributionForm } from './FundDistribution';
import { ItemForm } from './Item';
import {
  ACCORDION_ID,
  ERESOURCES,
  MAP_FIELD_ACCORDION,
  PHRESOURCES,
} from './const';
import getVendorsForSelect from '../Utils/getVendorsForSelect';

class POLineForm extends Component {
  static propTypes = {
    initialValues: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    stripes: PropTypes.shape({
      store: PropTypes.object.isRequired,
    }).isRequired,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    parentResources: PropTypes.object,
    parentMutator: PropTypes.object,
    poURL: PropTypes.string,
    location: PropTypes.object.isRequired,
    deletePOLine: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      sections: {
        [ACCORDION_ID.lineDetails]: true,
        [ACCORDION_ID.costDetails]: true,
        [ACCORDION_ID.vendor]: false,
        [ACCORDION_ID.eresources]: false,
        [ACCORDION_ID.itemDetails]: false,
        [ACCORDION_ID.physical]: false,
        [ACCORDION_ID.fundDistribution]: false,
      },
    };
  }

  static getDerivedStateFromProps({ stripes: { store } }, { sections }) {
    const errorKeys = Object.keys(getFormSyncErrors('POLineForm')(store.getState()));

    if (errorKeys.length > 0) {
      const newSections = { ...sections };

      errorKeys.forEach(key => {
        const accordionName = MAP_FIELD_ACCORDION[key];

        if (accordionName) {
          newSections[accordionName] = true;
        }
      });

      return { sections: newSections };
    }

    return null;
  }

  getAddFirstMenu = () => {
    const { onCancel } = this.props;

    return (
      <PaneMenu>
        <FormattedMessage id="ui-orders.buttons.line.close">
          {(title) => (
            <button
              aria-label={<FormattedMessage id="ui-orders.buttons.line.closeDialog" />}
              id="clickable-close-new-line-dialog"
              onClick={onCancel}
              title={title}
              type="button"
            >
              <span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }}>&times;</span>
            </button>
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  }

  getLastMenu = (id, label) => {
    const { pristine, submitting, handleSubmit } = this.props;

    return (
      <PaneMenu>
        <IfPermission perm="po_line.item.post">
          <Button
            id={id}
            type="submit"
            disabled={pristine || submitting}
            onClick={handleSubmit}
            style={{ marginBottom: '0', marginRight: '10px' }}
          >
            {label}
          </Button>
        </IfPermission>
      </PaneMenu>
    );
  }

  onToggleSection = ({ id }) => {
    this.setState(({ sections }) => {
      const isSectionOpened = sections[id];

      return {
        sections: {
          ...sections,
          [id]: !isSectionOpened,
        },
      };
    });
  }

  handleExpandAll = (sections) => {
    this.setState({ sections });
  }

  render() {
    const { initialValues, onCancel, deletePOLine, stripes: { store } } = this.props;
    const lineId = get(initialValues, 'id');
    const lineNumber = get(initialValues, 'po_line_number', '');
    const firstMenu = this.getAddFirstMenu();
    const paneTitle = lineId
      ? <FormattedMessage id="ui-orders.line.paneTitle.edit" values={{ lineNumber }} />
      : <FormattedMessage id="ui-orders.line.paneTitle.new" />;
    const lastMenu = lineId ?
      this.getLastMenu('clickable-updatePoLine', <FormattedMessage id="ui-orders.buttons.line.update" />) :
      this.getLastMenu('clickable-createnewPoLine', <FormattedMessage id="ui-orders.buttons.line.create" />);
    const showDeleteButton = lineId || false;

    if (!initialValues) {
      return (

        <Pane
          id="pane-podetails"
          defaultWidth="fill"
          paneTitle={<FormattedMessage id="ui-orders.line.paneTitle.details" />}
          firstMenu={firstMenu}
          lastMenu={lastMenu}
        >
          <div style={{ paddingTop: '1rem' }}>
            <Icon
              icon="spinner-ellipsis"
              width="100px"
            />
          </div>
        </Pane>
      );
    }

    const formValues = getFormValues('POLineForm')(store.getState());
    const orderFormat = get(formValues, 'order_format');
    const showEresources = ERESOURCES.includes(orderFormat);
    const showPhresources = PHRESOURCES.includes(orderFormat);
    const vendors = getVendorsForSelect(this.props.parentResources);

    return (
      <Pane
        id="pane-poLineForm"
        data-test-line-edit
        defaultWidth="fill"
        paneTitle={paneTitle}
        lastMenu={lastMenu}
        onClose={onCancel}
        firstMenu={firstMenu}
      >
        <form id="form-po-line">
          <Row>
            <Col xs={12}>
              <Row center="xs">
                <Col xs={12} md={8}>
                  <Row end="xs">
                    <Col xs={12}>
                      <ExpandAllButton
                        accordionStatus={this.state.sections}
                        onToggle={this.handleExpandAll}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col xs={12} md={8} style={{ textAlign: 'left' }}>
                  <AccordionSet
                    accordionStatus={this.state.sections}
                    onToggle={this.onToggleSection}
                  >
                    <Accordion
                      label={<FormattedMessage id="ui-orders.line.accordion.details" />}
                      id={ACCORDION_ID.lineDetails}
                    >
                      <POLineDetailsForm {...this.props} />
                    </Accordion>
                    <Accordion
                      label={<FormattedMessage id="ui-orders.line.accordion.cost" />}
                      id={ACCORDION_ID.costDetails}
                    >
                      <CostForm {...this.props} />
                    </Accordion>
                    <Accordion
                      label={<FormattedMessage id="ui-orders.line.accordion.vendor" />}
                      id={ACCORDION_ID.vendor}
                    >
                      <VendorForm {...this.props} />
                    </Accordion>
                    {showEresources && (
                      <Accordion
                        label={<FormattedMessage id="ui-orders.line.accordion.eresource" />}
                        id={ACCORDION_ID.eresources}
                      >
                        <EresourcesForm {...this.props} />
                      </Accordion>
                    )}
                    {showPhresources && (
                      <Accordion
                        label={<FormattedMessage id="ui-orders.line.accordion.physical" />}
                        id={ACCORDION_ID.physical}
                      >
                        <PhysicalForm
                          {...this.props}
                          vendors={vendors}
                        />
                      </Accordion>
                    )}
                    <Accordion
                      label={<FormattedMessage id="ui-orders.line.accordion.fund" />}
                      id={ACCORDION_ID.fundDistribution}
                    >
                      <FundDistributionForm {...this.props} />
                    </Accordion>
                    <Accordion
                      label={<FormattedMessage id="ui-orders.line.accordion.itemDetails" />}
                      id={ACCORDION_ID.itemDetails}
                    >
                      <ItemForm {...this.props} />
                    </Accordion>
                  </AccordionSet>
                  <IfPermission perm="po_line.item.delete">
                    <Row end="xs">
                      <Col xs={12}>
                        {
                          showDeleteButton &&
                          <Button
                            type="button"
                            buttonStyle="danger"
                            onClick={() => { deletePOLine(lineId); }}
                          >
                            <FormattedMessage id="ui-orders.buttons.line.delete" values={{ lineNumber }} />
                          </Button>
                        }
                      </Col>
                    </Row>
                  </IfPermission>
                </Col>
              </Row>
            </Col>
          </Row>
        </form>
      </Pane>
    );
  }
}

export default stripesForm({
  form: 'POLineForm',
  navigationCheck: true,
  enableReinitialize: true,
})(POLineForm);
