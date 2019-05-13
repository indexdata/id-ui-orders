import {
  interactor,
  is,
  value,
} from '@bigtest/interactor';

import Button from './button';

@interactor class CheckBox {
  static defaultScope = '[class*=checkboxInput---]';
}

@interactor class BarcodeInput {
  static defaultScope = '[class*=fieldWrapper] input[type="text"]';
  isInput = is('input');
  value = value();
}

export default interactor(class CheckInDetailsModal {
  static defaultScope = '#data-test-check-in-details-modal';
  checkbox = new CheckBox();
  checkInButton = new Button('[data-test-check-in-button]');
  cancelButton = new Button('[data-test-cancel-button]');
  barcodeInput = new BarcodeInput();
});