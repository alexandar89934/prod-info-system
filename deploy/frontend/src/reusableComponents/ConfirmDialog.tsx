import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
}: ConfirmDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ color: theme.palette.primary[200], m: '20px' }}
          onClick={onClose}
          color="primary"
        >
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} color="error">
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
