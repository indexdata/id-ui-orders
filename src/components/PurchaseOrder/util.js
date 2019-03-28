import { some } from 'lodash';

import { WORKFLOW_STATUS } from './Summary/FieldWorkflowStatus';
import { RECEIPT_STATUS } from '../POLine/POLineDetails/FieldReceiptStatus';

const isLineAbleToBeReceived = (line = { cost: {} }) => {
  const isNotCheckin = !line.checkinItems;
  const hasQuantity = Boolean(line.cost.quantityPhysical || line.cost.quantityElectronic);
  const hasCorrectReceiptStatus = !([
    RECEIPT_STATUS.pending,
    RECEIPT_STATUS.receiptNotRequired,
  ].includes(line.receiptStatus));

  return isNotCheckin && hasQuantity && hasCorrectReceiptStatus;
};

const isWorkflowStatusOpen = (order) => {
  const { workflowStatus } = order;

  return workflowStatus === WORKFLOW_STATUS.open;
};

export const isReceiveAvailableForLine = (line = {}, order = {}) => {
  const hasLineItemsToReceive = isLineAbleToBeReceived(line);

  return hasLineItemsToReceive && isWorkflowStatusOpen(order);
};

export const isCheckInAvailableForLine = (line = {}, order = {}) => {
  return line.checkinItems && isWorkflowStatusOpen(order);
};

export const isReceiveAvailableForOrder = (order = {}) => {
  const { compositePoLines = [] } = order;
  const hasLineItemsToReceive = some(compositePoLines, isLineAbleToBeReceived);

  return hasLineItemsToReceive && isWorkflowStatusOpen(order);
};

const EMPTY_OPTION = {
  label: '',
  value: '',
};

export const addEmptyOption = (options = []) => [EMPTY_OPTION, ...options];
