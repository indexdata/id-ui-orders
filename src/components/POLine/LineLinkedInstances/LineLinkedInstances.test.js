import React from 'react';
import { act, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useLocation, useHistory } from 'react-router';

import { instance } from '../../../../test/jest/fixtures';
import { location, history } from '../../../../test/jest/routerMocks';

import InstancePlugin from '../Item/InstancePlugin';
import { ACCORDION_ID } from '../const';
import { LineLinkedInstances } from './LineLinkedInstances';
import { useLinkedInstances, useTitleMutation } from './hooks';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn().mockReturnValue('Loading'),
}), { virtual: true });
jest.mock('../Item/InstancePlugin', () => jest.fn().mockReturnValue('InstancePlugin'));
jest.mock('./hooks', () => ({
  useLinkedInstances: jest.fn(),
  useTitleMutation: jest.fn().mockReturnValue({}),
}));

const renderLineLinkedInstances = ({ line = {}, toggleSection = jest.fn(), labelId = 'labelId' }) => (render(
  <LineLinkedInstances
    line={line}
    toggleSection={toggleSection}
    labelId={labelId}
  />,
  { wrapper: MemoryRouter },
));

describe('LineLinkedInstances', () => {
  beforeEach(() => {
    useLinkedInstances.mockClear();
    useTitleMutation.mockClear();

    useHistory.mockClear().mockReturnValue(history);
    useLocation.mockClear().mockReturnValue(location);
  });

  it('displays table with records with fetched instances', () => {
    const linkedInstance = { title: 'ABA', id: 'instanceUid', contributors: 'Mark' };

    useLinkedInstances.mockReturnValue({ isLoading: false, linkedInstances: [linkedInstance] });

    renderLineLinkedInstances({ line: { instanceId: 'instanceUid' } });

    expect(screen.getByText(linkedInstance.title)).toBeInTheDocument();
  });

  it('opens section when loading', () => {
    const toggleSection = jest.fn();

    useLinkedInstances.mockReturnValue({ isLoading: true });

    renderLineLinkedInstances({ toggleSection });

    expect(toggleSection).toHaveBeenCalledWith({ id: ACCORDION_ID.linkedInstances, isOpened: true });
  });

  it('opens section when instances are fetched', () => {
    const toggleSection = jest.fn();

    useLinkedInstances.mockReturnValue({ linkedInstances: [{ id: 'instanceUid' }] });

    renderLineLinkedInstances({ toggleSection });

    expect(toggleSection).toHaveBeenCalledWith({ id: ACCORDION_ID.linkedInstances, isOpened: true });
  });

  it('closes section when no instances are fetched', () => {
    const toggleSection = jest.fn();

    useLinkedInstances.mockReturnValue({ linkedInstances: [] });

    renderLineLinkedInstances({ toggleSection });

    expect(toggleSection).toHaveBeenCalledWith({ id: ACCORDION_ID.linkedInstances, isOpened: false });
  });

  describe('Add title', () => {
    const mutateTitle = jest.fn();

    beforeEach(() => {
      useLinkedInstances.mockReturnValue({ linkedInstances: [{ id: 'instanceUid' }], refetch: jest.fn() });
      useTitleMutation.mockClear().mockReturnValue({ mutateTitle });
      mutateTitle.mockClear().mockReturnValue(Promise.resolve());
    });

    it('should call mutateTitle when add instance action is called', async () => {
      renderLineLinkedInstances({ line: { id: 'lineId', isPackage: true } });

      await screen.findByText('InstancePlugin');

      await act(async () => {
        await InstancePlugin.mock.calls[0][0].addInstance(instance);
      });

      expect(mutateTitle).toHaveBeenCalled();
    });
  });

  describe('Row select', () => {
    it('should not open receiving title edit form when instance title is clicked', () => {
      const linkedInstance = { title: 'ABA', id: 'instanceUid', contributors: 'Mark' };

      useLinkedInstances.mockReturnValue({ isLoading: false, linkedInstances: [linkedInstance] });

      renderLineLinkedInstances({ line: { instanceId: 'instanceUid' } });

      user.click(screen.getByText(linkedInstance.title));

      expect(history.push).not.toHaveBeenCalled();
    });

    it('should open receiving title edit form when instance row is clicked', () => {
      const linkedInstance = { title: 'ABA', id: 'instanceUid', contributors: 'Mark', receivingTitle: { id: 'titleId' } };

      useLinkedInstances.mockReturnValue({ isLoading: false, linkedInstances: [linkedInstance] });

      renderLineLinkedInstances({ line: { instanceId: 'instanceUid' } });

      user.click(screen.getByText(linkedInstance.contributors));

      expect(history.push).toHaveBeenCalled();
    });
  });
});
