import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { addCustomerOrder } from '@/state/customerOrder/customerOrder.actions';
import { selectCustomerOrderError, selectCustomerOrderLoading } from '@/state/customerOrder/customerOrder.selectors';
import { clearError } from '@/state/customerOrder/customerOrder.slice';
import { fetchCompaniesList } from '@/state/company/company.actions';
import { selectCompaniesList } from '@/state/company/company.selectors';
import { fetchItems } from '@/state/item/item.actions';
import { selectItems } from '@/state/item/item.selectors';
import { useAppDispatch } from '@/state/hooks';
import { createPlanAction } from '@/state/productionPlanAction/productionPlanAction.actions';
import { getName } from '@/state/auth/auth.selectors';
import { CustomerOrderFormData, customerOrderSchema } from '@/zodValidationSchemas/customerOrder.schema';

const AddCustomerOrder = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useSelector(selectCustomerOrderLoading);
  const error = useSelector(selectCustomerOrderError);
  const companiesList = useSelector(selectCompaniesList);
  const items = useSelector(selectItems);

  const { handleSubmit, control, formState: { errors } } = useForm<CustomerOrderFormData>({
    resolver: zodResolver(customerOrderSchema),
    defaultValues: {
      customerId: '',
      deliveryDate: null,
      notes: null,
      lines: [{ itemId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  useEffect(() => {
    dispatch(fetchCompaniesList());
    dispatch(fetchItems({ page: 1, limit: 500, search: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: CustomerOrderFormData) => {
    const result = await dispatch(addCustomerOrder(data));
    if (addCustomerOrder.fulfilled.match(result)) {
      const orderId = result.payload.content?.customerOrder?.id;
      dispatch(createPlanAction({
        customerOrderId: orderId ?? null,
        actionType: 'order_created',
        performedByName: getName() ?? undefined,
      }));
      navigate('/customer-order');
    }
  };

  const cancelSx = {
    color: theme.palette.primary[100],
    borderColor: theme.palette.primary[100],
    '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
  };

  const rowSx = {
    display: 'flex', flexDirection: { xs: 'column', sm: 'row' } as const,
    alignItems: 'flex-start', gap: { xs: 1, sm: 2 }, mb: 1,
  };

  const labelSx = {
    minWidth: '220px', position: 'relative' as const, transform: 'none',
    marginBottom: { xs: 1, sm: 0 }, whiteSpace: 'normal' as const,
    overflow: 'visible' as const, lineHeight: 1.4, paddingTop: { sm: '14px' },
  };

  const sectionLabel = (text: string) => (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
      {text}
    </Typography>
  );

  const customers = companiesList;

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
        <Typography variant="h4" align="center" mb={1}>{t('customerOrder.form.addTitle')}</Typography>

        <Box sx={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', pb: 2,
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 },
          '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
        }}>
          {sectionLabel(t('customerOrder.form.orderInfo'))}

          <FormControl fullWidth margin="normal" sx={rowSx}>
            <InputLabel sx={labelSx}>{t('customerOrder.form.customer')}:</InputLabel>
            <Box flexGrow={1}>
              <Controller name="customerId" control={control} render={({ field }) => (
                <Select
                  fullWidth
                  size="small"
                  value={field.value}
                  onChange={(e: SelectChangeEvent) => field.onChange(e.target.value)}
                  error={!!errors.customerId}
                  displayEmpty
                >
                  <MenuItem value="" disabled>{t('customerOrder.form.selectCustomer')}</MenuItem>
                  {customers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              )} />
              {errors.customerId && <FormHelperText error>{errors.customerId.message}</FormHelperText>}
            </Box>
          </FormControl>

          <Controller name="deliveryDate" control={control} render={({ field }) => (
            <LabeledXtField
              id="deliveryDate"
              label={t('customerOrder.form.deliveryDate')}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.deliveryDate}
              type="date"
            />
          )} />

          <Controller name="notes" control={control} render={({ field }) => (
            <LabeledXtField id="notes" label={t('customerOrder.form.notes')} value={field.value ?? ''} onChange={field.onChange} error={errors.notes} multiline rows={2} />
          )} />

          {sectionLabel(t('customerOrder.form.lines'))}

          {fields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box flexGrow={1}>
                <Controller
                  name={`lines.${index}.itemId`}
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      fullWidth
                      size="small"
                      value={f.value}
                      onChange={(e: SelectChangeEvent) => f.onChange(e.target.value)}
                      error={!!errors.lines?.[index]?.itemId}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>{t('customerOrder.form.selectItem')}</MenuItem>
                      {items.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.itemCode} — {item.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.lines?.[index]?.itemId && (
                  <FormHelperText error>{errors.lines[index]?.itemId?.message}</FormHelperText>
                )}
              </Box>
              <Box width={120}>
                <Controller
                  name={`lines.${index}.quantity`}
                  control={control}
                  render={({ field: f }) => (
                    <TextField
                      size="small"
                      type="number"
                      label={t('customerOrder.form.quantity')}
                      value={f.value}
                      onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 1)}
                      error={!!errors.lines?.[index]?.quantity}
                      helperText={errors.lines?.[index]?.quantity?.message}
                      inputProps={{ min: 1 }}
                      fullWidth
                    />
                  )}
                />
              </Box>
              <IconButton color="error" size="small" onClick={() => remove(index)} disabled={fields.length === 1} sx={{ mt: 0.5 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {errors.lines?.root && (
            <FormHelperText error sx={{ ml: 0 }}>{errors.lines.root.message}</FormHelperText>
          )}

          <Button
            size="small"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => append({ itemId: '', quantity: 1 })}
            sx={{ mt: 1 }}
          >
            {t('customerOrder.form.addLine')}
          </Button>
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, pb: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {loading ? `${t('customerOrder.form.addSubmit')}...` : t('customerOrder.form.addSubmit')}
            </Button>
            <Button variant="outlined" disabled={loading} onClick={() => navigate('/customer-order')} sx={cancelSx}>
              {t('customerOrder.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddCustomerOrder;