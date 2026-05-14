import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import InventoryIcon from '@mui/icons-material/Inventory';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import HandymanIcon from '@mui/icons-material/Handyman';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ScienceIcon from '@mui/icons-material/Science';
import SearchIcon from '@mui/icons-material/Search';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
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
import type { Theme } from '@mui/material/styles';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog';
import Header from '@/reusableComponents/Header';
import axiosServer from '@/services/axios.service';
import {
  deleteProductionPlan,
  fetchAllProductionPlansByMachine,
  reorderProductionPlans,
} from '@/state/productionPlan/productionPlan.actions';
import {
  selectProductionPlanError,
  selectProductionPlanLoading,
  selectProductionPlanSuccess,
  selectProductionPlansByMachine,
} from '@/state/productionPlan/productionPlan.selectors';
import { clearError, clearSuccess, resetState } from '@/state/productionPlan/productionPlan.slice';
import { ProductionPlan } from '@/state/productionPlan/productionPlan.types';
import { fetchActionsByPlan } from '@/state/productionPlanAction/productionPlanAction.actions';
import { selectActionsByPlan } from '@/state/productionPlanAction/productionPlanAction.selectors';
import { ProductionPlanActionType } from '@/state/productionPlanAction/productionPlanAction.types';
import { AppDispatch } from '@/state/store';

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
  plan_started: 'success',
  first_good_part_approved: 'success',
  operator_started: 'primary',
  operator_changed: 'info',
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

const ACTION_ICON_MAP: Record<ProductionPlanActionType, ReactNode> = {
  mold_change_started: <BuildIcon sx={{ fontSize: 16 }} />,
  mold_change_completed: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  plan_started: <PlayArrowIcon sx={{ fontSize: 16 }} />,
  first_good_part_approved: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  operator_started: <PersonAddIcon sx={{ fontSize: 16 }} />,
  operator_changed: <SwapHorizIcon sx={{ fontSize: 16 }} />,
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

const statusColor = (status: string) => {
  if (status === 'in_progress') return 'warning' as const;
  if (status === 'done') return 'success' as const;
  if (status === 'cancelled') return 'error' as const;
  return 'default' as const;
};

const moldChanged = (plan: ProductionPlan, prev: ProductionPlan | null): boolean => {
  if (!prev) return false;
  return plan.moldId !== prev.moldId;
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

const renderQty = (plan: ProductionPlan) => {
  if (plan.status === 'done') {
    const produced = plan.producedQuantity ?? plan.quantity;
    return `${produced.toLocaleString()} / ${plan.quantity.toLocaleString()}`;
  }
  if (plan.status === 'in_progress') {
    const produced = plan.producedQuantity ?? 0;
    return `${produced.toLocaleString()} / ${plan.quantity.toLocaleString()}`;
  }
  return `— / ${plan.quantity.toLocaleString()}`;
};

const fmtBomQty = (qty: number, unit: string): string => {
  if (unit.toLowerCase() === 'g') {
    return `${(qty / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} kg`;
  }
  return qty.toLocaleString(undefined, { maximumFractionDigits: 3 });
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

const MoldChangeBar = ({ label, estLabel, minutes, startDate }: { label: string; estLabel: string; minutes?: number | null; startDate?: string | null }) => {
  const endDate = startDate && minutes != null && minutes > 0
    ? new Date(new Date(startDate).getTime() + minutes * 60 * 1000).toISOString()
    : null;
  return (
    <Box display="flex" alignItems="center" gap={1} px={1} py={0.25}>
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

type SortableRowProps = {
  plan: ProductionPlan;
  prev: ProductionPlan | null;
  moldChangeLabel: string;
  moldChangeEstLabel: string;
  onDelete: () => void;
  t: (key: string) => string;
  theme: Theme;
  isExpanded: boolean;
  onToggle: () => void;
  expandedContent?: ReactNode;
};

const SortablePlanRow = ({ plan, prev, moldChangeLabel, moldChangeEstLabel, onDelete, t, theme, isExpanded, onToggle, expandedContent }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: plan.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  const hasMoldChange = moldChanged(plan, prev);
  const needsInitialMount =
    !prev &&
    !!plan.moldId &&
    !!plan.moldMountingTimeMinutes &&
    plan.moldCurrentMachineId !== plan.machineId;
  const needsMounting = hasMoldChange || needsInitialMount;
  const effectiveStartDate =
    needsMounting && plan.moldMountingTimeMinutes && plan.expectedStartDate
      ? new Date(new Date(plan.expectedStartDate).getTime() + plan.moldMountingTimeMinutes * 60 * 1000).toISOString()
      : plan.expectedStartDate;

  return (
    <Box ref={setNodeRef} style={style}>
      {hasMoldChange && <MoldChangeBar label={moldChangeLabel} estLabel={moldChangeEstLabel} minutes={plan.moldMountingTimeMinutes} startDate={plan.expectedStartDate} />}
      {needsInitialMount && <MoldChangeBar label={t('productionPlan.planner.initialMount')} estLabel={t('productionPlan.planner.initialMountEst')} minutes={plan.moldMountingTimeMinutes} startDate={plan.expectedStartDate} />}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: isDragging ? theme.palette.action.selected : 'transparent',
          borderRadius: isDragging ? 1 : 0,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          px={1}
          py={0.75}
          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
          onClick={onToggle}
        >
          <Tooltip title={t('productionPlan.machineDetail.dragHint')}>
            <IconButton
              size="small"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              sx={{ cursor: 'grab', color: 'text.disabled', flexShrink: 0 }}
            >
              <DragHandleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
          <Box sx={{ width: 130, flexShrink: 0 }}>
            {effectiveStartDate && (
              <Typography variant="caption" color="text.secondary" display="block">
                <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>{t('productionPlan.dates.start')}:</Box>
                {new Date(effectiveStartDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </Typography>
            )}
            {plan.expectedEndDate && (
              <Typography variant="caption" color="text.secondary" display="block">
                <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>{t('productionPlan.dates.end')}:</Box>
                {new Date(plan.expectedEndDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: 90, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <Chip label={t(`productionPlan.status.${plan.status}`)} color={statusColor(plan.status)} size="small" />
          </Box>
          <IconButton
            size="small"
            color="error"
            sx={{ flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        {isExpanded && (
          <Box sx={{ pl: 5, pr: 2, pb: 2, pt: 0.5 }}>
            {expandedContent}
          </Box>
        )}
      </Box>
    </Box>
  );
};

type StaticRowProps = {
  plan: ProductionPlan;
  prev: ProductionPlan | null;
  moldChangeLabel: string;
  moldChangeEstLabel: string;
  t: (key: string) => string;
  isExpanded: boolean;
  onToggle: () => void;
  expandedContent?: ReactNode;
};

const StaticPlanRow = ({ plan, prev, moldChangeLabel, moldChangeEstLabel, t, isExpanded, onToggle, expandedContent }: StaticRowProps) => {
  const hasMoldChange = moldChanged(plan, prev);
  const needsInitialMount =
    !prev &&
    !!plan.moldId &&
    !!plan.moldMountingTimeMinutes &&
    plan.moldCurrentMachineId !== plan.machineId;
  const needsMounting = hasMoldChange || needsInitialMount;
  const effectiveStartDate =
    needsMounting && plan.moldMountingTimeMinutes && plan.expectedStartDate
      ? new Date(new Date(plan.expectedStartDate).getTime() + plan.moldMountingTimeMinutes * 60 * 1000).toISOString()
      : plan.expectedStartDate;
  return (
  <Box sx={{ opacity: plan.status === 'done' ? 0.55 : 1 }}>
    {hasMoldChange && <MoldChangeBar label={moldChangeLabel} estLabel={moldChangeEstLabel} minutes={plan.moldMountingTimeMinutes} startDate={plan.expectedStartDate} />}
    {needsInitialMount && <MoldChangeBar label={t('productionPlan.planner.initialMount')} estLabel={t('productionPlan.planner.initialMountEst')} minutes={plan.moldMountingTimeMinutes} startDate={plan.expectedStartDate} />}
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        px={1}
        py={0.75}
        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
        onClick={onToggle}
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
        <Box sx={{ width: 130, flexShrink: 0 }}>
          {effectiveStartDate && (
            <Typography variant="caption" color="text.secondary" display="block">
              <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>{t('productionPlan.dates.start')}:</Box>
              {new Date(effectiveStartDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
            </Typography>
          )}
          {plan.expectedEndDate && (
            <Typography variant="caption" color="text.secondary" display="block">
              <Box component="span" sx={{ opacity: 0.6, mr: 0.5 }}>{t('productionPlan.dates.end')}:</Box>
              {new Date(plan.expectedEndDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: 90, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <Chip label={t(`productionPlan.status.${plan.status}`)} color={statusColor(plan.status)} size="small" />
        </Box>
        <Box sx={{ width: 34, flexShrink: 0 }} />
      </Box>
      {isExpanded && (
        <Box sx={{ pl: 5, pr: 2, pb: 2, pt: 0.5 }}>
          {expandedContent}
        </Box>
      )}
    </Box>
  </Box>
  );
};

const MachinePlanDetail = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const allPlans = useSelector(selectProductionPlansByMachine);
  const loading = useSelector(selectProductionPlanLoading);
  const error = useSelector(selectProductionPlanError);
  const success = useSelector(selectProductionPlanSuccess);
  const actionsByPlan = useSelector(selectActionsByPlan);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAllDone, setShowAllDone] = useState(false);
  const [localQueued, setLocalQueued] = useState<ProductionPlan[]>([]);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [bomCache, setBomCache] = useState<Record<string, BomLineEntry[]>>({});
  const [loadingBom, setLoadingBom] = useState<Set<string>>(new Set());

  const machineInfo = useRef<{ name: string; number: number } | null>(null);
  const bomCacheRef = useRef<Record<string, BomLineEntry[]>>({});
  const loadingBomRef = useRef<Set<string>>(new Set());
  const loadedActionsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPlans = useCallback(() => {
    if (machineId) {
      dispatch(fetchAllProductionPlansByMachine({ machineId, search: debouncedSearch || undefined }));
    }
  }, [dispatch, machineId, debouncedSearch]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  useEffect(() => () => { dispatch(resetState()); }, [dispatch]);

  useEffect(() => {
    if (allPlans.length > 0 && !machineInfo.current) {
      machineInfo.current = { name: allPlans[0].machineName ?? '', number: allPlans[0].machineNumber ?? 0 };
    }
  }, [allPlans]);

  const loadBomLines = useCallback(async (itemId: string) => {
    if (bomCacheRef.current[itemId] !== undefined || loadingBomRef.current.has(itemId)) return;
    loadingBomRef.current.add(itemId);
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
      bomCacheRef.current[itemId] = lines;
      setBomCache((prev) => ({ ...prev, [itemId]: lines }));
    } catch {
      bomCacheRef.current[itemId] = [];
      setBomCache((prev) => ({ ...prev, [itemId]: [] }));
    } finally {
      loadingBomRef.current.delete(itemId);
      setLoadingBom((prev) => { const s = new Set(prev); s.delete(itemId); return s; });
    }
  }, []);

  const donePlans = useMemo(
    () => allPlans.filter((p) => p.status === 'done').sort((a, b) => a.position - b.position),
    [allPlans]
  );
  const inProgressPlans = useMemo(() => allPlans.filter((p) => p.status === 'in_progress'), [allPlans]);
  const queuedFromState = useMemo(
    () => allPlans.filter((p) => p.status === 'queued').sort((a, b) => a.position - b.position),
    [allPlans]
  );

  useEffect(() => {
    if (!initializedRef.current && inProgressPlans.length > 0) {
      initializedRef.current = true;
      setExpandedPlans(new Set(inProgressPlans.map((p) => p.id)));
      inProgressPlans.forEach((p) => {
        loadBomLines(p.itemId);
        if (!loadedActionsRef.current.has(p.id)) {
          loadedActionsRef.current.add(p.id);
          dispatch(fetchActionsByPlan(p.id));
        }
      });
    }
  }, [inProgressPlans, loadBomLines, dispatch]);

  useEffect(() => {
    if (!hasUnsavedOrder) setLocalQueued(queuedFromState);
  }, [queuedFromState, hasUnsavedOrder]);

  useEffect(() => {
    if (success) {
      setNotification({ message: success, type: 'success' });
      dispatch(clearSuccess());
      setHasUnsavedOrder(false);
      fetchPlans();
    }
    if (error) {
      setNotification({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [success, error, dispatch, fetchPlans]);

  const togglePlan = useCallback((planId: string, plan?: ProductionPlan) => {
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
  }, [loadBomLines, dispatch]);

  const displayedDone = useMemo(() => {
    let result = showAllDone ? donePlans : donePlans.slice(-1);
    if (fromDate) {
      const from = new Date(fromDate);
      result = result.filter((p) => new Date(p.updatedAt) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter((p) => new Date(p.updatedAt) <= to);
    }
    return result;
  }, [donePlans, showAllDone, fromDate, toDate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalQueued((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasUnsavedOrder(true);
    }
  };

  const handleSaveOrder = () => {
    if (!machineId) return;
    const originalPositions = [...queuedFromState]
      .sort((a, b) => a.position - b.position)
      .map((p) => p.position);
    const plans = localQueued.map((plan, index) => ({
      id: plan.id,
      position: originalPositions[index] ?? index + 1,
    }));
    dispatch(reorderProductionPlans({ machineId, plans }));
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
    const derivedPieceWeightG = lines
      .filter((l) => l.unit.toLowerCase() === 'g')
      .reduce((sum, l) => sum + l.quantityPerPiece, 0);
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

  const machineName = machineInfo.current
    ? `#${machineInfo.current.number} — ${machineInfo.current.name}`
    : `Machine ${machineId}`;

  const sectionHeader = (label: string, extra?: ReactNode) => (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={1}
      py={0.5}
      mb={0.5}
      sx={{ borderBottom: `1px solid ${theme.palette.divider}`, overflow: 'visible' }}
    >
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      {extra}
    </Box>
  );

  const allVisibleForMoldCheck = [...displayedDone, ...inProgressPlans, ...localQueued];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 1, display: 'flex', flexDirection: 'column', height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="flex-start" mb={2} gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate('/production-plan')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Header title={machineName} subtitle={t('productionPlan.list.subtitle')} />
        </Box>
        <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
          <TextField
            size="small"
            placeholder={t('productionPlan.machineDetail.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 180, sm: 280 } }}
          />
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {hasUnsavedOrder && (
        <Alert
          severity="warning"
          sx={{ mb: 1.5 }}
          action={
            <Button color="warning" size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveOrder}>
              {t('productionPlan.machineDetail.saveOrder')}
            </Button>
          }
        >
          {t('productionPlan.machineDetail.unsavedOrder')}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        {/* Done section */}
        <Box mb={2}>
          {sectionHeader(
            t('productionPlan.machineDetail.lastCompleted'),
            <Box display="flex" alignItems="center" gap={1} sx={{ ml: 'auto', flexWrap: 'nowrap', pt: 1, overflow: 'visible' }}>
              <TextField
                type="date"
                size="small"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setShowAllDone(true); }}
                label={t('productionPlan.machineDetail.from')}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: fromDate ? (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setFromDate('')} sx={{ mr: -0.5 }}>
                        <ClearIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={{ width: 165, overflow: 'visible', '& .MuiInputBase-input': { fontSize: '0.75rem', py: '6px' } }}
              />
              <Typography variant="caption" color="text.disabled">—</Typography>
              <TextField
                type="date"
                size="small"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setShowAllDone(true); }}
                label={t('productionPlan.machineDetail.to')}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: toDate ? (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setToDate('')} sx={{ mr: -0.5 }}>
                        <ClearIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={{ width: 165, overflow: 'visible', '& .MuiInputBase-input': { fontSize: '0.75rem', py: '6px' } }}
              />
              <Button
                size="small"
                variant="text"
                color="secondary"
                onClick={() => setShowAllDone((v) => !v)}
                sx={{ py: 0, minHeight: 0, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
              >
                {showAllDone ? t('productionPlan.machineDetail.showLastDone') : t('productionPlan.machineDetail.showAllDone')}
              </Button>
            </Box>
          )}
          {displayedDone.length === 0 ? (
            <Typography variant="body2" color="text.secondary" px={1} py={0.5}>
              {t('productionPlan.machineDetail.noDone')}
            </Typography>
          ) : (
            displayedDone.map((plan, idx) => (
              <StaticPlanRow
                key={plan.id}
                plan={plan}
                prev={idx > 0 ? displayedDone[idx - 1] : null}
                moldChangeLabel={t('productionPlan.planner.moldChange')}
                moldChangeEstLabel={t('productionPlan.planner.moldChangeEst')}
                t={t as (key: string) => string}
                isExpanded={expandedPlans.has(plan.id)}
                onToggle={() => togglePlan(plan.id, plan)}
                expandedContent={
                  <>
                    {renderBomSection(plan)}
                    {renderScrapOverview(plan.id)}
                    {renderTimeline(plan.id)}
                  </>
                }
              />
            ))
          )}
        </Box>

        {/* In-progress section */}
        <Box mb={2}>
          {sectionHeader(t('productionPlan.machineDetail.inProgress'))}
          {inProgressPlans.length === 0 ? (
            <Typography variant="body2" color="text.secondary" px={1} py={0.5}>
              {t('productionPlan.machineDetail.noInProgress')}
            </Typography>
          ) : (
            inProgressPlans.map((plan) => {
              const prevIndex = allVisibleForMoldCheck.indexOf(plan);
              const prev = prevIndex > 0 ? allVisibleForMoldCheck[prevIndex - 1] : null;
              return (
                <StaticPlanRow
                  key={plan.id}
                  plan={plan}
                  prev={prev}
                  moldChangeLabel={t('productionPlan.planner.moldChange')}
                  moldChangeEstLabel={t('productionPlan.planner.moldChangeEst')}
                  t={t as (key: string) => string}
                  isExpanded={expandedPlans.has(plan.id)}
                  onToggle={() => togglePlan(plan.id, plan)}
                  expandedContent={
                    <>
                      {renderBomSection(plan)}
                      {renderTimeline(plan.id)}
                    </>
                  }
                />
              );
            })
          )}
        </Box>

        {/* Queued section */}
        <Box>
          {sectionHeader(
            t('productionPlan.machineDetail.upcoming'),
            hasUnsavedOrder ? null : (
              <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto', fontStyle: 'italic' }}>
                {t('productionPlan.machineDetail.dragHint')}
              </Typography>
            )
          )}
          {localQueued.length === 0 ? (
            <Typography variant="body2" color="text.secondary" px={1} py={0.5}>
              {t('productionPlan.machineDetail.noQueued')}
            </Typography>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={localQueued.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {localQueued.map((plan) => {
                  const prevIndex = allVisibleForMoldCheck.indexOf(plan);
                  const prev = prevIndex > 0 ? allVisibleForMoldCheck[prevIndex - 1] : null;
                  return (
                    <SortablePlanRow
                      key={plan.id}
                      plan={plan}
                      prev={prev}
                      moldChangeLabel={t('productionPlan.planner.moldChange')}
                      moldChangeEstLabel={t('productionPlan.planner.moldChangeEst')}
                      onDelete={() => setDeleteTarget({ id: plan.id, name: `${plan.itemCode} #${plan.position}` })}
                      t={t as (key: string) => string}
                      theme={theme}
                      isExpanded={expandedPlans.has(plan.id)}
                      onToggle={() => togglePlan(plan.id, plan)}
                      expandedContent={
                        <>
                          {renderBomSection(plan)}
                          {renderTimeline(plan.id)}
                        </>
                      }
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('productionPlan.list.deleteTitle')}
        message={t('productionPlan.list.deleteDescription', { name: deleteTarget?.name })}
        onConfirm={() => {
          if (deleteTarget) dispatch(deleteProductionPlan(deleteTarget.id));
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />

      <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification?.type} onClose={() => setNotification(null)} sx={{ width: '100%' }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MachinePlanDetail;