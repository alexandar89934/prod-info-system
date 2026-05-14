import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchCustomerOrderById, addOrderLine, deleteOrderLine } from '@/state/customerOrder/customerOrder.actions';
import {
  selectCurrentCustomerOrder,
  selectCustomerOrderError,
  selectCustomerOrderLoading,
  selectCustomerOrderSuccess,
} from '@/state/customerOrder/customerOrder.selectors';
import { clearError, clearSuccess } from '@/state/customerOrder/customerOrder.slice';
import { fetchProductionPlansByOrder } from '@/state/productionPlan/productionPlan.actions';
import { selectProductionPlansByOrder } from '@/state/productionPlan/productionPlan.selectors';
import { ProductionPlan } from '@/state/productionPlan/productionPlan.types';
import { fetchItems } from '@/state/item/item.actions';
import { selectItems } from '@/state/item/item.selectors';
import { useAppDispatch } from '@/state/hooks';

const planStatusColor = (status: string) => {
  if (status === 'in_progress') return 'warning' as const;
  if (status === 'done') return 'success' as const;
  if (status === 'cancelled') return 'error' as const;
  return 'default' as const;
};

const orderStatusColor = (status: string) => {
  if (status === 'fulfilled') return 'success' as const;
  if (status === 'in_plan') return 'warning' as const;
  return 'default' as const;
};

const CustomerOrderPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const order = useSelector(selectCurrentCustomerOrder);
  const loading = useSelector(selectCustomerOrderLoading);
  const error = useSelector(selectCustomerOrderError);
  const success = useSelector(selectCustomerOrderSuccess);
  const plansByOrder = useSelector(selectProductionPlansByOrder);
  const items = useSelector(selectItems);

  const [showAddLine, setShowAddLine] = useState(false);
  const [newItemId, setNewItemId] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerOrderById(id));
      dispatch(fetchProductionPlansByOrder(id));
    }
    dispatch(fetchItems({ page: 1, limit: 500, search: '' }));
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const plansForLine = (lineId: string): ProductionPlan[] =>
    plansByOrder.filter((p) => p.customerOrderLineId === lineId);

  const handleAddLine = async () => {
    if (!id || !newItemId || !newQuantity) return;
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 1) return;
    const result = await dispatch(addOrderLine({ customerOrderId: id, itemId: newItemId, quantity: qty }));
    if (addOrderLine.fulfilled.match(result)) {
      setNewItemId('');
      setNewQuantity('');
      setShowAddLine(false);
    }
  };

  const handleDeleteLine = (lineId: string) => {
    if (!id) return;
    dispatch(deleteOrderLine({ customerOrderId: id, lineId }));
  };

  if (loading && !order) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  }
  if (!order) return null;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          size="small"
        >
          {t('customerOrder.detail.back')}
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{order.orderNumber}</Typography>
            <Typography variant="body2" color="text.secondary">{order.customerName}</Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Chip label={t(`customerOrder.status.${order.status}`)} color={orderStatusColor(order.status)} />
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/editCustomerOrder/${order.id}`)}
            >
              {t('common.edit')}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={0.75}>
          {order.deliveryDate && (
            <Box display="flex" gap={1}>
              <Typography variant="body2" color="text.secondary" minWidth={160}>{t('customerOrder.form.deliveryDate')}:</Typography>
              <Typography variant="body2">{new Date(order.deliveryDate).toLocaleDateString()}</Typography>
            </Box>
          )}
          {order.notes && (
            <Box display="flex" gap={1}>
              <Typography variant="body2" color="text.secondary" minWidth={160}>{t('customerOrder.form.notes')}:</Typography>
              <Typography variant="body2">{order.notes}</Typography>
            </Box>
          )}
          <Box display="flex" gap={1}>
            <Typography variant="body2" color="text.secondary" minWidth={160}>{t('customerOrder.detail.created')}:</Typography>
            <Typography variant="body2">{new Date(order.createdAt).toLocaleString()}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h6">{t('customerOrder.detail.lines')}</Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setShowAddLine((v) => !v)}
        >
          {t('customerOrder.detail.addLine')}
        </Button>
      </Box>

      {showAddLine && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" mb={1.5}>{t('customerOrder.detail.addLineTitle')}</Typography>
          <Box display="flex" gap={1.5} alignItems="flex-start" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel>{t('customerOrder.form.selectItem')}</InputLabel>
              <Select
                value={newItemId}
                label={t('customerOrder.form.selectItem')}
                onChange={(e: SelectChangeEvent) => setNewItemId(e.target.value)}
              >
                <MenuItem value="" disabled><em>{t('customerOrder.form.selectItem')}</em></MenuItem>
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id ?? ''}>
                    {item.itemCode} — {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('customerOrder.form.quantity')}
              type="number"
              size="small"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              inputProps={{ min: 1 }}
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              size="small"
              disabled={!newItemId || !newQuantity || loading}
              onClick={handleAddLine}
            >
              {t('customerOrder.detail.addLineConfirm')}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => { setShowAddLine(false); setNewItemId(''); setNewQuantity(''); }}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        </Paper>
      )}

      <Stack spacing={2}>
        {order.lines?.length === 0 && (
          <Typography variant="body2" color="text.secondary">{t('customerOrder.detail.noLines')}</Typography>
        )}

        {order.lines?.map((line, idx) => {
          const linePlans = plansForLine(line.id);
          const hasActivePlans = linePlans.some((p) => p.status === 'in_progress' || p.status === 'queued');
          return (
            <Paper key={line.id} variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={linePlans.length > 0 ? 1.5 : 0}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('customerOrder.detail.line')} {idx + 1}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="body1" fontWeight={600}>{line.itemCode} — {line.itemName}</Typography>
                    {linePlans.length > 0 && (
                      <Chip
                        size="small"
                        label={
                          linePlans.some(p => p.status === 'in_progress')
                            ? t('productionPlan.status.in_progress')
                            : linePlans.every(p => p.status === 'done')
                              ? t('productionPlan.status.done')
                              : t('customerOrder.detail.planned')
                        }
                        color={
                          linePlans.some(p => p.status === 'in_progress')
                            ? 'warning'
                            : linePlans.every(p => p.status === 'done')
                              ? 'success'
                              : 'info'
                        }
                      />
                    )}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box textAlign="right">
                    <Typography variant="body2" color="text.secondary">{t('customerOrder.form.quantity')}</Typography>
                    <Typography variant="h6" fontWeight={700}>{line.quantity.toLocaleString()}</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      navigate(`/addProductionPlan?orderLineId=${line.id}&itemId=${line.itemId}&quantity=${line.quantity}&orderId=${id}`)
                    }
                  >
                    {t('customerOrder.detail.plan')}
                  </Button>
                  <Tooltip title={hasActivePlans ? t('customerOrder.detail.cannotDeleteLine') : t('customerOrder.detail.deleteLine')}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={hasActivePlans || loading}
                        onClick={() => handleDeleteLine(line.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>

              {linePlans.length > 0 && (
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', mb: 0.75 }}>
                    {t('customerOrder.detail.existingPlans')}
                  </Typography>
                  <Stack spacing={0.5}>
                    {linePlans.map((plan) => (
                      <Box
                        key={plan.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          py: 0.75,
                          px: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: theme.palette.action.hover },
                        }}
                        onClick={() => navigate(`/production-plan`)}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 28, fontWeight: 700 }}>
                          #{plan.position}
                        </Typography>
                        <Box flexGrow={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {plan.machineName} #{plan.machineNumber}
                          </Typography>
                          {plan.expectedStartDate && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(plan.expectedStartDate).toLocaleDateString()}
                              {plan.expectedEndDate && ` – ${new Date(plan.expectedEndDate).toLocaleDateString()}`}
                            </Typography>
                          )}
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2">{plan.quantity.toLocaleString()}</Typography>
                        </Box>
                        <Chip
                          label={t(`productionPlan.status.${plan.status}`)}
                          color={planStatusColor(plan.status)}
                          size="small"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerOrderPage;