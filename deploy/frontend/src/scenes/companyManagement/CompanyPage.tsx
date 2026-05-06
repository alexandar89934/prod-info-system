import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/reusableComponents/Header';
import { useAppDispatch } from '@/state/hooks';
import { fetchCompanyById } from '@/state/company/company.actions';
import { selectCompanyLoading, selectCurrentCompany } from '@/state/company/company.selectors';
import { fetchMoldsByCompany } from '@/state/mold/mold.actions';
import { selectMoldsByCompany } from '@/state/mold/mold.selectors';

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <Box display="flex" gap={1} alignItems="flex-start">
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 500 }}>{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
};

const CompanyPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const company = useSelector(selectCurrentCompany);
  const loading = useSelector(selectCompanyLoading);
  const ownedMolds = useSelector(selectMoldsByCompany);

  useEffect(() => {
    if (id) {
      dispatch(fetchCompanyById(id));
      dispatch(fetchMoldsByCompany(id));
    }
  }, [dispatch, id]);

  if (loading && !company) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  }

  if (!company) return null;

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, sm: 2 }, pb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={2}>
          {company.logo && (
            <Box
              component="img"
              src={`${import.meta.env.VITE_API_URL ?? ''}${company.logo}`}
              alt={company.name}
              sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'contain', border: '1px solid', borderColor: 'divider' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <Header title={company.name} subtitle="" />
        </Box>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/editCompany/${company.id}`)}>
          {t('company.form.editTitle')}
        </Button>
      </Box>

      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        {company.isOwnCompany && <Chip icon={<BusinessIcon />} label={t('company.badge.own')} color="primary" />}
        {company.isCustomer && <Chip label={t('company.badge.customer')} color="success" />}
        {company.isSupplier && <Chip label={t('company.badge.supplier')} color="warning" />}
      </Box>

      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
            {t('company.form.legalSection')}
          </Typography>
          <Stack spacing={1}>
            <InfoRow label={t('company.form.pib')} value={company.pib} />
            <InfoRow label={t('company.form.mb')} value={company.mb} />
            <InfoRow label={t('company.form.address')} value={company.address} />
            <InfoRow label={t('company.form.ownerInfo')} value={company.ownerInfo} />
            <InfoRow label={t('company.form.representative')} value={company.representative} />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
            {t('company.form.contactSection')}
          </Typography>
          <Stack spacing={1.5}>
            {company.phones.length > 0 && (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{t('company.form.phones')}</Typography>
                </Box>
                {company.phones.map((phone, i) => (
                  <Typography key={i} variant="body2" sx={{ ml: 3 }}>{phone}</Typography>
                ))}
              </Box>
            )}
            {company.phones.length > 0 && company.emails.length > 0 && <Divider />}
            {company.emails.length > 0 && (
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                  <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{t('company.form.emails')}</Typography>
                </Box>
                {company.emails.map((email, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1} sx={{ ml: 3 }}>
                    <Typography variant="body2">{email.address}</Typography>
                    {email.isPrimary && <StarIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </Paper>

        {company.notes && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={0.5} mb={1}>
              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                {t('company.form.notes')}
              </Typography>
            </Box>
            <Typography variant="body2">{company.notes}</Typography>
          </Paper>
        )}

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
            {t('company.detail.ownedMolds')}
          </Typography>
          {ownedMolds.length === 0 ? (
            <Typography variant="body2" color="text.disabled">{t('company.detail.ownedMoldsEmpty')}</Typography>
          ) : (
            <Stack spacing={1}>
              {ownedMolds.map((mold, index) => (
                <Box key={mold.id}>
                  {index > 0 && <Divider sx={{ mb: 1 }} />}
                  <Box
                    display="flex" alignItems="center" gap={1.5} flexWrap="wrap"
                    sx={{ cursor: 'pointer', borderRadius: 1, px: 1, py: 0.5, '&:hover': { backgroundColor: 'action.hover' } }}
                    onClick={() => navigate(`/mold/${mold.id}`)}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', minWidth: 40 }}>
                      #{mold.inventoryNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>{mold.name}</Typography>
                    <Chip
                      size="small"
                      label={t(`mold.status.${mold.status}`)}
                      color={mold.status === 'ok' ? 'success' : mold.status === 'fault' ? 'error' : 'warning'}
                    />
                    {mold.currentMachineName && (
                      <Typography variant="caption" color="text.secondary">
                        {mold.currentMachineName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default CompanyPage;