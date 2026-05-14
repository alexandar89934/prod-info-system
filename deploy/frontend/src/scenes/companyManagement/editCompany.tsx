import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { LabeledXtField } from '@/reusableComponents/LabeledТеxtField';
import { useAppDispatch } from '@/state/hooks';
import { fetchCompanyById, updateCompany, uploadCompanyLogo } from '@/state/company/company.actions';
import { selectCompanyError, selectCompanyLoading, selectCurrentCompany } from '@/state/company/company.selectors';
import { CompanyFormData, companySchema } from '@/zodValidationSchemas/company.schema';

const EditCompany = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const current = useSelector(selectCurrentCompany);
  const loading = useSelector(selectCompanyLoading);
  const error = useSelector(selectCompanyError);

  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '', pib: '', mb: '', address: '',
      phones: [], emails: [],
      ownerInfo: '', representative: '',
      isOwnCompany: false, isCustomer: false, isSupplier: false,
      notes: '',
    },
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({ control, name: 'phones' as never });
  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({ control, name: 'emails' });

  useEffect(() => {
    if (id) dispatch(fetchCompanyById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current) {
      reset({
        name: current.name,
        pib: current.pib,
        mb: current.mb,
        address: current.address ?? '',
        phones: current.phones ?? [],
        emails: current.emails ?? [],
        ownerInfo: current.ownerInfo ?? '',
        representative: current.representative ?? '',
        isOwnCompany: current.isOwnCompany,
        isCustomer: current.isCustomer,
        isSupplier: current.isSupplier,
        notes: current.notes ?? '',
      });
      setLogoPath(current.logo ?? null);
    }
  }, [current, reset]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const result = await dispatch(uploadCompanyLogo(file));
    setLogoUploading(false);
    if (uploadCompanyLogo.fulfilled.match(result)) setLogoPath(result.payload);
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!id) return;
    const result = await dispatch(updateCompany({
      id,
      name: data.name,
      pib: data.pib,
      mb: data.mb,
      address: data.address ?? null,
      phones: data.phones,
      emails: data.emails.map((e) => ({ address: e.address as string, isPrimary: e.isPrimary as boolean })),
      ownerInfo: data.ownerInfo ?? null,
      representative: data.representative ?? null,
      isOwnCompany: data.isOwnCompany,
      isCustomer: data.isCustomer,
      isSupplier: data.isSupplier,
      notes: data.notes ?? null,
      logo: logoPath,
    }));
    if (updateCompany.fulfilled.match(result)) navigate('/company');
  };

  const sectionLabel = (text: string) => (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 0.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
      {text}
    </Typography>
  );

  const cancelSx = {
    color: theme.palette.primary[100],
    borderColor: theme.palette.primary[100],
    '&:hover': { borderColor: theme.palette.primary[200], backgroundColor: theme.palette.primary[100], color: theme.palette.common.white },
  };

  const arrayLabelSx = {
    minWidth: '220px',
    position: 'relative' as const,
    transform: 'none',
    marginBottom: { xs: 1, sm: 0 },
    whiteSpace: 'normal' as const,
    overflow: 'visible' as const,
    lineHeight: 1.4,
    paddingTop: { sm: '14px' },
  };

  if (loading && !current) {
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
        sx={{
          backgroundColor: theme.palette.background.default,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" align="center" mb={1}>{t('company.form.editTitle')}</Typography>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            display: 'flex',
            flexDirection: 'column',
            pb: 2,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: 4 },
            '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
          }}
        >
          {/* Logo */}
          {sectionLabel(t('company.form.uploadLogo'))}
          <FormControl fullWidth margin="normal" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: { xs: 1, sm: 2 } }}>
            <InputLabel sx={arrayLabelSx}>{t('company.form.uploadLogo')}:</InputLabel>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: 2, border: '1px solid',
                  borderColor: 'divider', overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: theme.palette.background.default,
                }}
              >
                {logoPath ? (
                  <Box
                    component="img"
                    src={`${import.meta.env.VITE_API_URL ?? ''}${logoPath}`}
                    alt="logo"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <BusinessIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
                )}
              </Box>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              <Button variant="outlined" size="small" startIcon={logoUploading ? <CircularProgress size={14} /> : <PhotoCameraIcon />} disabled={logoUploading} onClick={() => logoInputRef.current?.click()} sx={cancelSx}>
                {t('company.form.uploadLogo')}
              </Button>
              {logoPath && (
                <Button size="small" color="error" onClick={() => setLogoPath(null)}>
                  {t('company.form.removeLogo')}
                </Button>
              )}
            </Box>
          </FormControl>

          {/* Legal */}
          {sectionLabel(t('company.form.legalSection'))}
          <Controller name="name" control={control} render={({ field }) => (
            <LabeledXtField id="name" label={t('company.form.name')} value={field.value ?? ''} onChange={field.onChange} error={errors.name} />
          )} />
          <Controller name="pib" control={control} render={({ field }) => (
            <LabeledXtField id="pib" label={t('company.form.pib')} value={field.value ?? ''} onChange={field.onChange} error={errors.pib} />
          )} />
          <Controller name="mb" control={control} render={({ field }) => (
            <LabeledXtField id="mb" label={t('company.form.mb')} value={field.value ?? ''} onChange={field.onChange} error={errors.mb} />
          )} />
          <Controller name="address" control={control} render={({ field }) => (
            <LabeledXtField id="address" label={t('company.form.address')} value={field.value ?? ''} onChange={field.onChange} />
          )} />
          <Controller name="ownerInfo" control={control} render={({ field }) => (
            <LabeledXtField id="ownerInfo" label={t('company.form.ownerInfo')} value={field.value ?? ''} onChange={field.onChange} />
          )} />
          <Controller name="representative" control={control} render={({ field }) => (
            <LabeledXtField id="representative" label={t('company.form.representative')} value={field.value ?? ''} onChange={field.onChange} />
          )} />

          {/* Contact */}
          {sectionLabel(t('company.form.contactSection'))}

          <FormControl fullWidth margin="normal" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: { xs: 1, sm: 2 } }}>
            <InputLabel sx={arrayLabelSx}>{t('company.form.phones')}:</InputLabel>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {phoneFields.map((field, index) => (
                <Box key={field.id} display="flex" alignItems="center" gap={1}>
                  <TextField size="small" fullWidth {...register(`phones.${index}` as const)} placeholder="+381..." />
                  <IconButton size="small" color="error" onClick={() => removePhone(index)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => appendPhone('' as never)} sx={{ alignSelf: 'flex-start', ...cancelSx }}>
                {t('company.form.addPhone')}
              </Button>
            </Box>
          </FormControl>

          <FormControl fullWidth margin="normal" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: { xs: 1, sm: 2 } }}>
            <InputLabel sx={arrayLabelSx}>{t('company.form.emails')}:</InputLabel>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {emailFields.map((field, index) => (
                <Box key={field.id} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <TextField
                    size="small" sx={{ flex: 1, minWidth: 200 }}
                    {...register(`emails.${index}.address`)}
                    placeholder="email@example.com"
                    error={!!errors.emails?.[index]?.address}
                    helperText={errors.emails?.[index]?.address?.message}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={watch(`emails.${index}.isPrimary`) ?? false}
                        onChange={(e) => {
                          if (e.target.checked) emailFields.forEach((_, i) => { if (i !== index) setValue(`emails.${i}.isPrimary`, false); });
                          setValue(`emails.${index}.isPrimary`, e.target.checked);
                        }}
                      />
                    }
                    label={<Typography variant="caption">{t('company.form.primaryEmail')}</Typography>}
                  />
                  <IconButton size="small" color="error" onClick={() => removeEmail(index)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => appendEmail({ address: '', isPrimary: emailFields.length === 0 })} sx={{ alignSelf: 'flex-start', ...cancelSx }}>
                {t('company.form.addEmail')}
              </Button>
            </Box>
          </FormControl>

          {/* Company type */}
          {sectionLabel(t('company.form.rolesSection'))}
          <Controller name="isOwnCompany" control={control} render={({ field }) => (
            <FormControlLabel control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label={t('company.form.isOwnCompany')} />
          )} />
          <Controller name="isCustomer" control={control} render={({ field }) => (
            <FormControlLabel control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label={t('company.form.isCustomer')} />
          )} />
          <Controller name="isSupplier" control={control} render={({ field }) => (
            <FormControlLabel control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />} label={t('company.form.isSupplier')} />
          )} />

          {/* Notes */}
          {sectionLabel(t('company.form.notes'))}
          <Controller name="notes" control={control} render={({ field }) => (
            <LabeledXtField id="notes" label={t('company.form.notes')} value={field.value ?? ''} onChange={field.onChange} multiline rows={3} />
          )} />
        </Box>

        <Box sx={{ flexShrink: 0, pt: 2, pb: 2, px: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
              {loading ? `${t('company.form.editSubmit')}...` : t('company.form.editSubmit')}
            </Button>
            <Button variant="outlined" disabled={loading} onClick={() => navigate('/company')} sx={cancelSx}>
              {t('company.form.cancel')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditCompany;