import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Button,
  Dropdown,
  DropdownMenu,
  Icon,
  IconButton,
  MenuSection,
} from '@folio/stripes/components';

const transformReceivingHistoryToPiece = ({
  id,
  caption,
  comment,
  pieceFormat,
  itemId,
  locationId,
  poLineId,
  receivingStatus,
  supplement,
  receivedDate,
}) => ({
  id,
  caption,
  comment,
  format: pieceFormat,
  itemId,
  locationId,
  poLineId,
  receivingStatus,
  supplement,
  receivedDate,
});

const CheckInItemsActions = ({ showEditPieceModal, deletePiece, receivingHistoryPiece }) => {
  const [open, setOpen] = useState(false);
  const toggleActionMenu = () => setOpen(!open);
  const piece = transformReceivingHistoryToPiece(receivingHistoryPiece);

  return (
    <Dropdown
      id="check-in-actions"
      open={open}
      onToggle={toggleActionMenu}
      hasPadding
      renderTrigger={({ getTriggerProps }) => (
        <IconButton
          {...getTriggerProps()}
          data-role="toggle"
          icon="ellipsis"
        />
      )}
      renderMenu={() => (
        <DropdownMenu
          data-role="menu"
          onToggle={toggleActionMenu}
        >
          <MenuSection id="check-in-items-actions">
            <Button
              buttonStyle="dropdownItem"
              data-test-button-delete-piece
              onClick={() => {
                toggleActionMenu();
                deletePiece(piece);
              }}
            >
              <Icon size="small" icon="trash">
                <FormattedMessage id="ui-orders.button.delete" />
              </Icon>
            </Button>
            <Button
              buttonStyle="dropdownItem"
              data-test-button-edit-piece
              onClick={() => {
                toggleActionMenu();
                showEditPieceModal(piece);
              }}
            >
              <Icon size="small" icon="edit">
                <FormattedMessage id="ui-orders.button.edit" />
              </Icon>
            </Button>
          </MenuSection>
        </DropdownMenu>
      )}
    />
  );
};

CheckInItemsActions.propTypes = {
  showEditPieceModal: PropTypes.func.isRequired,
  deletePiece: PropTypes.func.isRequired,
  receivingHistoryPiece: PropTypes.object.isRequired,
};

export default CheckInItemsActions;
