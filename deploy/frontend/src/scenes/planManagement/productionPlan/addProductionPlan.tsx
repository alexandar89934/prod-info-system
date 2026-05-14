import { zodResolver } from '@hookform/resolvers/zod';
import BuildIcon from '@mui/icons-material/Build';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import axiosServer from '@/services/axios.service';
import { addProductionPlan } from '@/state/productionPlan/productionPlan.actions';
import { selectProductionPlanError, selectProductionPlanLoading } from '@/state/productionPlan/productionPlan.selectors';
import { clearError } from '@/state/productionPlan/productionPlan.slice';
import { ProductionPlan } from '@/state/productionPlan/productionPlan.types';
import { fetchMachines } from '@/state/machine/machine.actions';
import { selectMachines } from '@/state/machine/machine.selectors';
import { fetchItems } from '@/state/item/item.actions';
import { selectItems } from '@/state/item/item.selectors';
import { fetchMolds } from '@/state/mold/mold.actions';
import { selectMolds } from '@/state/mold/mold.selectors';
import { fetchCompatibleMachines } from '@/state/moldMachineCompatibility/moldMachineCompatibility.actions';
import { selectCompatibilities } from '@/state/moldMachineCompatibility/moldMachineCompatibility.selectors';
import { resetState as resetCompatibilityState } from '@/state/moldMachineCompatibility/moldMachineCompatibility.slice';
import { useAppDispatch } from '@/state/hooks';
import { createPlanAction } from '@/state/productionPlanAction/productionPlanAction.actions';
import { getName } from '@/state/auth/auth.selectors';
import { ProductionPlanFormData, productionPlanSchema } from '@/zodValidationSchemas/productionPlan.schema';

type BomLineEntry = {
  id: string;
  inputItemCode: string;
  inputItemName: string;
  quantityPerPiece: number;
  unit: string;
};

const statusColor = (status: string) => {
  if (status === 'in_progress') return 'warning' as const;
  if (status === 'done') return 'success' as const;
  return 'default' as const;
};

const fmtBomQty = (qty: number, unit: string): string => {
  if (unit.toLowerCase() === 'g') {
    return `${(qty / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} kg`;
  }
  return qty.toLocaleString(undefined, { maximumFractionDigits: 3 });
};

const toDatetimeLocal = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const addMinutes = (dateStr: string, minutes: number): string => {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + minutes);
  return toDatetimeLocal(d);
};

const AddProductionPlan = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const loading = useSelector(selectProductionPlanLoading);
  const error = useSelector(selectProductionPlanError);
  const machines = useSelector(selectMachines);
  const items = useSelector(selectItems);
  const molds = useSelector(selectMolds);
  const compatibilities = useSelector(selectCompatibilities);

  const prefillOrderLineId = searchParams.get('orderLineId') ?? undefined;
  const prefillItemId = searchParams.get('itemId') ?? undefined;
  const prefillQuantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity')!, 10) : 1;
  const prefillOrderId = searchParams.get('orderId') ?? undefined;
  const backPath = prefillOrderId ? `/customer-order/${prefillOrderId}` : '/production-plan';

  const [machineQueue, setMachineQueue] = useState<ProductionPlan[]>([]);
  const [machineQueueLoading, setMachineQueueLoading] = useState(false);
  const [bomLines, setBomLines] = useState<BomLineEntry[]>([]);
  const [bomLoading, setBomLoading] = useState(false);

  const { handleSubmit, control, setValue, formState: { errors } } = useForm<ProductionPlanFormData>({
    resolver: zodResolver(productionPlanSchema),
    defaultValues: {
      customerOrderLineId: prefillOrderLineId ?? null,
      itemId: prefillItemId ?? '',
      machineId: '',
      moldId: null,
      quantity: prefillQuantity,
      expectedStartDate: null,
      expectedEndDate: null,
      notes: null,
    },
  });

  const selectedItemId = useWatch({ control, name: 'itemId' });
  const selectedMachineId = useWatch({ control, name: 'machineId' });
  const selectedQuantity = useWatch({ control, name: 'quantity' });
  const selectedStartDate = useWatch({ control, name: 'expectedStartDate' });
  const selectedEndDate = useWatch({ control, name: 'expectedEndDate' });
  const userEditedEnd = useRef(false);

  useEffect(() => {
    dispatch(resetCompatibilityState());
    dispatch(fetchMachines({ page: 1, limit: 500, search: '' }));
    dispatch(fetchItems({ page: 1, limit: 500, search: '' }));
    dispatch(fetchMolds({ page: 1, limit: 500, search: '' }));
    return () => { dispatch(resetCompatibilityState()); };
  }, [dispatch]);

  useEffect(() => {
    if (error) dispatch(clearError());
  }, [dispatch]);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const autoMold = selectedItem?.toolId ? molds.find((m) => m.id === selectedItem.toolId) : null;

  useEffect(() => {
    if (!selectedItemId) return;
    const item = items.find((i) => i.id === selectedItemId);
    setValue('moldId', item?.toolId ?? null);
  }, [selectedItemId, items, setValue]);

  useEffect(() => {
    if (autoMold?.id) dispatch(fetchCompatibleMachines(autoMold.id));
  }, [autoMold?.id, dispatch]);

  useEffect(() => {
    if (!selectedItemId) { setBomLines([]); return; }
    let cancelled = false;
    setBomLoading(true);
    axiosServer.get(`/item/${selectedItemId}/bom`)
      .then((res) => {
        if (!cancelled) setBomLines(
          (res.data?.content?.bomLines ?? []).map((l: {
            id: string; inputItemCode: string; inputItemName: string; quantityPerPiece: number | string; unit: string;
          }) => ({ ...l, quantityPerPiece: Number(l.quantityPerPiece) }))
        );
      })
      .catch(() => { if (!cancelled) setBomLines([]); })
      .finally(() => { if (!cancelled) setBomLoading(false); });
    return () => { cancelled = true; };
  }, [selectedItemId]);

  useEffect(() => {
    if (!selectedMachineId) { setMachineQueue([]); return; }
    let cancelled = false;
    setMachineQueueLoading(true);
    axiosServer.get(`/production-plan/by-machine/${selectedMachineId}`)
      .then((res) => { if (!cancelled) setMachineQueue(res.data?.content?.productionPlans ?? []); })
      .catch(() => { if (!cancelled) setMachineQueue([]); })
      .finally(() => { if (!cancelled) setMachineQueueLoading(false); });
    return () => { cancelled = true; };
  }, [selectedMachineId]);

  // Helper: resolve queue context (last active plan + mold-change mounting offset)
  const getQueueContext = () => {
    const compat = compatibilities.find((c) => c.machineId === selectedMachineId);
    const queued = [...machineQueue.filter((p) => p.status === 'queued')].sort((a, b) => a.position - b.position);
    const inProgress = machineQueue.find((p) => p.status === 'in_progress');
    const lastPlan = queued[queued.length - 1] ?? inProgress;
    const moldChanging = !!(autoMold?.id && lastPlan?.moldId && lastPlan.moldId !== autoMold.id);
    const needsInitialMount = !lastPlan && !!autoMold?.id && !!compat?.moldMountingTimeMinutes && autoMold.currentMachineId !== selectedMachineId;
    const mountingMinutes = (moldChanging || needsInitialMount) && compat?.moldMountingTimeMinutes ? compat.moldMountingTimeMinutes : 0;
    return { compat, lastPlan, moldChanging, needsInitialMount, mountingMinutes };
  };

  // Auto-set start = lastPlan.end (job begins immediately after previous plan, mounting is in end).
  // Re-runs when machine queue OR item/mold changes.
  useEffect(() => {
    if (!selectedMachineId) return;
    const { lastPlan } = getQueueContext();
    userEditedEnd.current = false;
    if (lastPlan?.expectedEndDate) {
      setValue('expectedStartDate', lastPlan.expectedEndDate.slice(0, 16));
    } else {
      setValue('expectedStartDate', toDatetimeLocal(new Date()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineQueue, selectedMachineId, compatibilities, autoMold]);

  // start → end: mounting + production (mounting is the first part of the plan's duration)
  useEffect(() => {
    if (userEditedEnd.current) return;
    if (!selectedStartDate || !selectedMachineId || !selectedQuantity || selectedQuantity < 1) return;
    const { compat, mountingMinutes } = getQueueContext();
    const effectiveCavities = autoMold?.cavities && autoMold.cavities > 0 ? autoMold.cavities : 1;
    const cycles = Math.ceil(selectedQuantity / effectiveCavities);
    let productionMinutes: number | null = null;
    if (compat?.normPerShift) {
      productionMinutes = Math.ceil((cycles / compat.normPerShift) * 480);
    } else if (compat?.cycleTimeSeconds) {
      productionMinutes = Math.ceil((cycles * compat.cycleTimeSeconds) / 60);
    }
    if (productionMinutes !== null) {
      setValue('expectedEndDate', addMinutes(selectedStartDate, mountingMinutes + productionMinutes));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartDate, selectedQuantity, compatibilities, selectedMachineId, autoMold]);

  // end → start: subtract mounting + production
  useEffect(() => {
    if (!userEditedEnd.current) return;
    userEditedEnd.current = false;
    if (!selectedEndDate || !selectedMachineId || !selectedQuantity || selectedQuantity < 1) return;
    const { compat, mountingMinutes } = getQueueContext();
    const effectiveCavities = autoMold?.cavities && autoMold.cavities > 0 ? autoMold.cavities : 1;
    const cycles = Math.ceil(selectedQuantity / effectiveCavities);
    let productionMinutes: number | null = null;
    if (compat?.normPerShift) {
      productionMinutes = Math.ceil((cycles / compat.normPerShift) * 480);
    } else if (compat?.cycleTimeSeconds) {
      productionMinutes = Math.ceil((cycles * compat.cycleTimeSeconds) / 60);
    }
    if (productionMinutes !== null) {
      const endD = new Date(selectedEndDate);
      endD.setMinutes(endD.getMinutes() - mountingMinutes - productionMinutes);
      setValue('expectedStartDate', toDatetimeLocal(endD));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEndDate, selectedQuantity, compatibilities, selectedMachineId, autoMold]);

  const getDurationInfo = (): string | null => {
    if (!selectedMachineId || !selectedQuantity || selectedQuantity < 1) return null;
    const { compat, mountingMinutes } = getQueueContext();
    const effectiveCavities = autoMold?.cavities && autoMold.cavities > 0 ? autoMold.cavities : 1;
    const cycles = Math.ceil(selectedQuantity / effectiveCavities);
    let productionMinutes: number | null = null;
    if (compat?.normPerShift) {
      productionMinutes = Math.ceil((cycles / compat.normPerShift) * 480);
    } else if (compat?.cycleTimeSeconds) {
      productionMinutes = Math.ceil((cycles * compat.cycleTimeSeconds) / 60);
    }
    if (productionMinutes === null) return null;
    const totalMinutes = mountingMinutes + productionMinutes;
    const productionShifts = Math.ceil(productionMinutes / 480);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const mins = totalMinutes % 60;
    return `${productionShifts} ${t('productionPlan.form.shifts')} (${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}min` : ''})`.trim();
  };

  const moldChangeInfo = (() => {
    if (!selectedMachineId) return null;
    const { moldChanging, needsInitialMount, mountingMinutes } = getQueueContext();
    if (!mountingMinutes) return null;
    return { minutes: mountingMinutes, isInitialMount: needsInitialMount && !moldChanging };
  })();

  const onSubmit = async (data: ProductionPlanFormData) => {
    const result = await dispatch(addProductionPlan({
      ...data,
      customerOrderLineId: data.customerOrderLineId ?? null,
      moldId: data.moldId ?? null,
    }));
    if (addProductionPlan.fulfilled.match(result)) {
      const planId = result.payload.content?.productionPlan?.id;
      dispatch(createPlanAction({
        productionPlanId: planId ?? null,
        actionType: 'plan_created',
        performedByName: getName() ?? undefined,
      }));
      navigate(backPath);
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
    color: theme.palette.text.primary,
  };

  const sectionLabel = (text: string) => (
    <Typography variant="subtitle2" color="text.secondary"
      sx={{ mt: 1, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
      {text}
    </Typography>
  );

  const compatibleMachineIds = new Set(compatibilities.map((c) => c.machineId));
  const compatibleMachines = machines.filter((m) => compatibleMachineIds.has(m.id));
  const otherMachines = machines.filter((m) => !compatibleMachineIds.has(m.id));

  const machineMenuItems: React.ReactNode[] = [];
  if (autoMold && compatibleMachines.length > 0) {
    machineMenuItems.push(<ListSubheader key="h-comp">{t('productionPlan.form.compatibleMachines')}</ListSubheader>);
    compatibleMachines.forEach((m) => machineMenuItems.push(
      <MenuItem key={m.id} value={m.id}>#{m.machineNumber} — {m.name}</MenuItem>
    ));
    if (otherMachines.length > 0) {
      machineMenuItems.push(<ListSubheader key="h-other">{t('productionPlan.form.otherMachines')}</ListSubheader>);
      otherMachines.forEach((m) => machineMenuItems.push(
        <MenuItem key={m.id} value={m.id}>#{m.machineNumber} — {m.name}</MenuItem>
      ));
    }
  } else {
    machines.forEach((m) => machineMenuItems.push(
      <MenuItem key={m.id} value={m.id}>#{m.machineNumber} — {m.name}</MenuItem>
    ));
  }

  const durationInfo = getDurationInfo();
  const hasRightPanel = !!selectedMachineId || bomLines.length > 0 || bomLoading;

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
        sx={{ backgroundColor: theme.palette.background.default, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <Typography variant="h4" align="center" mb={1}>{t('productionPlan.form.addTitle')}</Typography>

        <Box sx={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', pb: 2,
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 },
          '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
        }}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'flex-start' }}>

            {/* ── Left column: form fields ── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {sectionLabel(t('productionPlan.form.itemSection'))}

              <FormControl fullWidth margin="normal" sx={rowSx}>
                <InputLabel sx={labelSx}>{t('productionPlan.form.item')}:</InputLabel>
                <Box flexGrow={1}>
                  <Controller name="itemId" control={control} render={({ field }) => (
                    <Select
                      fullWidth size="small"
                      value={field.value}
                      onChange={(e: SelectChangeEvent) => field.onChange(e.target.value)}
                      error={!!errors.itemId}
                      displayEmpty
                      disabled={!!prefillItemId}
                    >
                      <MenuItem value="" disabled>{t('productionPlan.form.selectItem')}</MenuItem>
                      {items.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.itemCode} — {item.name}</MenuItem>
                      ))}
                    </Select>
                  )} />
                  {errors.itemId && <FormHelperText error>{errors.itemId.message}</FormHelperText>}
                </Box>
              </FormControl>

              <FormControl fullWidth margin="normal" sx={rowSx}>
                <InputLabel sx={labelSx}>{t('productionPlan.form.quantity')}:</InputLabel>
                <Box flexGrow={1}>
                  <Controller name="quantity" control={control} render={({ field }) => (
                    <TextField
                      fullWidth size="small" type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      inputProps={{ min: 1 }}
                    />
                  )} />
                </Box>
              </FormControl>

              {sectionLabel(t('productionPlan.form.machineSection'))}

              <Box sx={{ ...rowSx, mb: 1.5 }}>
                <InputLabel sx={labelSx}>{t('productionPlan.form.mold')}:</InputLabel>
                <Box flexGrow={1} display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                  {autoMold ? (
                    <Typography variant="body2">
                      #{autoMold.inventoryNumber} — {autoMold.name}
                    </Typography>
                  ) : selectedItemId ? (
                    <Typography variant="body2" color="text.secondary">{t('productionPlan.form.noMoldOnItem')}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">—</Typography>
                  )}
                </Box>
              </Box>

              <FormControl fullWidth margin="normal" sx={rowSx}>
                <InputLabel sx={labelSx}>{t('productionPlan.form.machine')}:</InputLabel>
                <Box flexGrow={1}>
                  <Controller name="machineId" control={control} render={({ field }) => (
                    <Select
                      fullWidth size="small"
                      value={field.value}
                      onChange={(e: SelectChangeEvent) => field.onChange(e.target.value)}
                      error={!!errors.machineId}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>{t('productionPlan.form.selectMachine')}</MenuItem>
                      {machineMenuItems}
                    </Select>
                  )} />
                  {errors.machineId && <FormHelperText error>{errors.machineId.message}</FormHelperText>}
                </Box>
              </FormControl>

              {sectionLabel(t('productionPlan.form.schedule'))}

              {moldChangeInfo && (
                <Box sx={{ ...rowSx, mb: 0.5 }}>
                  <Box sx={labelSx} />
                  <Alert severity="info" sx={{ flexGrow: 1, py: 0.25, fontSize: '0.78rem' }}>
                    {moldChangeInfo.isInitialMount
                      ? t('productionPlan.form.initialMountOffset', { minutes: moldChangeInfo.minutes })
                      : t('productionPlan.form.moldChangeOffset', { minutes: moldChangeInfo.minutes })}
                  </Alert>
                </Box>
              )}

              <Controller name="expectedStartDate" control={control} render={({ field }) => (
                <LabeledXtField id="expectedStartDate" label={t('productionPlan.form.expectedStartDate')}
                  value={field.value ? field.value.slice(0, 16) : ''} onChange={field.onChange} error={errors.expectedStartDate} type="datetime-local" />
              )} />

              <Controller name="expectedEndDate" control={control} render={({ field }) => (
                <LabeledXtField id="expectedEndDate" label={t('productionPlan.form.expectedEndDate')}
                  value={field.value ? field.value.slice(0, 16) : ''}
                  onChange={(v) => { userEditedEnd.current = true; field.onChange(v); }}
                  error={errors.expectedEndDate} type="datetime-local" />
              )} />

              {durationInfo && (
                <Box sx={{ ...rowSx, mb: 1 }}>
                  <Box sx={labelSx} />
                  <Typography variant="caption" color="text.secondary">
                    {t('productionPlan.form.estimatedDuration')}: <strong>{durationInfo}</strong>
                  </Typography>
                </Box>
              )}

              <Controller name="notes" control={control} render={({ field }) => (
                <LabeledXtField id="notes" label={t('productionPlan.form.notes')}
                  value={field.value ?? ''} onChange={field.onChange} error={errors.notes} multiline rows={2} />
              )} />
            </Box>

            {/* ── Right column: machine queue + materials ── */}
            {hasRightPanel && (
              <Box sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, pt: { lg: 3.5 } }}>

                {/* Machine queue panel */}
                {selectedMachineId && (
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {t('productionPlan.form.machineQueue')}
                    </Typography>
                    {machineQueueLoading ? (
                      <CircularProgress size={16} />
                    ) : machineQueue.length === 0 ? (
                      <Typography variant="caption" color="text.disabled">
                        {t('productionPlan.form.queueEmpty')}
                      </Typography>
                    ) : (
                      <Stack spacing={0.5}>
                        {machineQueue.map((plan) => (
                          <Box key={plan.id} display="flex" alignItems="center" gap={1}
                            sx={{
                              px: 0.75, py: 0.5, borderRadius: 1,
                              backgroundColor: plan.status === 'in_progress' ? 'warning.main' : 'action.hover',
                              // Use rgba opacity trick via alpha
                              opacity: plan.status === 'in_progress' ? 1 : 0.85,
                            }}
                          >
                            <Chip
                              label={t(`productionPlan.status.${plan.status}`)}
                              color={statusColor(plan.status)}
                              size="small"
                              sx={{ minWidth: 76, fontSize: '0.65rem' }}
                            />
                            <Box flexGrow={1} minWidth={0}>
                              <Typography variant="caption" fontWeight={500} display="block" noWrap>
                                #{plan.position} {plan.itemCode} — {plan.itemName}
                              </Typography>
                              {plan.moldName && (
                                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                  <BuildIcon sx={{ fontSize: 10, mr: 0.25, verticalAlign: 'middle' }} />
                                  {plan.moldName}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                              <Typography variant="caption" color="text.disabled" display="block">
                                {plan.expectedStartDate ? new Date(plan.expectedStartDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </Typography>
                              <Typography variant="caption" color="text.disabled" display="block">
                                {plan.expectedEndDate ? new Date(plan.expectedEndDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                        <Divider sx={{ my: 0.5 }} />
                        <Box display="flex" alignItems="center" gap={1}
                          sx={{ px: 1, py: 0.75, borderRadius: 1, border: '2px dashed', borderColor: 'primary.main', backgroundColor: 'primary.50' }}
                        >
                          <Chip label={t('productionPlan.form.newPlan')} color="primary" size="small"
                            sx={{ minWidth: 76, fontSize: '0.7rem', fontWeight: 700 }} />
                          <Typography variant="body2" color="text.primary" fontWeight={700} sx={{ flexGrow: 1 }}>
                            ← {t('productionPlan.form.willBeAdded')}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                  </Box>
                )}

                {/* Materials / BOM panel */}
                {(bomLoading || bomLines.length > 0) && (
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                    {(() => {
                      const compat = compatibilities.find((c) => c.machineId === selectedMachineId);
                      const effectiveCavities = autoMold?.cavities && autoMold.cavities > 0 ? autoMold.cavities : 1;
                      const cycles = Math.ceil((selectedQuantity || 1) / effectiveCavities);
                      const derivedPieceWeightG = bomLines.filter((l) => l.unit.toLowerCase() === 'g').reduce((sum, l) => sum + l.quantityPerPiece, 0);
                      const hasMaterialData = compat?.runnerWeightG != null && derivedPieceWeightG > 0;
                      return (
                        <>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('productionPlan.form.materialsNeeded')}
                            {compat?.normPerShift && (
                              <Box component="span" sx={{ ml: 1, fontWeight: 400, color: 'text.disabled', textTransform: 'none', letterSpacing: 0 }}>
                                ({t('productionPlan.bom.norm')}: {compat.normPerShift.toLocaleString()}
                                {effectiveCavities > 1 && ` · ${effectiveCavities} ${t('productionPlan.bom.nests')}`})
                              </Box>
                            )}
                          </Typography>
                          {bomLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <>
                              <Table size="small" sx={{ '& td, & th': { py: 0.25, px: 0.5, fontSize: '0.7rem' } }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>{t('productionPlan.bom.material')}</TableCell>
                                    <TableCell align="right">{t('productionPlan.bom.qtyPerPc')}</TableCell>
                                    <TableCell align="center">{t('productionPlan.bom.unit')}</TableCell>
                                    <TableCell align="right">{t('productionPlan.form.totalNeeded')}</TableCell>
                                    {hasMaterialData && <TableCell align="right">{t('productionPlan.bom.totalWithRunner', { cycles })}</TableCell>}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {bomLines.map((line) => (
                                    <TableRow key={line.id}>
                                      <TableCell>
                                        <Typography variant="caption" display="block">{line.inputItemCode}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">{line.inputItemName}</Typography>
                                      </TableCell>
                                      <TableCell align="right">{line.quantityPerPiece}</TableCell>
                                      <TableCell align="center">{line.unit}</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                                        {fmtBomQty((selectedQuantity || 0) * line.quantityPerPiece, line.unit)}
                                      </TableCell>
                                      {hasMaterialData && (
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                                          {line.unit.toLowerCase() === 'g' && derivedPieceWeightG > 0
                                            ? `${(((selectedQuantity || 0) * derivedPieceWeightG + cycles * (compat?.runnerWeightG ?? 0)) * (line.quantityPerPiece / derivedPieceWeightG) / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} kg`
                                            : fmtBomQty((selectedQuantity || 0) * line.quantityPerPiece, line.unit)}
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, pb: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {loading ? `${t('productionPlan.form.addSubmit')}...` : t('productionPlan.form.addSubmit')}
            </Button>
            <Button variant="outlined" disabled={loading} onClick={() => navigate(backPath)} sx={cancelSx}>
              {t('productionPlan.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddProductionPlan;