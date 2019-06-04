import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { IfPermission } from '@folio/stripes/core';
import {
  Accordion,
  AccordionSet,
  Button,
  Col,
  ConfirmationModal,
  ExpandAllButton,
  Icon,
  IconButton,
  MenuSection,
  Pane,
  PaneMenu,
  Row,
} from '@folio/stripes/components';

import {
  isCheckInAvailableForLine,
  isReceiveAvailableForLine,
} from '../PurchaseOrder/util';

import LocationView from './Location/LocationView';
import { POLineDetails } from './POLineDetails';
import CostView from './Cost/CostView';
import VendorView from './Vendor/VendorView';
import FundDistributionView from './FundDistribution/FundDistributionView';
import EresourcesView from './Eresources/EresourcesView';
import ItemView from './Item/ItemView';
import PhysicalView from './Physical/PhysicalView';
import { OtherView } from './Other';
import {
  ACCORDION_ID,
  ERESOURCES,
  PHRESOURCES,
  OTHER,
} from './const';

class POLineView extends Component {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    poURL: PropTypes.string,
    locations: PropTypes.arrayOf(PropTypes.object),
    order: PropTypes.object,
    line: PropTypes.object,
    materialTypes: PropTypes.arrayOf(PropTypes.object),
    vendors: PropTypes.arrayOf(PropTypes.object),
    funds: PropTypes.arrayOf(PropTypes.object),
    receivingURL: PropTypes.string.isRequired,
    checkinURL: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    editable: PropTypes.bool,
    goToOrderDetails: PropTypes.func,
    queryMutator: PropTypes.object,
    deleteLine: PropTypes.func,
  }

  static defaultProps = {
    locations: [],
    materialTypes: [],
    vendors: [],
    funds: [],
    editable: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      sections: {
        CostDetails: false,
        Vendor: false,
        FundDistribution: false,
        ItemDetails: true,
        Renewal: false,
        [ACCORDION_ID.eresources]: false,
        [ACCORDION_ID.location]: false,
        [ACCORDION_ID.other]: false,
        [ACCORDION_ID.physical]: false,
      },
      showConfirmDelete: false,
    };
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

  onEditPOLine = (e) => {
    if (e) e.preventDefault();
    const { queryMutator } = this.props;

    queryMutator.update({ layer: 'edit-po-line' });
  }

  mountDeleteLineConfirm = () => this.setState({ showConfirmDelete: true });

  unmountDeleteLineConfirm = () => this.setState({ showConfirmDelete: false });

  getActionMenu = ({ onToggle }) => {
    const { goToOrderDetails, editable } = this.props;

    // TODO: unify actions after Order Lines list is implemented fully
    return (
      <MenuSection id="data-test-line-details-actions">
        <IfPermission perm="orders.po-lines.item.delete">
          <Button
            buttonStyle="dropdownItem"
            data-test-button-delete-line
            onClick={() => {
              onToggle();
              this.mountDeleteLineConfirm();
            }}
          >
            <Icon size="small" icon="trash">
              <FormattedMessage id="ui-orders.button.delete" />
            </Icon>
          </Button>
        </IfPermission>
        {editable && (
          <IfPermission perm="orders.po-lines.item.put">
            <Button
              buttonStyle="dropdownItem"
              data-test-button-edit-line
              onClick={() => {
                onToggle();
                this.onEditPOLine();
              }}
            >
              <Icon size="small" icon="edit">
                <FormattedMessage id="ui-orders.button.edit" />
              </Icon>
            </Button>
          </IfPermission>
        )}
        {goToOrderDetails && (
          <Button
            data-test-line-details-actions-view-po
            buttonStyle="dropdownItem"
            onClick={() => {
              onToggle();
              goToOrderDetails();
            }}
          >
            <Icon icon="eye-open">
              <FormattedMessage id="ui-orders.poLine.actions.viewPO" />
            </Icon>
          </Button>
        )}
      </MenuSection>
    );
  };

  backToOrder = () => {
    const { poURL, queryMutator } = this.props;

    queryMutator.update({ _path: poURL });
  }

  render() {
    const {
      onClose,
      poURL,
      receivingURL,
      checkinURL,
      order,
      line,
      materialTypes,
      locations,
      vendors,
      funds,
      editable,
      deleteLine,
    } = this.props;

    const firstMenu = (
      <PaneMenu>
        <IconButton
          icon="arrow-left"
          id="clickable-backToPO"
          onClick={this.backToOrder}
          title="Back to PO"
        />
      </PaneMenu>);
    const lastMenu = (
      <PaneMenu>
        <IfPermission perm="orders.po-lines.item.put">
          {
            editable && (
              <IconButton
                icon="edit"
                id="clickable-edit-po-line"
                onClick={this.onEditPOLine}
                title="Edit PO Line"
              />
            )
          }
        </IfPermission>
      </PaneMenu>
    );

    if (!(line && order)) {
      return (
        <Pane id="pane-poLineDetails" defaultWidth="fill" paneTitle="PO Line Details" lastMenu={lastMenu} dismissible>
          <div style={{ paddingTop: '1rem' }}><Icon icon="spinner-ellipsis" width="100px" /></div>
        </Pane>
      );
    }

    const orderFormat = get(line, 'orderFormat');
    const poLineNumber = line.poLineNumber;
    const showEresources = ERESOURCES.includes(orderFormat);
    const showPhresources = PHRESOURCES.includes(orderFormat);
    const showOther = orderFormat === OTHER;
    const isReceiveButtonVisible = isReceiveAvailableForLine(line, order);
    const isCheckInButtonVisible = isCheckInAvailableForLine(line, order);

    return (
      <Pane
        defaultWidth="fill"
        firstMenu={poURL ? firstMenu : null}
        actionMenu={this.getActionMenu}
        dismissible={Boolean(onClose)}
        onClose={onClose}
        id="pane-poLineDetails"
        lastMenu={lastMenu}
        paneTitle="PO Line Details"
      >
        <Row end="xs">
          <Col xs>
            {isReceiveButtonVisible && (
              <div>
                <Button
                  buttonStyle="primary"
                  data-test-line-receive-button
                  to={receivingURL}
                >
                  <FormattedMessage id="ui-orders.paneBlock.receiveBtn" />
                </Button>
              </div>
            )}
            {isCheckInButtonVisible && (
              <div>
                <Button
                  buttonStyle="primary"
                  data-test-line-check-in-button
                  to={checkinURL}
                >
                  <FormattedMessage id="ui-orders.paneBlock.checkInBtn" />
                </Button>
              </div>
            )}
          </Col>
        </Row>
        <AccordionSet
          accordionStatus={this.state.sections}
          onToggle={this.onToggleSection}
        >
          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.itemDetails" />}
            id="ItemDetails"
          >
            <ItemView poLineDetails={line} />
          </Accordion>
          <POLineDetails
            initialValues={line}
            {...this.props}
          />
          <Row end="xs">
            <Col xs>
              <ExpandAllButton
                accordionStatus={this.state.sections}
                onToggle={this.handleExpandAll}
              />
            </Col>
          </Row>
          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.cost" />}
            id="CostDetails"
          >
            <CostView
              cost={line.cost}
              {...this.props}
            />
          </Accordion>
          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.vendor" />}
            id="Vendor"
          >
            <VendorView
              vendorDetail={line.vendorDetail}
              {...this.props}
            />
          </Accordion>
          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.fund" />}
            id="FundDistribution"
          >
            <FundDistributionView
              line={line}
              funds={funds}
            />
          </Accordion>
          {showEresources && (
            <Accordion
              label={<FormattedMessage id="ui-orders.line.accordion.eresource" />}
              id={ACCORDION_ID.eresources}
            >
              <EresourcesView
                line={line}
                materialTypes={materialTypes}
                order={order}
                vendors={vendors}
              />
            </Accordion>
          )}
          {showPhresources && (
            <Accordion
              label={<FormattedMessage id="ui-orders.line.accordion.physical" />}
              id={ACCORDION_ID.physical}
            >
              <PhysicalView
                materialTypes={materialTypes}
                physical={get(line, 'physical', {})}
                vendors={vendors}
              />
            </Accordion>
          )}
          {showOther && (
            <Accordion
              label={<FormattedMessage id="ui-orders.line.accordion.other" />}
              id={ACCORDION_ID.other}
            >
              <OtherView
                materialTypes={materialTypes}
                physical={get(line, 'physical', {})}
                vendors={vendors}
              />
            </Accordion>
          )}
          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.location" />}
            id={ACCORDION_ID.location}
          >
            <LocationView
              lineLocations={line.locations}
              locations={locations}
            />
          </Accordion>
        </AccordionSet>
        {this.state.showConfirmDelete && (
          <ConfirmationModal
            id="delete-line-confirmation"
            confirmLabel={<FormattedMessage id="ui-orders.order.delete.confirmLabel" />}
            heading={<FormattedMessage id="ui-orders.order.delete.heading" values={{ orderNumber: poLineNumber }} />}
            message={<FormattedMessage id="ui-orders.line.delete.message" />}
            onCancel={this.unmountDeleteLineConfirm}
            onConfirm={deleteLine}
            open
          />
        )}
      </Pane>
    );
  }
}

export default POLineView;