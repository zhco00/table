import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * 셀 병합 확인 다이얼로그 컴포넌트
 */
const MergeDialog = ({ open, onCancel, onConfirm, targetPart }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="merge-dialog-title"
      aria-describedby="merge-dialog-description"
    >
      <DialogTitle id="merge-dialog-title">셀 병합 확인</DialogTitle>
      <DialogContent>
        <DialogContentText id="merge-dialog-description">
          해당 셀을 {targetPart}에 병합하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          아니요
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          예
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MergeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  targetPart: PropTypes.string,
};

export default MergeDialog;
