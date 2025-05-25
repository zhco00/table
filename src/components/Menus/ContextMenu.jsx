import { Menu, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * 컨텍스트 메뉴 컴포넌트
 */
const ContextMenu = ({
  contextMenu,
  onClose,
  onAddRow,
  onMergeRows,
  onUnmergeRows,
  onDeleteRow,
  onDeleteSelectedRows,
}) => {
  if (!contextMenu) return null;

  return (
    <Menu
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
      }
    >
      <MenuItem
        onClick={() => {
          onAddRow(contextMenu.rowIndex);
          onClose();
        }}
      >
        Add Row Below
      </MenuItem>
      <MenuItem
        onClick={() => {
          onMergeRows();
          onClose();
        }}
      >
        병합
      </MenuItem>
      <MenuItem
        onClick={() => {
          onUnmergeRows();
          onClose();
        }}
      >
        병합 해제
      </MenuItem>
      <MenuItem
        onClick={() => {
          onDeleteRow(contextMenu.rowIndex);
          onClose();
        }}
      >
        단일 행 삭제
      </MenuItem>
      <MenuItem
        onClick={() => {
          onDeleteSelectedRows();
          onClose();
        }}
      >
        선택된 행 삭제
      </MenuItem>
    </Menu>
  );
};

ContextMenu.propTypes = {
  contextMenu: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAddRow: PropTypes.func.isRequired,
  onMergeRows: PropTypes.func.isRequired,
  onUnmergeRows: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
  onDeleteSelectedRows: PropTypes.func.isRequired,
};

export default ContextMenu;
