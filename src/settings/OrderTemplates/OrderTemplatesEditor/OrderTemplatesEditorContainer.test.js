import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Form } from 'react-final-form';
import { MemoryRouter } from 'react-router-dom';

import OrderTemplatesEditorContainer from './OrderTemplatesEditorContainer';
import OrderTemplatesEditor from './OrderTemplatesEditor';

jest.mock('./OrderTemplatesEditor', () => jest.fn().mockReturnValue('OrderTemplatesEditor'));

const defaultProps = {
  close: jest.fn(),
  resources: {
    locations: {
      records: [{
        id: 'locationId',
      }],
    },
    identifierTypes: {
      records: [{
        id: 'typeId',
        name: 'ISBN',
      }],
    },
    contributorNameTypes: {
      records: [{
        id: 'contributorId',
        name: 'contributorName',
      }],
    },
    fund: {
      records: [{
        id: 'fundId',
        name: 'fundName',
        code: 'fundCode',
      }],
    },
    createInventory: {
      records: [{
        value: {},
      }],
    },
    vendors: {
      records: [{
        isVendor: true,
        status: 'Active',
        accounts: [{
          name: 'accountName',
          accountNo: 'accountNo',
        }],
      }],
    },
    prefixesSetting: {
      records: [{
        name: 'prefixName',
      }],
    },
    suffixesSetting: {
      records: [{
        name: 'suffixName',
      }],
    },
  },
  mutator: {
    orderTemplate: {
      PUT: jest.fn().mockResolvedValue([]),
      POST: jest.fn().mockResolvedValue([]),
    },
  },
};

const renderOrderTemplatesEditorContainer = (props = {}) => render(
  <Form
    onSubmit={() => jest.fn()}
    render={() => (
      <OrderTemplatesEditorContainer
        {...defaultProps}
        {...props}
      />
    )}
  />,
  { wrapper: MemoryRouter },
);

describe('OrderTemplatesEditorContainer', () => {
  it('should render order templates editor', async () => {
    renderOrderTemplatesEditorContainer();

    const editor = await screen.findByText('OrderTemplatesEditor');

    expect(editor).toBeInTheDocument();
  });

  it('should save template when form was submitted', async () => {
    renderOrderTemplatesEditorContainer();

    await waitFor(() => OrderTemplatesEditor.mock.calls[0][0].onSubmit());

    expect(defaultProps.mutator.orderTemplate.POST).toHaveBeenCalled();
  });
});
