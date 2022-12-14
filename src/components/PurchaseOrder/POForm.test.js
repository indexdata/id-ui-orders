import React from 'react';
import user from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { MemoryRouter } from 'react-router-dom';

import {
  HasCommand,
  expandAllSections,
  collapseAllSections,
} from '@folio/stripes/components';

import { ORDER_TYPE } from '../../common/constants';
import POForm from './POForm';
import { history } from '../../../test/jest/routerMocks';

jest.mock('@folio/stripes-components/lib/Commander', () => ({
  HasCommand: jest.fn(({ children }) => <div>{children}</div>),
  expandAllSections: jest.fn(),
  collapseAllSections: jest.fn(),
}));
jest.mock('./PODetails/PODetailsForm', () => jest.fn().mockReturnValue('PODetailsForm'));
jest.mock('./OngoingOgderInfo/OngoingInfoForm', () => jest.fn().mockReturnValue('OngoingInfoForm'));

const defaultProps = {
  values: {},
  generatedNumber: '1000',
  initialValues: {},
  pristine: false,
  submitting: false,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  change: jest.fn(),
  handleSubmit: jest.fn(),
  parentResources: {
    orderTemplates: {
      records: [{
        id: 'templateId',
        label: 'label',
        templateName: 'templateName',
        templateCode: 'templateCode',
        locations: [{
          locationId: 'locationId',
        }],
        hiddenFields: { ongoing: { isSubscription: true } },
      }],
    },
  },
  form: {
    change: jest.fn(),
    batch: jest.fn(),
    getRegisteredFields: jest.fn(),
  },
  parentMutator: {},
  history,
};

const renderPOForm = (props = {}) => render(
  <Form
    onSubmit={() => jest.fn()}
    render={() => (
      <POForm
        {...defaultProps}
        {...props}
      />
    )}
  />,
  { wrapper: MemoryRouter },
);

describe('POForm', () => {
  it('should render \'PO form\' fields', () => {
    renderPOForm();

    expect(screen.getByText('ui-orders.settings.orderTemplates.editor.template.name')).toBeInTheDocument();
    expect(screen.getByText(/PODetailsForm/i)).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.totalUnits')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.totalEstimatedPrice')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.approved')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.workflowStatus')).toBeInTheDocument();
  });

  it('should not render Ongoing accordion for non-ongoing order', () => {
    renderPOForm();

    expect(screen.queryByText(/OngoingInfoForm/i)).toBeNull();
  });

  it('should render Ongoing accordion for ongoing order', () => {
    renderPOForm({ initialValues: { orderType: ORDER_TYPE.ongoing } });

    expect(screen.getByText(/OngoingInfoForm/i)).toBeInTheDocument();
  });

  it('should change template when another selected and show hidden fields when \'Show hidden fields\' btn was clicked', async () => {
    renderPOForm();

    const select = await screen.findByLabelText('ui-orders.settings.orderTemplates.editor.template.name');

    user.click(select);

    const options = await screen.findAllByRole('option');

    user.click(options[1]);

    const toggleFieldsVisibility = await screen.findByTestId('toggle-fields-visibility');

    expect(screen.queryByRole('checkbox', {
      name: 'ui-orders.orderSummary.approved',
    })).not.toBeInTheDocument();

    user.click(toggleFieldsVisibility);

    const field = await screen.findByRole('checkbox', {
      name: 'ui-orders.orderSummary.approved',
    });

    expect(field).toBeInTheDocument();
  });
});

describe('POForm shortcuts', () => {
  beforeEach(() => {
    HasCommand.mockClear();
    expandAllSections.mockClear();
    collapseAllSections.mockClear();
  });

  it('should call expandAllSections when expandAllSections shortcut is called', () => {
    renderPOForm();

    HasCommand.mock.calls[0][0].commands.find(c => c.name === 'expandAllSections').handler();

    expect(expandAllSections).toHaveBeenCalled();
  });

  it('should call collapseAllSections when collapseAllSections shortcut is called', () => {
    renderPOForm();

    HasCommand.mock.calls[0][0].commands.find(c => c.name === 'collapseAllSections').handler();

    expect(collapseAllSections).toHaveBeenCalled();
  });
});
