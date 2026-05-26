import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HandymanIcon from '@mui/icons-material/Handyman';
import InventoryIcon from '@mui/icons-material/Inventory';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScienceIcon from '@mui/icons-material/Science';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
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
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AxiosError } from 'axios';

import Header from '@/reusableComponents/Header';
import axiosServer from '@/services/axios.service';
import {
  fetchProductionPlans,
  updateProductionPlan,
  updateProductionPlanStatus,
} from '@/state/productionPlan/productionPlan.actions';
import {
  selectProductionPlanError,
  selectProductionPlanLoading,
  selectProductionPlanSuccess,
  selectProductionPlans,
} from '@/state/productionPlan/productionPlan.selectors';
import {
  clearError,
  clearSuccess,
  resetState,
} from '@/state/productionPlan/productionPlan.slice';
import { ProductionPlan } from '@/state/productionPlan/productionPlan.types';
import {
  createPlanAction,
  fetchActionsByPlan,
} from '@/state/productionPlanAction/productionPlanAction.actions';
import {
  selectActionsByPlan,
  selectPlanActionError,
  selectPlanActionSuccess,
} from '@/state/productionPlanAction/productionPlanAction.selectors';
import {
  clearError as clearActionError,
  clearSuccess as clearActionSuccess,
} from '@/state/productionPlanAction/productionPlanAction.slice';
import { ProductionPlanActionType } from '@/state/productionPlanAction/productionPlanAction.types';
import { AppDispatch } from '@/state/store';

type PackagingEntry = {
  id: string;
  packagingUnitId: string;
  packagingUnitName: string;
  quantityPerUnit: number;
};

type BomLineEntry = {
  id: string;
  inputItemId: string;
  inputItemCode: string;
  inputItemName: string;
  quantityPerPiece: number;
  unit: string;
};

type MachineGroup = {
  machineId: string;
  machineName: string;
  machineNumber: number;
  plans: ProductionPlan[];
  allPlans: ProductionPlan[];
  visible: ProductionPlan[];
  extraQueued: number;
  hasInProgress: boolean;
};

const SCRAP_REASONS = [
  'machine',
  'regler',
  'tool',
  'worker',
  'material',
  'aesthetics',
] as const;

const QUEUED_ACTIONS: ProductionPlanActionType[] = [
  'mold_change_started',
  'mold_change_completed',
  'plan_change_started',
  'plan_started',
];

const IN_PROGRESS_ACTIONS: ProductionPlanActionType[] = [
  'operator_started',
  'operator_ended',
  'first_good_part_approved',
  'scrap_entry',
  'qty_increased',
  'packaging_unit_full',
  'quality_checked',
  'machine_service_started',
  'machine_service_ended',
  'machine_repair_started',
  'machine_repair_ended',
  'machine_fault_reported',
  'plan_stopped',
  'plan_completed',
];

const PAUSED_ACTIONS: ProductionPlanActionType[] = [
  'plan_resumed',
  'plan_completed',
  'machine_service_started',
  'machine_service_ended',
  'machine_repair_started',
  'machine_repair_ended',
  'machine_fault_reported',
];

const ACTION_COLORS: Record<
  ProductionPlanActionType,
  'error' | 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'default'
> = {
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
  new Date(val).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });

const fmtBomQty = (qty: number, unit: string): string => {
  if (unit.toLowerCase() === 'g') {
    return `${(qty / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} kg`;
  }
  return qty.toLocaleString(undefined, { maximumFractionDigits: 3 });
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
  s1: boolean, s2: boolean, s3: boolean,
): string => {
  if (!s1 && !s2 && !s3) {
    const d = new Date(startDateStr);
    d.setMinutes(d.getMinutes() + totalMinutes);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const flags: Record<'s1' | 's2' | 's3', boolean> = { s1, s2, s3 };
  let d = new Date(startDateStr);
  let remaining = totalMinutes;
  for (let guard = 0; remaining > 0 && guard < 100000; guard++) {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const minsOfDay = Math.round((d.getTime() - dayStart.getTime()) / 60000);
    const winIdx = SHIFT_WINDOWS.findIndex(([ws, we]) => minsOfDay >= ws && minsOfDay < we);
    if (winIdx === -1) { d = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000); continue; }
    const [, winEnd, shift] = SHIFT_WINDOWS[winIdx];
    if (flags[shift]) {
      const room = winEnd - minsOfDay;
      if (remaining <= room) { d = new Date(d.getTime() + remaining * 60000); remaining = 0; }
      else {
        remaining -= room;
        const nextIdx = winIdx + 1;
        d = nextIdx >= SHIFT_WINDOWS.length
          ? new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
          : new Date(dayStart.getTime() + SHIFT_WINDOWS[nextIdx][0] * 60000);
      }
    } else {
      const nextIdx = winIdx + 1;
      d = nextIdx >= SHIFT_WINDOWS.length
        ? new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        : new Date(dayStart.getTime() + SHIFT_WINDOWS[nextIdx][0] * 60000);
    }
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toDatetimeLocal = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const calcProductionMinutes = (qty: number, plan: ProductionPlan): number | null => {
  if (qty < 1) return null;
  const effectiveCavities = plan.cavities && plan.cavities > 0 ? plan.cavities : 1;
  const cycles = Math.ceil(qty / effectiveCavities);
  if (plan.normPerShift && plan.normPerShift > 0) return Math.ceil((qty / plan.normPerShift) * 480);
  if (plan.cycleTimeSeconds && plan.cycleTimeSeconds > 0) return Math.ceil((cycles * plan.cycleTimeSeconds) / 60);
  return null;
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
          <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>
            {t('productionPlan.dates.start')}:
          </Box>
          {fmtDt(startDate)}
        </Typography>
      )}
      {displayEndDate && (
        <Typography variant="caption" color="text.secondary" display="block">
          <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>
            {t('productionPlan.dates.end')}:
          </Box>
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
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={1}
      py={0.25}
      sx={{ opacity: 0.7 }}
    >
      <Divider sx={{ flexGrow: 1, borderStyle: 'dashed' }} />
      <BuildIcon sx={{ fontSize: 12, color: 'warning.main' }} />
      <Typography
        variant="caption"
        color="warning.main"
        fontWeight={600}
        sx={{ whiteSpace: 'nowrap' }}
      >
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

const ActionFormDefaultState = {
  employeeNumber: '',
  pin: '',
  quantity: '',
  scrapReason: '',
  packagingUnitId: '',
  packagingUnitName: '',
  notes: '',
  timestamp: '',
};

const ProductionView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [packagingCache, setPackagingCache] = useState<
    Record<string, PackagingEntry[]>
  >({});
  const [loadingPkg, setLoadingPkg] = useState<Set<string>>(new Set());
  const [bomCache, setBomCache] = useState<Record<string, BomLineEntry[]>>({});
  const [loadingBom, setLoadingBom] = useState<Set<string>>(new Set());
  const [activeAction, setActiveAction] = useState<{
    planId: string;
    type: ProductionPlanActionType;
  } | null>(null);
  const [actionForm, setActionForm] = useState(ActionFormDefaultState);
  const [verifiedPerson, setVerifiedPerson] = useState<{
    personId: string;
    personName: string;
  } | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const plans = useSelector(selectProductionPlans);
  const loading = useSelector(selectProductionPlanLoading);
  const planError = useSelector(selectProductionPlanError);
  const planSuccess = useSelector(selectProductionPlanSuccess);
  const actionsByPlan = useSelector(selectActionsByPlan);
  const actionError = useSelector(selectPlanActionError);
  const actionSuccess = useSelector(selectPlanActionSuccess);

  const loadedActionsRef = useRef<Set<string>>(new Set());
  const productionInitRef = useRef(false);

  useEffect(() => {
    dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
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

  useEffect(() => {
    if (actionSuccess) {
      setNotification({ message: actionSuccess, type: 'success' });
      dispatch(clearActionSuccess());
      dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
      setActiveAction(null);
      setActionForm(ActionFormDefaultState);
      setVerifiedPerson(null);
      setVerifyError(null);
    }
    if (actionError) {
      setNotification({ message: actionError, type: 'error' });
      dispatch(clearActionError());
    }
  }, [actionSuccess, actionError, dispatch]);

  useEffect(
    () => () => {
      dispatch(resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    if (productionInitRef.current || loading || plans.length === 0) return;
    productionInitRef.current = true;
    const autoLoadIds = plans
      .filter((p) => p.status === 'in_progress')
      .map((p) => p.id);
    if (autoLoadIds.length > 0) {
      setExpandedPlans(new Set(autoLoadIds));
      autoLoadIds.forEach((id) => {
        if (!loadedActionsRef.current.has(id)) {
          loadedActionsRef.current.add(id);
          dispatch(fetchActionsByPlan(id));
        }
      });
    }
  }, [plans, loading, dispatch]);

  const loadPackaging = async (itemId: string) => {
    if (packagingCache[itemId] !== undefined || loadingPkg.has(itemId)) return;
    setLoadingPkg((prev) => new Set(prev).add(itemId));
    try {
      const res = await axiosServer.get(`/item/${itemId}/packaging`);
      const entries: PackagingEntry[] = (
        res.data?.content?.packagings ?? []
      ).map(
        (p: {
          id: string;
          packagingUnitId: string;
          packagingUnitName: string;
          quantityPerUnit: number;
        }) => ({
          id: p.id,
          packagingUnitId: p.packagingUnitId,
          packagingUnitName: p.packagingUnitName,
          quantityPerUnit: p.quantityPerUnit,
        })
      );
      setPackagingCache((prev) => ({ ...prev, [itemId]: entries }));
    } catch {
      setPackagingCache((prev) => ({ ...prev, [itemId]: [] }));
    } finally {
      setLoadingPkg((prev) => {
        const s = new Set(prev);
        s.delete(itemId);
        return s;
      });
    }
  };

  const loadBom = async (itemId: string) => {
    if (bomCache[itemId] !== undefined || loadingBom.has(itemId)) return;
    setLoadingBom((prev) => new Set(prev).add(itemId));
    try {
      const res = await axiosServer.get(`/item/${itemId}/bom`);
      const lines: BomLineEntry[] = (res.data?.content?.bomLines ?? []).map(
        (l: {
          id: string;
          inputItemId: string;
          inputItemCode: string;
          inputItemName: string;
          quantityPerPiece: number | string;
          unit: string;
        }) => ({
          id: l.id,
          inputItemId: l.inputItemId,
          inputItemCode: l.inputItemCode,
          inputItemName: l.inputItemName,
          quantityPerPiece: Number(l.quantityPerPiece),
          unit: l.unit,
        })
      );
      setBomCache((prev) => ({ ...prev, [itemId]: lines }));
    } catch {
      setBomCache((prev) => ({ ...prev, [itemId]: [] }));
    } finally {
      setLoadingBom((prev) => {
        const s = new Set(prev);
        s.delete(itemId);
        return s;
      });
    }
  };

  const togglePlan = (planId: string, plan?: ProductionPlan) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
        if (plan && !loadedActionsRef.current.has(planId)) {
          loadedActionsRef.current.add(planId);
          dispatch(fetchActionsByPlan(planId));
        }
        if (plan) loadBom(plan.itemId);
      }
      return next;
    });
    if (activeAction?.planId === planId) {
      setActiveAction(null);
      setActionForm(ActionFormDefaultState);
    }
  };

  const groupedByMachine = useMemo(() => {
    const acc: Record<
      string,
      {
        machineId: string;
        machineName: string;
        machineNumber: number;
        plans: ProductionPlan[];
      }
    > = {};
    for (const plan of plans) {
      if (!acc[plan.machineId]) {
        acc[plan.machineId] = {
          machineId: plan.machineId,
          machineName: plan.machineName ?? '',
          machineNumber: plan.machineNumber ?? 0,
          plans: [],
        };
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
        return {
          ...g,
          allPlans: allSorted,
          visible,
          extraQueued,
          hasInProgress: inProgress.length > 0,
        };
      })
      .sort((a, b) => a.machineNumber - b.machineNumber);
  }, [plans]);

  // A plan is "paused" when plan_stopped is the last state-changing action logged for it.
  const isPlanPaused = (planId: string): boolean => {
    const actions = actionsByPlan[planId];
    if (!actions || actions.length === 0) return false;
    const stateActions = [...actions]
      .filter((a) =>
        [
          'plan_started',
          'plan_resumed',
          'plan_stopped',
          'operator_started',
        ].includes(a.actionType)
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    if (stateActions.length === 0) return false;
    return stateActions[stateActions.length - 1].actionType === 'plan_stopped';
  };

  const isFirstQueuedPlan = (
    plan: ProductionPlan,
    group: MachineGroup
  ): boolean => {
    const queuedPlans = group.allPlans
      .filter((p) => p.status === 'queued')
      .sort((a, b) => a.position - b.position);
    return queuedPlans[0]?.id === plan.id;
  };

  const moldChangeNeeded = (
    plan: ProductionPlan,
    group: MachineGroup
  ): boolean => {
    if (!plan.moldId) return false;
    const inProgress = group.allPlans.find((p) => p.status === 'in_progress');
    const currentMoldId =
      inProgress?.moldId ??
      (() => {
        const done = group.allPlans
          .filter((p) => p.status === 'done')
          .sort((a, b) => a.position - b.position);
        return done.length > 0 ? done[done.length - 1].moldId : null;
      })();
    if (currentMoldId === plan.moldId) return false;
    const planActions = actionsByPlan[plan.id] ?? [];
    return !planActions.some((a) => a.actionType === 'mold_change_completed');
  };

  const resetActionState = () => {
    setActiveAction(null);
    setActionForm(ActionFormDefaultState);
    setVerifiedPerson(null);
    setVerifyError(null);
  };

  const handleActionSelect = (
    planId: string,
    type: ProductionPlanActionType,
    plan: ProductionPlan
  ) => {
    if (activeAction?.planId === planId && activeAction.type === type) {
      resetActionState();
      return;
    }
    setActiveAction({ planId, type });
    setActionForm(ActionFormDefaultState);
    setVerifiedPerson(null);
    setVerifyError(null);
    if (type === 'packaging_unit_full') loadPackaging(plan.itemId);
  };

  const handleVerify = async () => {
    if (!activeAction || !actionForm.employeeNumber) return;
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      const res = await axiosServer.post(
        '/production-plan-action/verify-permission',
        {
          employeeNumber: actionForm.employeeNumber,
          pin: actionForm.pin,
          actionType: activeAction.type,
        }
      );
      if (res.data.success) {
        setVerifiedPerson(
          res.data.content as { personId: string; personName: string }
        );
        return;
      }
      // The axios interceptor resolves 4xx as regular responses (no throw).
      // Status is available directly on res.
      const { status } = res;
      if (status === 403) {
        setVerifyError(
          `${t('productionPlan.actions.noPermission')}: ${t(`productionPlan.actions.types.${activeAction.type}`)}`
        );
      } else if (status === 422) {
        setVerifyError(t('productionPlan.actions.incorrectPin'));
      } else if (status === 404) {
        setVerifyError(t('productionPlan.actions.employeeNotFound'));
      } else {
        const errData = res.data as {
          error?: { message?: string };
          message?: string;
        };
        setVerifyError(
          errData.error?.message ??
            errData.message ??
            t('productionPlan.actions.verifyFailed')
        );
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      setVerifyError(
        axiosErr?.response?.data?.error?.message ??
          t('productionPlan.actions.verifyFailed')
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const buildCascadeUpdates = (
    anchorPlan: ProductionPlan,
    anchorEndDate: string,
    anchorQty: number,
    anchorStart: string,
    includeAnchor = true,
  ) => {
    type PlanUpdate = Parameters<typeof updateProductionPlan>[0];
    const sh1 = anchorPlan.shift1 ?? true;
    const sh2 = anchorPlan.shift2 ?? true;
    const sh3 = anchorPlan.shift3 ?? true;
    const updates: PlanUpdate[] = includeAnchor ? [{
      id: anchorPlan.id,
      itemId: anchorPlan.itemId,
      machineId: anchorPlan.machineId,
      moldId: anchorPlan.moldId,
      quantity: anchorQty,
      expectedStartDate: anchorStart,
      expectedEndDate: anchorEndDate,
      status: anchorPlan.status,
      notes: anchorPlan.notes,
      customerOrderLineId: anchorPlan.customerOrderLineId,
      shift1: sh1,
      shift2: sh2,
      shift3: sh3,
    }] : [];

    const subsequent = plans
      .filter((p) => p.machineId === anchorPlan.machineId && p.status === 'queued' && p.position > anchorPlan.position)
      .sort((a, b) => a.position - b.position);

    let prevEnd = anchorEndDate;
    let prevMoldId = anchorPlan.moldId ?? null;

    for (const next of subsequent) {
      if (!prevEnd) break;
      const moldChanging = !!next.moldId && next.moldId !== prevMoldId;
      const mountMins = moldChanging && next.moldMountingTimeMinutes ? next.moldMountingTimeMinutes : 0;
      const prodMins = calcProductionMinutes(next.quantity, next);
      if (prodMins === null) break;
      const nsh1 = next.shift1 ?? true;
      const nsh2 = next.shift2 ?? true;
      const nsh3 = next.shift3 ?? true;
      const nextEnd = advanceShiftMinutes(prevEnd, mountMins + prodMins, nsh1, nsh2, nsh3);
      updates.push({
        id: next.id,
        itemId: next.itemId,
        machineId: next.machineId,
        moldId: next.moldId,
        quantity: next.quantity,
        expectedStartDate: prevEnd,
        expectedEndDate: nextEnd,
        status: next.status,
        notes: next.notes,
        customerOrderLineId: next.customerOrderLineId,
        shift1: nsh1,
        shift2: nsh2,
        shift3: nsh3,
      });
      prevEnd = nextEnd;
      prevMoldId = next.moldId ?? null;
    }

    return updates;
  };

  const handleActionSubmit = async (plan: ProductionPlan) => {
    if (!activeAction || !verifiedPerson) return;
    const data = {
      productionPlanId: plan.id,
      actionType: activeAction.type,
      performedByPersonId: verifiedPerson.personId,
      performedByName: verifiedPerson.personName,
      quantity: actionForm.quantity ? parseInt(actionForm.quantity, 10) : null,
      scrapReason: actionForm.scrapReason || null,
      packagingUnitId: actionForm.packagingUnitId || null,
      packagingUnitName: actionForm.packagingUnitName || null,
      notes: actionForm.notes || null,
      timestamp: actionForm.timestamp
        ? new Date(actionForm.timestamp).toISOString()
        : undefined,
    };
    dispatch(createPlanAction(data));

    if (activeAction.type === 'plan_started') {
      dispatch(updateProductionPlanStatus({ id: plan.id, status: 'in_progress' }));
      const actualStart = actionForm.timestamp
        ? toDatetimeLocal(new Date(actionForm.timestamp))
        : toDatetimeLocal(new Date());
      const prodMins = calcProductionMinutes(plan.quantity, plan);
      if (prodMins !== null) {
        const sh1 = plan.shift1 ?? true;
        const sh2 = plan.shift2 ?? true;
        const sh3 = plan.shift3 ?? true;
        // Mounting is already done at this point — end = actualStart + production only
        const newEnd = advanceShiftMinutes(actualStart, prodMins, sh1, sh2, sh3);
        const updates = buildCascadeUpdates(plan, newEnd, plan.quantity, actualStart);
        await Promise.all(updates.map((u) => dispatch(updateProductionPlan(u))));
        dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
      }
    }

    if (activeAction.type === 'qty_increased') {
      const added = actionForm.quantity ? parseInt(actionForm.quantity, 10) : 0;
      if (added > 0 && plan.expectedStartDate) {
        const newQty = plan.quantity + added;
        const sh1 = plan.shift1 ?? true;
        const sh2 = plan.shift2 ?? true;
        const sh3 = plan.shift3 ?? true;
        const prodMins = calcProductionMinutes(newQty, plan);
        if (prodMins !== null) {
          // Plan is in_progress: mounting already done, recalculate from current start
          const newEnd = advanceShiftMinutes(plan.expectedStartDate, prodMins, sh1, sh2, sh3);
          const updates = buildCascadeUpdates(plan, newEnd, newQty, plan.expectedStartDate);
          await Promise.all(updates.map((u) => dispatch(updateProductionPlan(u))));
          dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
        }
      }
    }

    if (activeAction.type === 'scrap_entry') {
      const scrapAdded = actionForm.quantity ? parseInt(actionForm.quantity, 10) : 0;
      if (scrapAdded > 0 && plan.expectedStartDate && plan.status === 'in_progress') {
        const currentScrap = plan.scrapQuantity ?? 0;
        // effectiveQty = good parts needed + all scraps (current + new) = total gross production required
        const effectiveQty = plan.quantity + currentScrap + scrapAdded;
        const prodMins = calcProductionMinutes(effectiveQty, plan);
        if (prodMins !== null) {
          const sh1 = plan.shift1 ?? true;
          const sh2 = plan.shift2 ?? true;
          const sh3 = plan.shift3 ?? true;
          const newEnd = advanceShiftMinutes(plan.expectedStartDate, prodMins, sh1, sh2, sh3);
          const updates = buildCascadeUpdates(plan, newEnd, plan.quantity, plan.expectedStartDate);
          await Promise.all(updates.map((u) => dispatch(updateProductionPlan(u))));
          dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
        }
      }
    }

    if (activeAction.type === 'plan_completed') {
      const qty = actionForm.quantity ? parseInt(actionForm.quantity, 10) : undefined;
      dispatch(updateProductionPlanStatus({ id: plan.id, status: 'done', producedQuantity: qty }));
      const actualEnd = actionForm.timestamp
        ? toDatetimeLocal(new Date(actionForm.timestamp))
        : toDatetimeLocal(new Date());
      const cascadeUpdates = buildCascadeUpdates(
        plan, actualEnd, plan.quantity, plan.expectedStartDate ?? actualEnd, false,
      );
      if (cascadeUpdates.length > 0) {
        await Promise.all(cascadeUpdates.map((u) => dispatch(updateProductionPlan(u))));
        dispatch(fetchProductionPlans({ page: 1, limit: 1000 }));
      }
    }
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
    const scrapActions = actions.filter(
      (a) =>
        a.actionType === 'scrap_entry' && a.quantity != null && a.quantity > 0
    );
    if (scrapActions.length === 0) return null;
    const total = scrapActions.reduce((sum, a) => sum + (a.quantity ?? 0), 0);
    const byReason: Record<string, number> = {};
    scrapActions.forEach((a) => {
      const r = a.scrapReason ?? 'unknown';
      byReason[r] = (byReason[r] ?? 0) + (a.quantity ?? 0);
    });
    return (
      <Box
        sx={{
          mt: 1.5,
          mb: 1.5,
          p: 1,
          border: '1px solid',
          borderColor: 'error.light',
          borderRadius: 1,
          backgroundColor: 'error.50',
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="error.main"
          display="block"
          mb={0.75}
        >
          {t('productionPlan.scrap.overview')} — {total.toLocaleString()}{' '}
          {t('productionPlan.scrap.pcs')}
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
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          display="block"
          mb={0.5}
        >
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
                <Box
                  key={action.id}
                  display="flex"
                  alignItems="flex-start"
                  gap={1}
                >
                  <Box
                    sx={{
                      mt: 0.25,
                      color: `${ACTION_COLORS[action.actionType]}.main`,
                      flexShrink: 0,
                    }}
                  >
                    {ACTION_ICON_MAP[action.actionType]}
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      display="block"
                    >
                      {t(`productionPlan.actions.types.${action.actionType}`)}
                      {(action.performedByPersonName ||
                        action.performedByName) && (
                        <Box
                          component="span"
                          sx={{
                            fontWeight: 400,
                            color: 'text.secondary',
                            ml: 0.5,
                          }}
                        >
                          —{' '}
                          {action.performedByPersonName ??
                            action.performedByName}
                        </Box>
                      )}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      display="block"
                    >
                      {new Date(action.timestamp).toLocaleString()}
                      {action.quantity != null &&
                        ` · ${action.quantity.toLocaleString()} kom`}
                      {action.scrapReason &&
                        ` · ${t(`productionPlan.steps.scrapReasons.${action.scrapReason}`)}`}
                      {action.packagingUnitName &&
                        ` · ${action.packagingUnitName}`}
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

  const renderActionForm = (plan: ProductionPlan) => {
    if (!activeAction || activeAction.planId !== plan.id) return null;
    const type = activeAction.type;
    const needsQty =
      type === 'scrap_entry' ||
      type === 'qty_increased' ||
      type === 'plan_completed';
    const needsScrapReason = type === 'scrap_entry';
    const needsPackaging = type === 'packaging_unit_full';
    const pkgList = packagingCache[plan.itemId] ?? [];

    return (
      <Box
        sx={{
          mt: 1,
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'action.hover',
        }}
      >
        <Typography variant="caption" fontWeight={700} display="block" mb={1.5}>
          {t(`productionPlan.actions.types.${type}`)}
        </Typography>
        <Stack spacing={1.5}>
          {!verifiedPerson ? (
            <Box>
              <Box display="flex" gap={1} alignItems="flex-start">
                <TextField
                  label={t('productionPlan.actions.employeeNumber')}
                  size="small"
                  value={actionForm.employeeNumber}
                  onChange={(e) =>
                    setActionForm((p) => ({
                      ...p,
                      employeeNumber: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify();
                  }}
                  sx={{ width: 140 }}
                />
                <TextField
                  label={t('productionPlan.actions.pin')}
                  type="password"
                  size="small"
                  value={actionForm.pin}
                  onChange={(e) =>
                    setActionForm((p) => ({ ...p, pin: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify();
                  }}
                  sx={{ width: 120 }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleVerify}
                  disabled={verifyLoading || !actionForm.employeeNumber}
                >
                  {verifyLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    t('productionPlan.actions.verify')
                  )}
                </Button>
              </Box>
              {verifyError && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  mt={0.5}
                >
                  {verifyError}
                </Typography>
              )}
            </Box>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ color: 'success.main' }}
            >
              <CheckCircleIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={700}>
                {verifiedPerson.personName}
              </Typography>
              <Button
                size="small"
                variant="text"
                sx={{ ml: 'auto', fontSize: '0.65rem' }}
                onClick={() => {
                  setVerifiedPerson(null);
                  setVerifyError(null);
                }}
              >
                {t('productionPlan.actions.reVerify')}
              </Button>
            </Box>
          )}

          {needsQty && (
            <TextField
              label={
                type === 'plan_completed'
                  ? t('productionPlan.actions.producedQtyFinal')
                  : t('productionPlan.actions.quantity')
              }
              type="number"
              size="small"
              value={actionForm.quantity}
              onChange={(e) =>
                setActionForm((p) => ({ ...p, quantity: e.target.value }))
              }
              inputProps={{ min: 0 }}
            />
          )}

          {needsScrapReason && (
            <FormControl size="small" fullWidth>
              <InputLabel>{t('productionPlan.actions.scrapReason')}</InputLabel>
              <Select
                value={actionForm.scrapReason}
                label={t('productionPlan.actions.scrapReason')}
                onChange={(e: SelectChangeEvent) =>
                  setActionForm((p) => ({ ...p, scrapReason: e.target.value }))
                }
              >
                {SCRAP_REASONS.map((r) => (
                  <MenuItem key={r} value={r}>
                    {t(`productionPlan.steps.scrapReasons.${r}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {needsPackaging && (
            <FormControl size="small" fullWidth>
              <InputLabel>
                {t('productionPlan.actions.selectPackaging')}
              </InputLabel>
              <Select
                value={actionForm.packagingUnitId}
                label={t('productionPlan.actions.selectPackaging')}
                onChange={(e: SelectChangeEvent) => {
                  const selected = pkgList.find(
                    (p) => p.packagingUnitId === e.target.value
                  );
                  setActionForm((prev) => ({
                    ...prev,
                    packagingUnitId: e.target.value,
                    packagingUnitName: selected?.packagingUnitName ?? '',
                  }));
                }}
              >
                <MenuItem value="">
                  <em>{t('productionPlan.actions.selectPackaging')}</em>
                </MenuItem>
                {pkgList.map((pkg) => (
                  <MenuItem
                    key={pkg.packagingUnitId}
                    value={pkg.packagingUnitId}
                  >
                    {pkg.packagingUnitName} ({pkg.quantityPerUnit} kom)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label={t('productionPlan.actions.notes')}
            size="small"
            value={actionForm.notes}
            onChange={(e) =>
              setActionForm((p) => ({ ...p, notes: e.target.value }))
            }
            multiline
            rows={2}
          />

          <TextField
            label={t('productionPlan.actions.timestamp')}
            type="datetime-local"
            size="small"
            value={actionForm.timestamp}
            onChange={(e) =>
              setActionForm((p) => ({ ...p, timestamp: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
            helperText={t('productionPlan.actions.timestampHint')}
          />

          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleActionSubmit(plan)}
              disabled={!verifiedPerson}
            >
              {t('productionPlan.actions.submit')}
            </Button>
            <Button size="small" variant="text" onClick={resetActionState}>
              {t('productionPlan.actions.cancel')}
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  };

  const renderBomSection = (plan: ProductionPlan) => {
    const lines = bomCache[plan.itemId];
    const isLoading = loadingBom.has(plan.itemId);
    if (isLoading)
      return (
        <Box py={1}>
          <CircularProgress size={16} />
        </Box>
      );
    if (!lines || lines.length === 0) return null;

    const effectiveCavities = plan.cavities && plan.cavities > 0 ? plan.cavities : 1;
    const cycles = Math.ceil(plan.quantity / effectiveCavities);
    const producedAndScrap = (plan.producedQuantity ?? 0) + (plan.scrapQuantity ?? 0);
    const spentCycles = Math.ceil(producedAndScrap / effectiveCavities);
    const derivedPieceWeightG = lines
      .filter((l) => l.unit.toLowerCase() === 'g')
      .reduce((sum, l) => sum + l.quantityPerPiece, 0);
    const hasMaterialData = plan.runnerWeightG != null && derivedPieceWeightG > 0;

    return (
      <Box sx={{ mb: 1.5, mt: 0.5 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          display="block"
          mb={0.5}
        >
          {t('productionPlan.bom.title')}
          {plan.normPerShift && (
            <Box component="span" sx={{ ml: 1, color: 'text.disabled' }}>
              ({t('productionPlan.bom.norm')}:{' '}
              {plan.normPerShift.toLocaleString()}
              {effectiveCavities > 1 && ` · ${effectiveCavities} ${t('productionPlan.bom.nests')}`})
            </Box>
          )}
        </Typography>
        <Table
          size="small"
          sx={{ '& td, & th': { py: 0.25, px: 0.75, fontSize: '0.7rem' } }}
        >
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
                    {line.unit.toLowerCase() === 'g'
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

  const renderActionButtons = (plan: ProductionPlan, group: MachineGroup) => {
    // Find the one "active" in_progress plan (not paused) for this machine, if any.
    const activePlan =
      group.allPlans.find(
        (p) => p.status === 'in_progress' && !isPlanPaused(p.id)
      ) ?? null;

    let actionList: ProductionPlanActionType[];

    if (plan.status === 'in_progress') {
      if (activePlan && activePlan.id !== plan.id) {
        // Another plan is actively running — this paused plan is locked
        return null;
      }
      actionList = isPlanPaused(plan.id) ? PAUSED_ACTIONS : IN_PROGRESS_ACTIONS;
    } else if (plan.status === 'queued') {
      // Queued plans are locked while any plan is actively running
      if (activePlan) return null;
      if (moldChangeNeeded(plan, group)) {
        const planActions = actionsByPlan[plan.id] ?? [];
        const changeStarted = planActions.some((a) => a.actionType === 'mold_change_started');
        actionList = changeStarted ? ['mold_change_completed'] : ['mold_change_started'];
      } else {
        const planActions = actionsByPlan[plan.id] ?? [];
        const moldChangeDone = planActions.some((a) => a.actionType === 'mold_change_completed');
        const setupStarted = planActions.some((a) => a.actionType === 'machine_setup_started');
        const setupCompleted = planActions.some((a) => a.actionType === 'machine_setup_completed');

        if (moldChangeDone && !setupStarted) {
          // Mold is mounted — Machine Startup Regler must begin fine-tuning
          actionList = ['machine_setup_started'];
        } else if (setupStarted && !setupCompleted) {
          // Fine-tuning in progress — can log startup scrap and complete setup
          actionList = ['machine_setup_completed', 'scrap_entry'];
        } else if (setupCompleted) {
          // Machine ready — can log startup scrap and start production
          actionList = ['scrap_entry', 'plan_started'];
        } else {
          // No mold change involved — normal queued flow
          const base = !isFirstQueuedPlan(plan, group)
            ? QUEUED_ACTIONS.filter((a) => a !== 'plan_started')
            : [...QUEUED_ACTIONS];
          actionList = base;
        }
      }
    } else {
      return null;
    }

    if (actionList.length === 0) return null;

    return (
      <Box sx={{ mt: 1 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          display="block"
          mb={0.75}
        >
          {t('productionPlan.actions.title')}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={0.75}>
          {actionList.map((type) => {
            const isActive =
              activeAction?.planId === plan.id && activeAction.type === type;
            return (
              <Chip
                key={type}
                label={t(`productionPlan.actions.types.${type}`)}
                icon={ACTION_ICON_MAP[type]}
                color={isActive ? ACTION_COLORS[type] : 'default'}
                variant={isActive ? 'filled' : 'outlined'}
                size="small"
                onClick={() => handleActionSelect(plan.id, type, plan)}
                sx={{ cursor: 'pointer' }}
              />
            );
          })}
        </Box>
        {renderActionForm(plan)}
      </Box>
    );
  };

  const renderProductionRow = (
    plan: ProductionPlan,
    prevPlan: ProductionPlan | null,
    group: MachineGroup
  ) => {
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
    const isDone = plan.status === 'done';

    return (
      <Box key={plan.id}>
        {moldChanged && (
          <MoldChangeIndicator
            label={t('productionPlan.planner.moldChange')}
            estLabel={t('productionPlan.planner.moldChangeEst')}
            minutes={plan.moldMountingTimeMinutes}
            startDate={plan.expectedStartDate}
          />
        )}
        {needsInitialMount && (
          <MoldChangeIndicator
            label={t('productionPlan.planner.initialMount')}
            estLabel={t('productionPlan.planner.initialMountEst')}
            minutes={plan.moldMountingTimeMinutes}
            startDate={plan.expectedStartDate}
          />
        )}
        <Box
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            opacity: isDone ? 0.55 : 1,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            px={1}
            py={0.75}
            sx={{
              cursor: isDone ? 'default' : 'pointer',
              borderRadius: 1,
              '&:hover': !isDone
                ? { backgroundColor: theme.palette.action.hover }
                : {},
            }}
            onClick={() => !isDone && togglePlan(plan.id, plan)}
          >
            {!isDone && (
              <ExpandMoreIcon
                sx={{
                  fontSize: 18,
                  color: 'text.secondary',
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                }}
              />
            )}
            {isDone && <Box sx={{ width: 18, flexShrink: 0 }} />}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 24, fontWeight: 700, flexShrink: 0 }}
            >
              #{plan.position}
            </Typography>
            <Box flexGrow={1} minWidth={0}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {plan.itemCode} — {plan.itemName}
              </Typography>
              {plan.moldName && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  noWrap
                >
                  #{plan.moldInventoryNumber} {plan.moldName}
                </Typography>
              )}
              {plan.orderNumber && (
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {plan.orderNumber}{plan.customerName ? ` · ${plan.customerName}` : ''}
                </Typography>
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{ width: 90, textAlign: 'right', flexShrink: 0 }}
            >
              {renderQty(plan)}
            </Typography>
            {renderScrap(plan, t)}
            {renderDateRange(plan, t, effectiveStartDate, needsMounting)}
            <Box
              sx={{
                width: 90,
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Chip
                label={t(`productionPlan.status.${plan.status}`)}
                color={statusColor(plan.status)}
                size="small"
              />
            </Box>
          </Box>

          {isExpanded && (
            <Box sx={{ pl: 5, pr: 2, pb: 2, pt: 0.5 }}>
              {renderBomSection(plan)}
              {renderProductionStats(plan)}
              {renderActionButtons(plan, group)}
              {renderScrapOverview(plan.id)}
              <Box sx={{ mt: 1.5 }}>{renderTimeline(plan.id)}</Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderMachineGroup = (group: MachineGroup) => (
    <Accordion
      key={group.machineId}
      defaultExpanded
      disableGutters
      sx={{
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'transparent',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 0,
          minHeight: 'auto',
          pb: 0.5,
          borderBottom: `2px solid ${theme.palette.secondary[300]}`,
          '& .MuiAccordionSummary-content': {
            my: 0,
            alignItems: 'center',
            gap: 1,
          },
          '&.Mui-expanded': {
            borderBottom: `2px solid ${theme.palette.secondary[300]}`,
          },
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline', opacity: 0.8 },
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/machine-plan/${group.machineId}`);
          }}
        >
          #{group.machineNumber} — {group.machineName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({group.allPlans.length})
        </Typography>
        {group.hasInProgress && (
          <Chip
            label={t('productionPlan.status.in_progress')}
            color="warning"
            size="small"
          />
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 1, pb: 0 }}>
        <Stack spacing={0}>
          {group.visible.map((plan, idx) =>
            renderProductionRow(
              plan,
              idx > 0 ? group.visible[idx - 1] : null,
              group
            )
          )}
        </Stack>
        {group.extraQueued > 0 && (
          <Box
            px={1}
            py={0.75}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/machine-plan/${group.machineId}`)}
          >
            <Typography
              variant="caption"
              color="secondary.main"
              fontWeight={600}
            >
              {t('productionPlan.planner.moreQueued', {
                count: group.extraQueued,
              })}
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 1, sm: 2 },
        pb: 1,
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Header
          title={t('productionPlan.list.titleProduction')}
          subtitle={t('productionPlan.list.subtitleProduction')}
        />
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        {loading && <LinearProgress sx={{ mb: 1 }} />}
        {!loading && groupedByMachine.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            {t('productionPlan.grouped.empty')}
          </Typography>
        )}
        <Stack spacing={3}>
          {groupedByMachine.map((group) => renderMachineGroup(group))}
        </Stack>
      </Box>

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={notification?.type}
          onClose={() => setNotification(null)}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductionView;
