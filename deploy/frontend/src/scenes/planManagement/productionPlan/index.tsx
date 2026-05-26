import AddIcon from '@mui/icons-material/Add';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import InventoryIcon from '@mui/icons-material/Inventory';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import HandymanIcon from '@mui/icons-material/Handyman';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import TuneIcon from '@mui/icons-material/Tune';
import ScienceIcon from '@mui/icons-material/Science';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog';
import Header from '@/reusableComponents/Header';
import axiosServer from '@/services/axios.service';
import {
  deleteProductionPlan,
  fetchProductionPlans,
  updateProductionPlan,
} from '@/state/productionPlan/productionPlan.actions';
import {
  selectProductionPlanError,
  selectProductionPlanLoading,
  selectProductionPlanSuccess,
  selectProductionPlans,
} from '@/state/productionPlan/productionPlan.selectors';
import { clearError, clearSuccess, resetState } from '@/state/productionPlan/productionPlan.slice';
import { ProductionPlan } from '@/state/productionPlan/productionPlan.types';
import { fetchActionsByPlan } from '@/state/productionPlanAction/productionPlanAction.actions';
import { selectActionsByPlan } from '@/state/productionPlanAction/productionPlanAction.selectors';
import { ProductionPlanActionType } from '@/state/productionPlanAction/productionPlanAction.types';
import { fetchMachines } from '@/state/machine/machine.actions';
import { selectMachines } from '@/state/machine/machine.selectors';
import { Machine } from '@/state/machine/machine.types';
import { AppDispatch } from '@/state/store';

type ViewMode = 'planner' | 'calendar';

const MACHINE_COL_WIDTH = 120;
const LANE_H = 26;
const LANE_GAP = 3;
const ROW_PAD = 6;

type BomLineEntry = {
  id: string;
  inputItemCode: string;
  inputItemName: string;
  quantityPerPiece: number;
  unit: string;
};

const ACTION_COLORS: Record<ProductionPlanActionType, 'error' | 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'default'> = {
  mold_change_started: 'warning',
  mold_change_completed: 'success',
  machine_setup_started: 'warning',
  machine_setup_completed: 'success',
  cycle_completed: 'info',
  plan_started: 'success',
  first_good_part_approved: 'success',
  operator_started: 'primary',
  operator_ended: 'default',
  scrap_entry: 'error',
  qty_increased: 'secondary',
  packaging_unit_full: 'secondary',
  quality_checked: 'info',
  plan_stopped: 'warning',
  plan_completed: 'success',
  plan_change_started: 'warning',
  machine_service_started: 'warning',
  machine_service_ended: 'success',
  machine_repair_started: 'error',
  machine_repair_ended: 'success',
  plan_resumed: 'success',
  machine_fault_reported: 'error',
  plan_created: 'success',
  plan_updated: 'info',
  order_created: 'success',
  order_updated: 'info',
};

const ACTION_ICON_MAP: Record<ProductionPlanActionType, React.ReactElement> = {
  mold_change_started: <BuildIcon sx={{ fontSize: 16 }} />,
  mold_change_completed: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  machine_setup_started: <TuneIcon sx={{ fontSize: 16 }} />,
  machine_setup_completed: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  cycle_completed: <AutorenewIcon sx={{ fontSize: 16 }} />,
  plan_started: <PlayArrowIcon sx={{ fontSize: 16 }} />,
  first_good_part_approved: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  operator_started: <PersonAddIcon sx={{ fontSize: 16 }} />,
  operator_ended: <PersonRemoveIcon sx={{ fontSize: 16 }} />,
  scrap_entry: <ErrorOutlineIcon sx={{ fontSize: 16 }} />,
  qty_increased: <ScienceIcon sx={{ fontSize: 16 }} />,
  packaging_unit_full: <InventoryIcon sx={{ fontSize: 16 }} />,
  quality_checked: <FactCheckIcon sx={{ fontSize: 16 }} />,
  plan_stopped: <PauseCircleOutlineIcon sx={{ fontSize: 16 }} />,
  plan_completed: <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />,
  plan_change_started: <AutorenewIcon sx={{ fontSize: 16 }} />,
  machine_service_started: <MiscellaneousServicesIcon sx={{ fontSize: 16 }} />,
  machine_service_ended: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  machine_repair_started: <HandymanIcon sx={{ fontSize: 16 }} />,
  machine_repair_ended: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  plan_resumed: <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />,
  machine_fault_reported: <ErrorOutlineIcon sx={{ fontSize: 16 }} />,
  plan_created: <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />,
  plan_updated: <AutorenewIcon sx={{ fontSize: 16 }} />,
  order_created: <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />,
  order_updated: <AutorenewIcon sx={{ fontSize: 16 }} />,
};

const fmtDt = (val: string) =>
  new Date(val).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

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

const SHIFT_WINDOWS: [number, number, 's1' | 's2' | 's3'][] = [
  [0,    360,  's3'],
  [360,  840,  's1'],
  [840,  1320, 's2'],
  [1320, 1440, 's3'],
];

const advanceShiftMinutes = (
  startDateStr: string,
  totalMinutes: number,
  s1: boolean, s2: boolean, s3: boolean
): string => {
  if (!s1 && !s2 && !s3) return addMinutes(startDateStr, totalMinutes);
  const flags: Record<'s1' | 's2' | 's3', boolean> = { s1, s2, s3 };

  let d = new Date(startDateStr);
  let remaining = totalMinutes;

  for (let guard = 0; remaining > 0 && guard < 100000; guard++) {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const minsOfDay = Math.round((d.getTime() - dayStart.getTime()) / 60000);

    const winIdx = SHIFT_WINDOWS.findIndex(([ws, we]) => minsOfDay >= ws && minsOfDay < we);
    if (winIdx === -1) {
      d = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      continue;
    }

    const [, winEnd, shift] = SHIFT_WINDOWS[winIdx];
    const active = flags[shift];

    if (active) {
      const room = winEnd - minsOfDay;
      if (remaining <= room) {
        d = new Date(d.getTime() + remaining * 60000);
        remaining = 0;
      } else {
        remaining -= room;
        const nextIdx = winIdx + 1;
        if (nextIdx >= SHIFT_WINDOWS.length) {
          d = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        } else {
          const [nextStart] = SHIFT_WINDOWS[nextIdx];
          d = new Date(dayStart.getTime() + nextStart * 60000);
        }
      }
    } else {
      const nextIdx = winIdx + 1;
      if (nextIdx >= SHIFT_WINDOWS.length) {
        d = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      } else {
        const [nextStart] = SHIFT_WINDOWS[nextIdx];
        d = new Date(dayStart.getTime() + nextStart * 60000);
      }
    }
  }
  return toDatetimeLocal(d);
};

const retreatShiftMinutes = (
  endDateStr: string,
  totalMinutes: number,
  s1: boolean, s2: boolean, s3: boolean
): string => {
  if (!s1 && !s2 && !s3) return addMinutes(endDateStr, -totalMinutes);
  const flags: Record<'s1' | 's2' | 's3', boolean> = { s1, s2, s3 };

  let d = new Date(endDateStr);
  let remaining = totalMinutes;

  for (let guard = 0; remaining > 0 && guard < 100000; guard++) {
    const h = d.getHours();
    const m = d.getMinutes();
    let minsOfDay: number;
    let dayStart: Date;

    if (h === 0 && m === 0) {
      const prevDay = new Date(d);
      prevDay.setDate(prevDay.getDate() - 1);
      dayStart = new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate());
      minsOfDay = 1440;
    } else {
      dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      minsOfDay = Math.round((d.getTime() - dayStart.getTime()) / 60000);
    }

    const winIdx = SHIFT_WINDOWS.findIndex(([ws, we]) => minsOfDay > ws && minsOfDay <= we);
    if (winIdx === -1) {
      const prevDayStart = new Date(dayStart.getTime() - 24 * 60 * 60 * 1000);
      d = new Date(prevDayStart.getTime() + 1440 * 60000);
      continue;
    }

    const [winStart, , shift] = SHIFT_WINDOWS[winIdx];
    const active = flags[shift];

    if (active) {
      const room = minsOfDay - winStart;
      if (remaining <= room) {
        d = new Date(d.getTime() - remaining * 60000);
        remaining = 0;
      } else {
        remaining -= room;
        const prevIdx = winIdx - 1;
        if (prevIdx < 0) {
          d = new Date(dayStart.getTime());
        } else {
          const [, prevEnd] = SHIFT_WINDOWS[prevIdx];
          d = new Date(dayStart.getTime() + prevEnd * 60000);
        }
      }
    } else {
      const prevIdx = winIdx - 1;
      if (prevIdx < 0) {
        d = new Date(dayStart.getTime());
      } else {
        const [, prevEnd] = SHIFT_WINDOWS[prevIdx];
        d = new Date(dayStart.getTime() + prevEnd * 60000);
      }
    }
  }
  return toDatetimeLocal(d);
};

const renderDateRange = (plan: ProductionPlan, t: (k: string) => string, startOverride?: string | null, needsMounting?: boolean) => {
  const startDate = startOverride ?? plan.expectedStartDate;
  const sh1 = plan.shift1 ?? true;
  const sh2 = plan.shift2 ?? true;
  const sh3 = plan.shift3 ?? true;
  const effectiveCavities = plan.cavities && plan.cavities > 0 ? plan.cavities : 1;
  const cycles = Math.ceil(plan.quantity / effectiveCavities);
  let productionMinutes: number | null = null;
  if (plan.normPerShift && plan.normPerShift > 0) {
    productionMinutes = Math.ceil((plan.quantity / plan.normPerShift) * 480);
  } else if (plan.cycleTimeSeconds && plan.cycleTimeSeconds > 0) {
    productionMinutes = Math.ceil((cycles * plan.cycleTimeSeconds) / 60);
  }
  const mountingMins = (needsMounting && plan.moldMountingTimeMinutes) ? plan.moldMountingTimeMinutes : 0;
  const displayEndDate = (productionMinutes !== null && plan.expectedStartDate)
    ? advanceShiftMinutes(plan.expectedStartDate, mountingMins + productionMinutes, sh1, sh2, sh3)
    : plan.expectedEndDate;
  return (
    <Box sx={{ width: 130, flexShrink: 0 }}>
      {startDate && (
        <Typography variant="caption" color="text.secondary" display="block">
          <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>{t('productionPlan.dates.start')}:</Box>
          {fmtDt(startDate)}
        </Typography>
      )}
      {displayEndDate && (
        <Typography variant="caption" color="text.secondary" display="block">
          <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>{t('productionPlan.dates.end')}:</Box>
          {fmtDt(displayEndDate)}
        </Typography>
      )}
    </Box>
  );
};

const renderScrap = (plan: ProductionPlan, t: (k: string) => string) => {
  const count = plan.scrapQuantity ?? 0;
  if (count <= 0) return <Box sx={{ width: 60, flexShrink: 0 }} />;
  return (
    <Tooltip title={t('productionPlan.scrap.tooltip')}>
      <Chip
        icon={<ErrorOutlineIcon sx={{ fontSize: 12 }} />}
        label={count.toLocaleString()}
        color="error"
        size="small"
        variant="outlined"
        sx={{ width: 60, flexShrink: 0, fontSize: '0.65rem', height: 20 }}
      />
    </Tooltip>
  );
};

const statusColor = (status: string) => {
  if (status === 'in_progress') return 'warning' as const;
  if (status === 'done') return 'success' as const;
  if (status === 'cancelled') return 'error' as const;
  return 'default' as const;
};

const renderQty = (plan: ProductionPlan) => {
  if (plan.status === 'done') {
    const produced = plan.producedQuantity ?? plan.quantity;
    return `${produced.toLocaleString()} / ${plan.quantity.toLocaleString()}`;
  }
  if (plan.producedQuantity != null && plan.producedQuantity > 0) {
    return `${plan.producedQuantity.toLocaleString()} / ${plan.quantity.toLocaleString()}`;
  }
  return `— / ${plan.quantity.toLocaleString()}`;
};

const fmtMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

const fmtDateShort = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

const MoldChangeIndicator = ({ label, estLabel, minutes, startDate }: { label: string; estLabel: string; minutes?: number | null; startDate?: string | null }) => {
  const endDate = startDate && minutes != null && minutes > 0
    ? new Date(new Date(startDate).getTime() + minutes * 60 * 1000).toISOString()
    : null;
  return (
    <Box display="flex" alignItems="center" gap={1} px={1} py={0.25} sx={{ opacity: 0.7 }}>
      <Divider sx={{ flexGrow: 1, borderStyle: 'dashed' }} />
      <BuildIcon sx={{ fontSize: 12, color: 'warning.main' }} />
      <Typography variant="caption" color="warning.main" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
        {label}
        {minutes != null && minutes > 0 && (
          <Box component="span" sx={{ fontWeight: 400, ml: 0.5 }}>
            {estLabel.replace('{{time}}', fmtMinutes(minutes))}
          </Box>
        )}
        {startDate && (
          <Box component="span" sx={{ fontWeight: 400, ml: 0.75, opacity: 0.8 }}>
            · {fmtDateShort(startDate)}
          </Box>
        )}
        {endDate && (
          <Box component="span" sx={{ fontWeight: 400, ml: 0.5, opacity: 0.8 }}>
            — {fmtDateShort(endDate)}
          </Box>
        )}
      </Typography>
      <Divider sx={{ flexGrow: 1, borderStyle: 'dashed' }} />
    </Box>
  );
};

const ProductionPlanList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const [viewMode, setViewMode] = useState<ViewMode>('planner');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [bomCache, setBomCache] = useState<Record<string, BomLineEntry[]>>({});
  const [loadingBom, setLoadingBom] = useState<Set<string>>(new Set());

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; plan: ProductionPlan | null }>({ open: false, plan: null });
  const [editDialogPlan, setEditDialogPlan] = useState<ProductionPlan | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editMachineId, setEditMachineId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editShift1, setEditShift1] = useState(true);
  const [editShift2, setEditShift2] = useState(true);
  const [editShift3, setEditShift3] = useState(true);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const plans = useSelector(selectProductionPlans);
  const loading = useSelector(selectProductionPlanLoading);
  const planError = useSelector(selectProductionPlanError);
  const planSuccess = useSelector(selectProductionPlanSuccess);
  const machines = useSelector(selectMachines);
  const actionsByPlan = useSelector(selectActionsByPlan);

  const loadedActionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
    dispatch(fetchMachines({ page: 1, limit: 500, search: '' }));
  }, [dispatch]);

  useEffect(() => {
    if (planSuccess) {
      setNotification({ message: planSuccess, type: 'success' });
      dispatch(clearSuccess());
      dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
    }
    if (planError) {
      setNotification({ message: planError, type: 'error' });
      dispatch(clearError());
    }
  }, [planSuccess, planError, dispatch]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  const loadBomLines = async (itemId: string) => {
    if (bomCache[itemId] !== undefined || loadingBom.has(itemId)) return;
    setLoadingBom((prev) => new Set(prev).add(itemId));
    try {
      const res = await axiosServer.get(`/item/${itemId}/bom`);
      const lines: BomLineEntry[] = (res.data?.content?.bomLines ?? []).map((l: {
        id: string; inputItemCode: string; inputItemName: string; quantityPerPiece: number | string; unit: string;
      }) => ({
        id: l.id,
        inputItemCode: l.inputItemCode,
        inputItemName: l.inputItemName,
        quantityPerPiece: Number(l.quantityPerPiece),
        unit: l.unit,
      }));
      setBomCache((prev) => ({ ...prev, [itemId]: lines }));
    } catch {
      setBomCache((prev) => ({ ...prev, [itemId]: [] }));
    } finally {
      setLoadingBom((prev) => { const s = new Set(prev); s.delete(itemId); return s; });
    }
  };

  const togglePlan = (planId: string, plan?: ProductionPlan) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
        if (plan) {
          loadBomLines(plan.itemId);
          if (!loadedActionsRef.current.has(planId)) {
            loadedActionsRef.current.add(planId);
            dispatch(fetchActionsByPlan(planId));
          }
        }
      }
      return next;
    });
  };

  const groupedByMachine = useMemo(() => {
    const acc: Record<string, { machineId: string; machineName: string; machineNumber: number; plans: ProductionPlan[] }> = {};
    for (const plan of plans) {
      if (!acc[plan.machineId]) {
        acc[plan.machineId] = { machineId: plan.machineId, machineName: plan.machineName ?? '', machineNumber: plan.machineNumber ?? 0, plans: [] };
      }
      acc[plan.machineId].plans.push(plan);
    }
    return Object.values(acc)
      .map((g) => {
        const allSorted = [...g.plans].sort((a, b) => a.position - b.position);
        const done = allSorted.filter((p) => p.status === 'done');
        const inProgress = allSorted.filter((p) => p.status === 'in_progress');
        const queued = allSorted.filter((p) => p.status === 'queued');
        const lastDone = done.length > 0 ? [done[done.length - 1]] : [];
        const nextQueued = queued.slice(0, 5);
        const extraQueued = queued.length - nextQueued.length;
        const visible = [...lastDone, ...inProgress, ...nextQueued];
        return { ...g, allPlans: allSorted, visible, extraQueued, hasInProgress: inProgress.length > 0 };
      })
      .sort((a, b) => a.machineNumber - b.machineNumber);
  }, [plans]);

  const calcEditProductionMinutes = (qty: number, plan: ProductionPlan): number | null => {
    if (qty < 1) return null;
    const effectiveCavities = plan.cavities && plan.cavities > 0 ? plan.cavities : 1;
    const cycles = Math.ceil(qty / effectiveCavities);
    if (plan.normPerShift && plan.normPerShift > 0) return Math.ceil((qty / plan.normPerShift) * 480);
    if (plan.cycleTimeSeconds && plan.cycleTimeSeconds > 0) return Math.ceil((cycles * plan.cycleTimeSeconds) / 60);
    return null;
  };

  // Mounting minutes for the plan currently being edited (mold change OR initial mount)
  const editPrevPlan = editDialogPlan
    ? plans.find((p) => p.machineId === editDialogPlan.machineId && p.position === editDialogPlan.position - 1)
    : null;
  const editMoldChanging = !!(editDialogPlan?.moldId && editPrevPlan?.moldId && editDialogPlan.moldId !== editPrevPlan.moldId);
  const editNeedsInitialMount = !editPrevPlan && !!editDialogPlan?.moldId && !!editDialogPlan?.moldMountingTimeMinutes && editDialogPlan?.moldCurrentMachineId !== editDialogPlan?.machineId;
  const editMountingMinutes = (editMoldChanging || editNeedsInitialMount) && editDialogPlan?.moldMountingTimeMinutes ? editDialogPlan.moldMountingTimeMinutes : 0;

  // Minimum allowed start date: computed end of the plan directly above
  const prevPrevPlan = editPrevPlan
    ? plans.find((p) => p.machineId === editPrevPlan.machineId && p.position === editPrevPlan.position - 1)
    : null;
  const prevMoldChanging = !!(editPrevPlan?.moldId && prevPrevPlan?.moldId && editPrevPlan.moldId !== prevPrevPlan.moldId);
  const prevNeedsInitialMount = !prevPrevPlan && !!editPrevPlan?.moldId && !!editPrevPlan?.moldMountingTimeMinutes && editPrevPlan?.moldCurrentMachineId !== editPrevPlan?.machineId;
  const prevMountingMins = (prevMoldChanging || prevNeedsInitialMount) && editPrevPlan?.moldMountingTimeMinutes ? editPrevPlan.moldMountingTimeMinutes : 0;
  const prevProdMins = editPrevPlan ? calcEditProductionMinutes(editPrevPlan.quantity, editPrevPlan) : null;
  const editMinStartDate = (editPrevPlan?.expectedStartDate && prevProdMins !== null)
    ? advanceShiftMinutes(editPrevPlan.expectedStartDate, prevMountingMins + prevProdMins, editPrevPlan.shift1 ?? true, editPrevPlan.shift2 ?? true, editPrevPlan.shift3 ?? true)
    : null;
  const editStartDateError = !!(editMinStartDate && editStartDate && editStartDate < editMinStartDate);

  const recalcEditEndDate = (qty: number, startDate: string, plan: ProductionPlan, sh1: boolean, sh2: boolean, sh3: boolean) => {
    if (!startDate || qty < 1) return;
    const productionMinutes = calcEditProductionMinutes(qty, plan);
    if (productionMinutes !== null) setEditEndDate(advanceShiftMinutes(startDate, editMountingMinutes + productionMinutes, sh1, sh2, sh3));
  };

  const recalcEditStartDate = (qty: number, endDate: string, plan: ProductionPlan, sh1: boolean, sh2: boolean, sh3: boolean) => {
    if (!endDate || qty < 1) return;
    const productionMinutes = calcEditProductionMinutes(qty, plan);
    if (productionMinutes !== null) {
      setEditStartDate(retreatShiftMinutes(endDate, editMountingMinutes + productionMinutes, sh1, sh2, sh3));
    }
  };

  const handleEditSave = async () => {
    if (!editDialogPlan) return;
    const qty = parseInt(editQty, 10);
    if (!qty || qty < 1 || !editMachineId) return;

    const savedEndDate = editEndDate || editDialogPlan.expectedEndDate || '';

    // Build all updates upfront so we can dispatch them all and await together
    type PlanUpdate = Parameters<typeof updateProductionPlan>[0];
    const allUpdates: PlanUpdate[] = [{
      id: editDialogPlan.id,
      itemId: editDialogPlan.itemId,
      machineId: editMachineId,
      moldId: editDialogPlan.moldId,
      quantity: qty,
      expectedStartDate: editStartDate || editDialogPlan.expectedStartDate,
      expectedEndDate: savedEndDate,
      status: editDialogPlan.status,
      notes: editDialogPlan.notes,
      customerOrderLineId: editDialogPlan.customerOrderLineId,
      shift1: editShift1,
      shift2: editShift2,
      shift3: editShift3,
    }];

    // Cascade: recalculate start/end for all queued plans that follow on the same machine
    const subsequent = plans
      .filter((p) => p.machineId === editDialogPlan.machineId && p.status === 'queued' && p.id !== editDialogPlan.id && p.position > editDialogPlan.position)
      .sort((a, b) => a.position - b.position);

    let prevEndDate = savedEndDate;
    let prevMoldId = editDialogPlan.moldId ?? null;

    for (const plan of subsequent) {
      if (!prevEndDate) break;
      const moldChanging = !!plan.moldId && plan.moldId !== prevMoldId;
      const mountingMins = moldChanging && plan.moldMountingTimeMinutes ? plan.moldMountingTimeMinutes : 0;
      const productionMinutes = calcEditProductionMinutes(plan.quantity, plan);
      if (productionMinutes === null) break;
      const sh1 = plan.shift1 ?? true;
      const sh2 = plan.shift2 ?? true;
      const sh3 = plan.shift3 ?? true;
      const newStart = prevEndDate;
      const newEnd = advanceShiftMinutes(newStart, mountingMins + productionMinutes, sh1, sh2, sh3);
      allUpdates.push({
        id: plan.id,
        itemId: plan.itemId,
        machineId: plan.machineId,
        moldId: plan.moldId,
        quantity: plan.quantity,
        expectedStartDate: newStart,
        expectedEndDate: newEnd,
        status: plan.status,
        notes: plan.notes,
        customerOrderLineId: plan.customerOrderLineId,
        shift1: sh1,
        shift2: sh2,
        shift3: sh3,
      });
      prevEndDate = newEnd;
      prevMoldId = plan.moldId ?? null;
    }

    setEditDialogPlan(null);
    // Dispatch all updates in parallel, then do a single refetch once all DB writes are done
    await Promise.all(allUpdates.map((u) => dispatch(updateProductionPlan(u))));
    dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
  };

  const renderBomSection = (plan: ProductionPlan) => {
    const lines = bomCache[plan.itemId];
    const isLoading = loadingBom.has(plan.itemId);
    if (isLoading) return <Box py={1}><CircularProgress size={16} /></Box>;
    if (!lines || lines.length === 0) return null;

    const effectiveCavities = plan.cavities && plan.cavities > 0 ? plan.cavities : 1;
    const cycles = Math.ceil(plan.quantity / effectiveCavities);
    const producedAndScrap = (plan.producedQuantity ?? 0) + (plan.scrapQuantity ?? 0);
    const spentCycles = Math.ceil(producedAndScrap / effectiveCavities);
    const derivedPieceWeightG = lines.filter((l) => l.unit.toLowerCase() === 'g').reduce((sum, l) => sum + l.quantityPerPiece, 0);
    const hasMaterialData = plan.runnerWeightG != null && derivedPieceWeightG > 0;

    return (
      <Box sx={{ mb: 1.5, mt: 0.5 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
          {t('productionPlan.bom.title')}
          {plan.normPerShift && (
            <Box component="span" sx={{ ml: 1, color: 'text.disabled' }}>
              ({t('productionPlan.bom.norm')}: {plan.normPerShift.toLocaleString()}
              {effectiveCavities > 1 && ` · ${effectiveCavities} ${t('productionPlan.bom.nests')}`})
            </Box>
          )}
        </Typography>
        <Table size="small" sx={{ '& td, & th': { py: 0.25, px: 0.75, fontSize: '0.7rem' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('productionPlan.bom.material')}</TableCell>
              <TableCell align="right">{t('productionPlan.bom.qtyPerPc')}</TableCell>
              <TableCell align="center">{t('productionPlan.bom.unit')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{t('productionPlan.bom.qtyPerPlan')}</TableCell>
              {hasMaterialData && <TableCell align="right" sx={{ fontWeight: 700 }}>{t('productionPlan.bom.totalWithRunner', { cycles })}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.inputItemCode} — {line.inputItemName}</TableCell>
                <TableCell align="right">{line.quantityPerPiece}</TableCell>
                <TableCell align="center">{line.unit}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {fmtBomQty(plan.quantity * line.quantityPerPiece, line.unit)}
                </TableCell>
                {hasMaterialData && (
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {line.unit.toLowerCase() === 'g' && derivedPieceWeightG > 0
                      ? `${((plan.quantity * derivedPieceWeightG + cycles * (plan.runnerWeightG ?? 0)) * (line.quantityPerPiece / derivedPieceWeightG) / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} kg`
                      : fmtBomQty(plan.quantity * line.quantityPerPiece, line.unit)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!plan.normPerShift && (
          <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
            {t('productionPlan.bom.noNorm')}
          </Typography>
        )}
        {hasMaterialData && producedAndScrap > 0 && (
          <Box sx={{ mt: 0.75, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="text.disabled">{t('productionPlan.material.spent')}:</Typography>
            <Typography variant="caption" fontWeight={600} color="warning.main">
              {((producedAndScrap * derivedPieceWeightG + spentCycles * (plan.runnerWeightG ?? 0)) / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} kg
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderProductionStats = (plan: ProductionPlan) => {
    const good = plan.producedQuantity ?? 0;
    const scrap = plan.scrapQuantity ?? 0;
    const gross = good + scrap;
    if (gross === 0) return null;

    const effectiveCavities = plan.cavities && plan.cavities > 0 ? plan.cavities : 1;
    const injections = Math.floor(gross / effectiveCavities);
    const progressPct = Math.min((good / plan.quantity) * 100, 100);

    return (
      <Box sx={{ mb: 1.5 }}>
        <Box display="flex" gap={3} alignItems="flex-end" flexWrap="wrap" mb={0.75}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('productionPlan.stats.good')}
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {good.toLocaleString()} / {plan.quantity.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('productionPlan.stats.gross')}
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {gross.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('productionPlan.stats.injections')}
              {effectiveCavities > 1 && (
                <Box component="span" sx={{ ml: 0.5, opacity: 0.6 }}>
                  · {t('productionPlan.stats.cavities', { count: effectiveCavities })}
                </Box>
              )}
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {injections.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          color={progressPct >= 100 ? 'success' : 'primary'}
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>
    );
  };

  const renderScrapOverview = (planId: string) => {
    const actions = actionsByPlan[planId];
    if (!actions) return null;
    const scrapActions = actions.filter((a) => a.actionType === 'scrap_entry' && a.quantity != null && a.quantity > 0);
    if (scrapActions.length === 0) return null;
    const total = scrapActions.reduce((sum, a) => sum + (a.quantity ?? 0), 0);
    const byReason: Record<string, number> = {};
    scrapActions.forEach((a) => {
      const r = a.scrapReason ?? 'unknown';
      byReason[r] = (byReason[r] ?? 0) + (a.quantity ?? 0);
    });
    return (
      <Box sx={{ mb: 1.5, p: 1, border: '1px solid', borderColor: 'error.light', borderRadius: 1, backgroundColor: 'error.50' }}>
        <Typography variant="caption" fontWeight={700} color="error.main" display="block" mb={0.75}>
          {t('productionPlan.scrap.overview')} — {total.toLocaleString()} {t('productionPlan.scrap.pcs')}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {Object.entries(byReason).map(([reason, count]) => (
            <Chip
              key={reason}
              label={`${t(`productionPlan.steps.scrapReasons.${reason}`)} · ${count.toLocaleString()}`}
              color="error"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderTimeline = (planId: string) => {
    const actions = actionsByPlan[planId];
    return (
      <Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
          {t('productionPlan.actions.timeline')}
        </Typography>
        <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
          {!actions ? (
            <CircularProgress size={14} />
          ) : actions.length === 0 ? (
            <Typography variant="caption" color="text.disabled">
              {t('productionPlan.actions.noActions')}
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {actions.map((action) => (
                <Box key={action.id} display="flex" alignItems="flex-start" gap={1}>
                  <Box sx={{ mt: 0.25, color: `${ACTION_COLORS[action.actionType]}.main`, flexShrink: 0 }}>
                    {ACTION_ICON_MAP[action.actionType]}
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={600} display="block">
                      {t(`productionPlan.actions.types.${action.actionType}`)}
                      {(action.performedByPersonName || action.performedByName) && (
                        <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', ml: 0.5 }}>
                          — {action.performedByPersonName ?? action.performedByName}
                        </Box>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block">
                      {new Date(action.timestamp).toLocaleString()}
                      {action.quantity != null && ` · ${action.quantity.toLocaleString()} kom`}
                      {action.scrapReason && ` · ${t(`productionPlan.steps.scrapReasons.${action.scrapReason}`)}`}
                      {action.packagingUnitName && ` · ${action.packagingUnitName}`}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    );
  };

  const renderPlannerRow = (plan: ProductionPlan, prevPlan: ProductionPlan | null) => {
    const moldChanged = prevPlan !== null && plan.moldId !== prevPlan.moldId;
    const needsInitialMount =
      prevPlan === null &&
      !!plan.moldId &&
      !!plan.moldMountingTimeMinutes &&
      plan.moldCurrentMachineId !== plan.machineId;
    const needsMounting = moldChanged || needsInitialMount;
    const effectiveStartDate =
      needsMounting && plan.moldMountingTimeMinutes && plan.expectedStartDate
        ? new Date(new Date(plan.expectedStartDate).getTime() + plan.moldMountingTimeMinutes * 60 * 1000).toISOString()
        : undefined;
    const isExpanded = expandedPlans.has(plan.id);
    const isQueued = plan.status === 'queued';

    return (
      <Box key={plan.id}>
        {moldChanged && <MoldChangeIndicator label={t('productionPlan.planner.moldChange')} estLabel={t('productionPlan.planner.moldChangeEst')} minutes={plan.moldMountingTimeMinutes} startDate={plan.expectedStartDate} />}
        {needsInitialMount && <MoldChangeIndicator label={t('productionPlan.planner.initialMount')} estLabel={t('productionPlan.planner.initialMountEst')} minutes={plan.moldMountingTimeMinutes} startDate={plan.expectedStartDate} />}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', opacity: plan.status === 'done' ? 0.55 : 1 }}>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            px={1}
            py={0.75}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': { backgroundColor: theme.palette.action.hover },
            }}
            onClick={() => togglePlan(plan.id, plan)}
          >
            <ExpandMoreIcon
              sx={{
                fontSize: 18,
                color: 'text.secondary',
                flexShrink: 0,
                transition: 'transform 0.2s',
                transform: isExpanded ? 'rotate(180deg)' : 'none',
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, fontWeight: 700, flexShrink: 0 }}>
              #{plan.position}
            </Typography>
            <Box flexGrow={1} minWidth={0}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {plan.itemCode} — {plan.itemName}
              </Typography>
              {plan.moldName && (
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  #{plan.moldInventoryNumber} {plan.moldName}
                </Typography>
              )}
              {plan.orderNumber && (
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {plan.orderNumber}{plan.customerName ? ` · ${plan.customerName}` : ''}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ width: 90, textAlign: 'right', flexShrink: 0 }}>
              {renderQty(plan)}
            </Typography>
            {renderScrap(plan, t)}
            {renderDateRange(plan, t, effectiveStartDate, needsMounting)}
            <Box sx={{ width: 90, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <Chip label={t(`productionPlan.status.${plan.status}`)} color={statusColor(plan.status)} size="small" />
            </Box>
            {isQueued && (
              <Tooltip title={t('productionPlan.editDialog.title')}>
                <Box
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation();
                    const openStartDate = plan.expectedStartDate?.slice(0, 16) ?? '';
                    const openSh1 = plan.shift1 ?? true;
                    const openSh2 = plan.shift2 ?? true;
                    const openSh3 = plan.shift3 ?? true;
                    const openPrevPlan = plans.find((p) => p.machineId === plan.machineId && p.position === plan.position - 1);
                    const openMoldChanging = !!(plan.moldId && openPrevPlan?.moldId && plan.moldId !== openPrevPlan.moldId);
                    const openNeedsInitialMount = !openPrevPlan && !!plan.moldId && !!plan.moldMountingTimeMinutes && plan.moldCurrentMachineId !== plan.machineId;
                    const openMountingMins = (openMoldChanging || openNeedsInitialMount) && plan.moldMountingTimeMinutes ? plan.moldMountingTimeMinutes : 0;
                    const openProdMins = calcEditProductionMinutes(plan.quantity, plan);
                    const openEndDate = openProdMins !== null && openStartDate
                      ? advanceShiftMinutes(openStartDate, openMountingMins + openProdMins, openSh1, openSh2, openSh3)
                      : plan.expectedEndDate?.slice(0, 16) ?? '';
                    setEditDialogPlan(plan);
                    setEditQty(String(plan.quantity));
                    setEditMachineId(plan.machineId);
                    setEditStartDate(openStartDate);
                    setEditEndDate(openEndDate);
                    setEditShift1(openSh1);
                    setEditShift2(openSh2);
                    setEditShift3(openSh3);
                  }}
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </Box>
              </Tooltip>
            )}
            {isQueued && (
              <Box
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({ open: true, plan });
                }}
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'error.light', '&:hover': { color: 'error.main' } }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </Box>
            )}
          </Box>

          {isExpanded && (
            <Box sx={{ pl: 5, pr: 2, pb: 2, pt: 0.5 }}>
              {renderBomSection(plan)}
              {renderProductionStats(plan)}
              {renderScrapOverview(plan.id)}
              {renderTimeline(plan.id)}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderCalendarView = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59);
    const today = new Date();
    const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;
    const monthLabel = calendarDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const calcPlanEnd = (plan: ProductionPlan, mountingMins: number): Date => {
      if (plan.expectedStartDate) {
        const sh1 = plan.shift1 ?? true;
        const sh2 = plan.shift2 ?? true;
        const sh3 = plan.shift3 ?? true;
        const effectiveCavities = plan.cavities && plan.cavities > 0 ? plan.cavities : 1;
        const cycles = Math.ceil(plan.quantity / effectiveCavities);
        let productionMinutes: number | null = null;
        if (plan.normPerShift && plan.normPerShift > 0) {
          productionMinutes = Math.ceil((plan.quantity / plan.normPerShift) * 480);
        } else if (plan.cycleTimeSeconds && plan.cycleTimeSeconds > 0) {
          productionMinutes = Math.ceil((cycles * plan.cycleTimeSeconds) / 60);
        }
        if (productionMinutes !== null) {
          return new Date(advanceShiftMinutes(plan.expectedStartDate, mountingMins + productionMinutes, sh1, sh2, sh3));
        }
      }
      return plan.expectedEndDate ? new Date(plan.expectedEndDate) : monthEnd;
    };

    const getBar = (plan: ProductionPlan, mountingMins: number) => {
      if (!plan.expectedStartDate && !plan.expectedEndDate) return null;
      const start = plan.expectedStartDate ? new Date(plan.expectedStartDate) : monthStart;
      const end = calcPlanEnd(plan, mountingMins);
      if (end < monthStart || start > monthEnd) return null;
      const cs = start < monthStart ? monthStart : start;
      const ce = end > monthEnd ? monthEnd : end;
      const startFrac = Math.max((cs.getDate() - 1 + (cs.getHours() * 60 + cs.getMinutes()) / 1440) / daysInMonth, 0);
      const endFrac = Math.min((ce.getDate() - 1 + (ce.getHours() * 60 + ce.getMinutes()) / 1440) / daysInMonth, 1);
      const totalMs = end.getTime() - start.getTime();
      return {
        left: startFrac * 100,
        width: Math.max((endFrac - startFrac) * 100, 100 / daysInMonth / 2),
        clipped: start < monthStart || end > monthEnd,
        clippedLeft: start < monthStart,
        totalMs,
      };
    };

    const assignLanes = (visPlans: ProductionPlan[], mountingNeeded: Set<string>) => {
      const sorted = [...visPlans].sort((a, b) =>
        (a.expectedStartDate ? new Date(a.expectedStartDate).getTime() : 0) -
        (b.expectedStartDate ? new Date(b.expectedStartDate).getTime() : 0)
      );
      const laneEndPcts: number[] = [];
      return sorted.map(plan => {
        const mountMins = mountingNeeded.has(plan.id) && plan.moldMountingTimeMinutes ? plan.moldMountingTimeMinutes : 0;
        const bar = getBar(plan, mountMins);
        if (!bar) return { plan, lane: 0, bar: null as null, mountFrac: 0 };
        const barEnd = bar.left + bar.width;
        let lane = laneEndPcts.findIndex(e => e <= bar.left);
        if (lane === -1) lane = laneEndPcts.length;
        laneEndPcts[lane] = barEnd;
        const mountFrac = (mountMins > 0 && bar.totalMs > 0)
          ? Math.min((mountMins * 60 * 1000) / bar.totalMs, 0.5)
          : 0;
        return { plan, lane, bar, mountFrac };
      });
    };

    const barColor = (status: string) => ({
      bg: status === 'in_progress' ? 'warning.light' : status === 'done' ? 'success.light' : status === 'cancelled' ? 'error.light' : 'action.selected',
      border: status === 'in_progress' ? 'warning.main' : status === 'done' ? 'success.main' : status === 'cancelled' ? 'error.main' : 'grey.400',
    });

    return (
      <Box>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton size="small" onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 180, textAlign: 'center', textTransform: 'capitalize' }}>
            {monthLabel}
          </Typography>
          <IconButton size="small" onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
            <ChevronRightIcon />
          </IconButton>
          <Button size="small" variant="contained" sx={{ ml: 1 }} onClick={() => setCalendarDate(new Date())}>
            {t('productionPlan.calendar.today')}
          </Button>
        </Box>

        <Box>
            {/* Day header */}
            <Box display="flex" sx={{ borderBottom: '2px solid', borderColor: 'divider', mb: 0.5, pl: `${MACHINE_COL_WIDTH}px` }}>
              {days.map(day => (
                <Box key={day} sx={{ width: `${100 / daysInMonth}%`, textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={day === todayDay ? 800 : 400} color={day === todayDay ? 'primary.main' : 'text.secondary'}>
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Machine rows */}
            {groupedByMachine.map(group => {
              const allSortedByPos = [...group.allPlans].sort((a, b) => a.position - b.position);
              const mountingNeeded = new Set<string>();
              allSortedByPos.forEach((plan, idx) => {
                const prev = idx > 0 ? allSortedByPos[idx - 1] : null;
                const hasMoldChange = prev !== null && plan.moldId !== prev.moldId;
                const needsInitialMount = !prev && !!plan.moldId && !!plan.moldMountingTimeMinutes && plan.moldCurrentMachineId !== plan.machineId;
                if (hasMoldChange || needsInitialMount) mountingNeeded.add(plan.id);
              });

              const laned = assignLanes(group.allPlans, mountingNeeded);
              const visible = laned.filter(l => l.bar !== null);
              if (visible.length === 0) return null;
              const maxLane = Math.max(...visible.map(l => l.lane));
              const rowH = (maxLane + 1) * (LANE_H + LANE_GAP) + ROW_PAD * 2;

              return (
                <Box key={group.machineId} display="flex" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: MACHINE_COL_WIDTH, flexShrink: 0, pt: `${ROW_PAD}px`, pb: `${ROW_PAD}px`, pr: 1, borderRight: '1px solid', borderColor: 'divider' }}>
                    <Typography
                      variant="caption" fontWeight={700} noWrap display="block"
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => navigate(`/machine-plan/${group.machineId}`)}
                    >
                      #{group.machineNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.6rem' }}>
                      {group.machineName}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, position: 'relative', height: rowH }}>
                    {/* Day grid lines */}
                    {days.map(day => (
                      <Box key={day} sx={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${((day - 1) / daysInMonth) * 100}%`, width: '1px',
                        backgroundColor: day === todayDay ? 'primary.light' : 'divider',
                        opacity: day === todayDay ? 0.6 : 1, zIndex: 0, pointerEvents: 'none',
                      }} />
                    ))}

                    {/* Plan bars */}
                    {visible.map(({ plan, lane, bar, mountFrac }) => {
                      if (!bar) return null;
                      const colors = barColor(plan.status);
                      const hasMounting = mountingNeeded.has(plan.id) && mountFrac > 0 && !bar.clippedLeft;
                      const tooltipContent = (
                        <Box>
                          <Typography variant="caption" display="block">{plan.itemCode} — {plan.itemName}</Typography>
                          <Typography variant="caption" display="block">{t(`productionPlan.status.${plan.status}`)}</Typography>
                          {hasMounting && plan.moldMountingTimeMinutes && (
                            <Typography variant="caption" display="block" sx={{ color: 'warning.light' }}>
                              <BuildIcon sx={{ fontSize: 10, verticalAlign: 'middle', mr: 0.25 }} />
                              {allSortedByPos[0]?.id === plan.id
                                ? t('productionPlan.planner.initialMount')
                                : t('productionPlan.planner.moldChange')
                              }: {fmtMinutes(plan.moldMountingTimeMinutes)}
                            </Typography>
                          )}
                        </Box>
                      );
                      return (
                        <Tooltip key={plan.id} title={tooltipContent}>
                          <Box
                            sx={{
                              position: 'absolute',
                              left: `calc(${bar.left}% + 1px)`,
                              width: `calc(${bar.width}% - 2px)`,
                              top: ROW_PAD + lane * (LANE_H + LANE_GAP),
                              height: LANE_H,
                              borderRadius: 1,
                              backgroundColor: colors.bg,
                              border: '1px solid',
                              borderColor: colors.border,
                              borderStyle: bar.clipped ? 'dashed' : 'solid',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              zIndex: 1,
                              '&:hover': { filter: 'brightness(0.9)' },
                            }}
                            onClick={() => navigate(`/machine-plan/${plan.machineId}`)}
                          >
                            {hasMounting && (
                              <Box sx={{
                                width: `${mountFrac * 100}%`,
                                minWidth: 6,
                                maxWidth: '40%',
                                height: '100%',
                                flexShrink: 0,
                                backgroundColor: 'warning.main',
                                opacity: 0.85,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <BuildIcon sx={{ fontSize: 9, color: 'white' }} />
                              </Box>
                            )}
                            <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 0.5, display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1 }}>
                                {plan.itemCode}
                              </Typography>
                            </Box>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
    );
  };

  const renderMachineGroup = (group: (typeof groupedByMachine)[number]) => (
    <Accordion
      key={group.machineId}
      defaultExpanded
      disableGutters
      sx={{ boxShadow: 'none', border: 'none', backgroundColor: 'transparent', '&:before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 0,
          minHeight: 'auto',
          pb: 0.5,
          borderBottom: `2px solid ${theme.palette.secondary[300]}`,
          '& .MuiAccordionSummary-content': { my: 0, alignItems: 'center', gap: 1 },
          '&.Mui-expanded': { borderBottom: `2px solid ${theme.palette.secondary[300]}` },
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline', opacity: 0.8 } }}
          onClick={(e) => { e.stopPropagation(); navigate(`/machine-plan/${group.machineId}`); }}
        >
          #{group.machineNumber} — {group.machineName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({group.allPlans.length})
        </Typography>
        {group.hasInProgress && (
          <Chip label={t('productionPlan.status.in_progress')} color="warning" size="small" />
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 1, pb: 0 }}>
        <Stack spacing={0}>
          {group.visible.map((plan, idx) =>
            renderPlannerRow(plan, idx > 0 ? group.visible[idx - 1] : null)
          )}
        </Stack>
        {group.extraQueued > 0 && (
          <Box
            px={1}
            py={0.75}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/machine-plan/${group.machineId}`)}
          >
            <Typography variant="caption" color="secondary.main" fontWeight={600}>
              {t('productionPlan.planner.moreQueued', { count: group.extraQueued })}
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 1, display: 'flex', flexDirection: 'column', height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}>
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} mb={2} gap={isMobile ? 2 : 0}>
        <Header
          title={t(viewMode === 'calendar' ? 'productionPlan.list.titleCalendar' : 'productionPlan.list.title')}
          subtitle={t(viewMode === 'calendar' ? 'productionPlan.list.subtitleCalendar' : 'productionPlan.list.subtitle')}
        />
        <Box display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v: ViewMode) => v && setViewMode(v)} size="small">
            <ToggleButton value="planner">
              <Tooltip title={t('productionPlan.list.viewPlanner')}><ViewStreamIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="calendar">
              <Tooltip title={t('productionPlan.list.viewCalendar')}><CalendarMonthIcon fontSize="small" /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/addProductionPlan')}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('productionPlan.list.add')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        {loading && <LinearProgress sx={{ mb: 1 }} />}
        {viewMode === 'calendar' ? (
          renderCalendarView()
        ) : (
          <>
            {!loading && groupedByMachine.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                {t('productionPlan.grouped.empty')}
              </Typography>
            )}
            <Stack spacing={3}>
              {groupedByMachine.map((group) => renderMachineGroup(group))}
            </Stack>
          </>
        )}
      </Box>

      <ConfirmDialog
        open={deleteDialog.open}
        title={t('productionPlan.list.deleteTitle')}
        message={t('productionPlan.list.deleteDescription', { name: deleteDialog.plan ? `${deleteDialog.plan.itemCode} #${deleteDialog.plan.position}` : '' })}
        onConfirm={() => {
          if (deleteDialog.plan) dispatch(deleteProductionPlan(deleteDialog.plan.id));
          setDeleteDialog({ open: false, plan: null });
        }}
        onClose={() => setDeleteDialog({ open: false, plan: null })}
      />

      <Dialog open={!!editDialogPlan} onClose={() => setEditDialogPlan(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('productionPlan.editDialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('productionPlan.editDialog.quantity')}
              type="number"
              size="small"
              value={editQty}
              onChange={(e) => {
                setEditQty(e.target.value);
                const qty = parseInt(e.target.value, 10);
                if (qty > 0 && editDialogPlan) recalcEditEndDate(qty, editStartDate, editDialogPlan, editShift1, editShift2, editShift3);
              }}
              inputProps={{ min: 1 }}
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>{t('productionPlan.editDialog.machine')}</InputLabel>
              <Select
                value={editMachineId}
                label={t('productionPlan.editDialog.machine')}
                onChange={(e: SelectChangeEvent) => setEditMachineId(e.target.value)}
              >
                {machines.map((m: Machine) => (
                  <MenuItem key={m.id ?? ''} value={m.id ?? ''}>
                    #{m.machineNumber} {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {editDialogPlan && (() => {
              const prevPlan = plans.find((p) => p.machineId === editDialogPlan.machineId && p.position === editDialogPlan.position - 1);
              const moldChanging = !!(editDialogPlan.moldId && prevPlan?.moldId && editDialogPlan.moldId !== prevPlan.moldId);
              const mountingMinutes = moldChanging && editDialogPlan.moldMountingTimeMinutes ? editDialogPlan.moldMountingTimeMinutes : 0;
              if (!moldChanging || mountingMinutes <= 0) return null;
              return (
                <Alert severity="info" sx={{ py: 0, fontSize: '0.75rem' }}>
                  {t('productionPlan.form.moldChangeOffset', { minutes: mountingMinutes })}
                </Alert>
              );
            })()}
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                backgroundColor: 'action.hover',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.25 }}>
                {t('productionPlan.form.activeShifts')}
              </Typography>
              <Box display="flex" gap={0} flexWrap="wrap">
                <FormControlLabel
                  control={<Checkbox size="small" checked={editShift1} color="secondary" onChange={(e) => {
                    if (!e.target.checked && !editShift2 && !editShift3) return;
                    setEditShift1(e.target.checked);
                    const qty = parseInt(editQty, 10);
                    if (qty > 0 && editDialogPlan) recalcEditEndDate(qty, editStartDate, editDialogPlan, e.target.checked, editShift2, editShift3);
                  }} />}
                  label={<Typography variant="body2" fontWeight={500}>{t('productionPlan.form.shift1')}</Typography>}
                  sx={{ mr: 1 }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={editShift2} color="secondary" onChange={(e) => {
                    if (!e.target.checked && !editShift1 && !editShift3) return;
                    setEditShift2(e.target.checked);
                    const qty = parseInt(editQty, 10);
                    if (qty > 0 && editDialogPlan) recalcEditEndDate(qty, editStartDate, editDialogPlan, editShift1, e.target.checked, editShift3);
                  }} />}
                  label={<Typography variant="body2" fontWeight={500}>{t('productionPlan.form.shift2')}</Typography>}
                  sx={{ mr: 1 }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={editShift3} color="secondary" onChange={(e) => {
                    if (!e.target.checked && !editShift1 && !editShift2) return;
                    setEditShift3(e.target.checked);
                    const qty = parseInt(editQty, 10);
                    if (qty > 0 && editDialogPlan) recalcEditEndDate(qty, editStartDate, editDialogPlan, editShift1, editShift2, e.target.checked);
                  }} />}
                  label={<Typography variant="body2" fontWeight={500}>{t('productionPlan.form.shift3')}</Typography>}
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>
            <TextField
              label={t('productionPlan.form.expectedStartDate')}
              type="datetime-local"
              size="small"
              value={editStartDate}
              onChange={(e) => {
                setEditStartDate(e.target.value);
                const qty = parseInt(editQty, 10);
                if (qty > 0 && editDialogPlan) recalcEditEndDate(qty, e.target.value, editDialogPlan, editShift1, editShift2, editShift3);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: editMinStartDate ?? undefined }}
              error={editStartDateError}
              helperText={editStartDateError && editMinStartDate
                ? t('productionPlan.editDialog.startDateTooEarly', { date: new Date(editMinStartDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) })
                : undefined}
              fullWidth
            />
            <TextField
              label={t('productionPlan.form.expectedEndDate')}
              type="datetime-local"
              size="small"
              value={editEndDate}
              onChange={(e) => {
                setEditEndDate(e.target.value);
                const qty = parseInt(editQty, 10);
                if (qty > 0 && editDialogPlan) recalcEditStartDate(qty, e.target.value, editDialogPlan, editShift1, editShift2, editShift3);
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            {editDialogPlan && editQty && parseInt(editQty, 10) > 0 && editStartDate && (editDialogPlan.normPerShift || editDialogPlan.cycleTimeSeconds) && (() => {
              const productionMinutes = calcEditProductionMinutes(parseInt(editQty, 10), editDialogPlan);
              if (!productionMinutes) return null;
              const productionShifts = Math.ceil(productionMinutes / 480);
              const calcEnd = advanceShiftMinutes(editStartDate, editMountingMinutes + productionMinutes, editShift1, editShift2, editShift3);
              const totalMinutes = Math.round((new Date(calcEnd).getTime() - new Date(editStartDate).getTime()) / 60000);
              const d = Math.floor(totalMinutes / 1440);
              const h = Math.floor((totalMinutes % 1440) / 60);
              const m = totalMinutes % 60;
              return (
                <Typography variant="caption" color="text.secondary">
                  {t('productionPlan.form.estimatedDuration')}: <strong>{`${productionShifts} ${t('productionPlan.form.shifts')} (${d > 0 ? `${d}d ` : ''}${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}min` : ''})`.trim()}</strong>
                </Typography>
              );
            })()}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={() => setEditDialogPlan(null)}>{t('productionPlan.editDialog.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={!editQty || parseInt(editQty, 10) < 1 || !editMachineId || editStartDateError}
          >
            {t('productionPlan.editDialog.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductionPlanList;