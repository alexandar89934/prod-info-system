import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/state/hooks';
import {
  createMaintenanceAssignments,
  fetchAvailableTargets,
} from '@/state/maintenanceAssignment/maintenanceAssignment.actions';
import {
  selectAvailableTargets,
  selectMaintenanceAssignmentError,
  selectMaintenanceAssignmentLoading,
  selectTargetsLoading,
} from '@/state/maintenanceAssignment/maintenanceAssignment.selectors';
import { clearAvailableTargets, clearError, resetState } from '@/state/maintenanceAssignment/maintenanceAssignment.slice';
import { TargetType } from '@/state/maintenanceAssignment/maintenanceAssignment.types';
import { fetchMaintenanceTemplates } from '@/state/maintenanceTemplate/maintenanceTemplate.actions';
import { selectMaintenanceTemplates } from '@/state/maintenanceTemplate/maintenanceTemplate.selectors';

const AddMaintenanceAssignment = () => {
  const { t }    = useTranslation();
  const theme    = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const templates       = useSelector(selectMaintenanceTemplates);
  const availableTargets = useSelector(selectAvailableTargets);
  const loading         = useSelector(selectMaintenanceAssignmentLoading);
  const targetsLoading  = useSelector(selectTargetsLoading);
  const error           = useSelector(selectMaintenanceAssignmentError);

  const [templateId, setTemplateId]       = useState('');
  const [targetType, setTargetType]       = useState<TargetType | ''>('');
  const [selectedIds, setSelectedIds]     = useState<string[]>([]);
  const [templateError, setTemplateError] = useState('');

  useEffect(() => {
    dispatch(fetchMaintenanceTemplates({ page: 1, limit: 200, search: '' }));
    return () => { dispatch(resetState()); };
  }, [dispatch]);

  useEffect(() => {
    if (templateId && targetType) {
      setSelectedIds([]);
      dispatch(fetchAvailableTargets({ targetType, templateId }));
    } else {
      dispatch(clearAvailableTargets());
    }
  }, [dispatch, templateId, targetType]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const handleTemplateChange = (e: SelectChangeEvent) => {
    const id = e.target.value;
    setTemplateId(id);
    setTemplateError('');
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setTargetType(tmpl.targetType as TargetType);
    } else {
      setTargetType('');
    }
    setSelectedIds([]);
  };

  const toggleTarget = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!templateId) { setTemplateError(t('common.required')); return; }
    if (!targetType || selectedIds.length === 0) return;
    const result = await dispatch(createMaintenanceAssignments({ templateId, targetType, targetIds: selectedIds }));
    if (createMaintenanceAssignments.fulfilled.match(result)) navigate('/maintenance-assignment');
  };

  const cancelSx = {
    color: theme.palette.primary[100],
    borderColor: theme.palette.primary[100],
    '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" sx={{ p: 3 }}>
      <Box
        width="100%"
        maxWidth="700px"
        p={3}
        border="1px solid"
        borderColor="grey.300"
        borderRadius={2}
        boxShadow={1}
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <Typography variant="h4" align="center" mb={3}>{t('maintenanceAssignment.add')}</Typography>

        <FormControl fullWidth size="small" error={!!templateError} sx={{ mb: 2 }}>
          <InputLabel>{t('maintenanceAssignment.selectTemplate')}</InputLabel>
          <Select
            label={t('maintenanceAssignment.selectTemplate')}
            value={templateId}
            onChange={handleTemplateChange}
          >
            {templates.map((tmpl) => (
              <MenuItem key={tmpl.id} value={tmpl.id}>
                {tmpl.name} — {t(`maintenanceAssignment.targetTypes.${tmpl.targetType}`)}
              </MenuItem>
            ))}
          </Select>
          {templateError && <FormHelperText>{templateError}</FormHelperText>}
        </FormControl>

        {selectedTemplate && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('maintenanceAssignment.targetType')}: <strong>{t(`maintenanceAssignment.targetTypes.${selectedTemplate.targetType}`)}</strong>
          </Typography>
        )}

        {targetType && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t('maintenanceAssignment.selectTargets')}
            </Typography>

            {targetsLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
              </Box>
            ) : availableTargets.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                {t('maintenanceAssignment.noTargetsAvailable')}
              </Typography>
            ) : (
              <Box
                border="1px solid"
                borderColor="divider"
                borderRadius={1}
                sx={{ maxHeight: 320, overflowY: 'auto' }}
              >
                <List dense disablePadding>
                  {availableTargets.map((target) => (
                    <ListItem key={target.id} disablePadding>
                      <ListItemButton onClick={() => toggleTarget(target.id)} dense>
                        <Checkbox
                          edge="start"
                          checked={selectedIds.includes(target.id)}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                        />
                        <ListItemText primary={target.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {availableTargets.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {selectedIds.length} / {availableTargets.length} selected
              </Typography>
            )}
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box display="flex" gap={2} mt={3}>
          <Button
            variant="contained"
            disabled={loading || selectedIds.length === 0}
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {loading ? `${t('maintenanceAssignment.add')}...` : t('maintenanceAssignment.add')}
          </Button>
          <Button variant="outlined" disabled={loading} onClick={() => navigate('/maintenance-assignment')} sx={cancelSx}>
            {t('common.cancel')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddMaintenanceAssignment;