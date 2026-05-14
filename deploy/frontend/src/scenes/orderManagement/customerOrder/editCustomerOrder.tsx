import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { fetchCustomerOrderById, updateCustomerOrder } from '@/state/customerOrder/customerOrder.actions';
import {
  selectCurrentCustomerOrder,
  selectCustomerOrderError,
  selectCustomerOrderLoading,
} from '@/state/customerOrder/customerOrder.selectors';
import { fetchCompaniesList } from '@/state/company/company.actions';
import { selectCompaniesList } from '@/state/company/company.selectors';
import { useAppDispatch } from '@/state/hooks';
import { createPlanAction } from '@/state/productionPlanAction/productionPlanAction.actions';
import { getName } from '@/state/auth/auth.selectors';
import { CustomerOrderStatus } from '@/state/customerOrder/customerOrder.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const editSchema = z.object({
  customerId: z.string().uuid('Select a customer'),
  deliveryDate: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  status: z.enum(['open', 'in_plan', 'fulfilled']),
});

type EditFormData = z.infer<typeof editSchema>;

const EditCustomerOrder = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectCustomerOrderLoading);
  const error = useSelector(selectCustomerOrderError);
  const order = useSelector(selectCurrentCustomerOrder);
  const companiesList = useSelector(selectCompaniesList);

  const { handleSubmit, control, reset, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { customerId: '', deliveryDate: null, notes: null, status: 'open' },
  });

  useEffect(() => {
    if (id) dispatch(fetchCustomerOrderById(id));
    dispatch(fetchCompaniesList());
  }, [dispatch, id]);

  useEffect(() => {
    if (order) {
      reset({
        customerId: order.customerId,
        deliveryDate: order.deliveryDate ?? null,
        notes: order.notes ?? null,
        status: order.status,
      });
    }
  }, [order, reset]);

  const onSubmit = async (data: EditFormData) => {
    if (!id) return;
    const result = await dispatch(updateCustomerOrder({
      id,
      customerId: data.customerId,
      deliveryDate: data.deliveryDate ?? null,
      notes: data.notes ?? null,
      status: data.status,
      lines: order?.lines?.map((l) => ({ itemId: l.itemId, quantity: l.quantity })) ?? [],
    }));
    if (updateCustomerOrder.fulfilled.match(result)) {
      dispatch(createPlanAction({
        customerOrderId: id,
        actionType: 'order_updated',
        performedByName: getName() ?? undefined,
      }));
      navigate(`/customer-order/${id}`);
    }
  };

  const cancelSx = {
    color: theme.palette.primary[100],
    borderColor: theme.palette.primary[100],
    '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
  };

  const rowSx = { display: 'flex', flexDirection: { xs: 'column', sm: 'row' } as const, alignItems: 'flex-start', gap: { xs: 1, sm: 2 }, mb: 1 };
  const labelSx = { minWidth: '220px', position: 'relative' as const, transform: 'none', marginBottom: { xs: 1, sm: 0 }, whiteSpace: 'normal' as const, overflow: 'visible' as const, lineHeight: 1.4, paddingTop: { sm: '14px' } };

  if (loading && !order) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2, overflow: 'hidden' }}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        width="100%"
        maxWidth="1100px"
        p={3}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
        sx={{ backgroundColor: theme.palette.background.default, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <Typography variant="h4" align="center" mb={1}>{t('customerOrder.form.editTitle')}</Typography>

        <Box sx={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', pb: 2,
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 },
          '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
        }}>
          <FormControl fullWidth margin="normal" sx={rowSx}>
            <InputLabel sx={labelSx}>{t('customerOrder.form.customer')}:</InputLabel>
            <Box flexGrow={1}>
              <Controller name="customerId" control={control} render={({ field }) => (
                <Select fullWidth size="small" value={field.value} onChange={(e: SelectChangeEvent) => field.onChange(e.target.value)} error={!!errors.customerId} displayEmpty>
                  <MenuItem value="" disabled>{t('customerOrder.form.selectCustomer')}</MenuItem>
                  {companiesList.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              )} />
              {errors.customerId && <FormHelperText error>{errors.customerId.message}</FormHelperText>}
            </Box>
          </FormControl>

          <Controller name="deliveryDate" control={control} render={({ field }) => (
            <LabeledXtField id="deliveryDate" label={t('customerOrder.form.deliveryDate')} value={field.value ?? ''} onChange={field.onChange} error={errors.deliveryDate} type="date" />
          )} />

          <Controller name="notes" control={control} render={({ field }) => (
            <LabeledXtField id="notes" label={t('customerOrder.form.notes')} value={field.value ?? ''} onChange={field.onChange} error={errors.notes} multiline rows={2} />
          )} />

          <FormControl fullWidth margin="normal" sx={rowSx}>
            <InputLabel sx={labelSx}>{t('customerOrder.form.status')}:</InputLabel>
            <Box flexGrow={1}>
              <Controller name="status" control={control} render={({ field }) => (
                <Select fullWidth size="small" value={field.value} onChange={(e: SelectChangeEvent) => field.onChange(e.target.value as CustomerOrderStatus)} error={!!errors.status}>
                  <MenuItem value="open">{t('customerOrder.status.open')}</MenuItem>
                  <MenuItem value="in_plan">{t('customerOrder.status.in_plan')}</MenuItem>
                  <MenuItem value="fulfilled">{t('customerOrder.status.fulfilled')}</MenuItem>
                </Select>
              )} />
              {errors.status && <FormHelperText error>{errors.status.message}</FormHelperText>}
            </Box>
          </FormControl>
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, pb: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {loading ? `${t('customerOrder.form.editSubmit')}...` : t('customerOrder.form.editSubmit')}
            </Button>
            <Button variant="outlined" disabled={loading} onClick={() => navigate(`/customer-order/${id}`)} sx={cancelSx}>
              {t('customerOrder.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditCustomerOrder;