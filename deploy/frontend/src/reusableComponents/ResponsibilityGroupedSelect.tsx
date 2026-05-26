import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Responsibility } from '@/state/responsibility/responsibility.types';

type Group = { label: string; codes: string[] };

const GROUPS: Group[] = [
  {
    label: 'Kalup',
    codes: ['pokretanje_izmene_kalupa', 'zavrsetak_izmene_kalupa'],
  },
  {
    label: 'Podešavanje mašine',
    codes: ['pokretanje_podesavanja_masine', 'zavrsetak_podesavanja_masine'],
  },
  {
    label: 'Plan produkcije',
    codes: [
      'pokretanje_plana',
      'pokretanje_promene_plana',
      'zaustavljanje_plana',
      'nastavak_plana',
      'zavrsetak_plana',
    ],
  },
  {
    label: 'Operater',
    codes: ['pocetak_rada_operatera', 'zavrsetak_rada_operatera'],
  },
  {
    label: 'Produkcija',
    codes: [
      'zavrsetak_ciklusa',
      'unos_skarta_produkcija',
      'povecanje_kolicine',
      'potvrda_pune_kaveze',
    ],
  },
  {
    label: 'Kontrola kvaliteta',
    codes: ['odobrenje_prvog_komada_kk', 'kontrola_kk_u_produkciji'],
  },
  {
    label: 'Servis i popravka',
    codes: [
      'pokretanje_servisa_masine',
      'zavrsetak_servisa_masine',
      'pokretanje_popravke_masine',
      'zavrsetak_popravke_masine',
      'prijava_kvara_masine',
    ],
  },
];

const allGroupedCodes = new Set(GROUPS.flatMap((g) => g.codes));

type Props = {
  value: string[];
  onChange: (codes: string[]) => void;
  allResponsibilities: Responsibility[];
  label: string;
  error?: string;
};

const ResponsibilityGroupedSelect = ({ value, onChange, allResponsibilities, label, error }: Props) => {
  const { t } = useTranslation();

  const byCode = Object.fromEntries(allResponsibilities.map((r) => [r.code, r]));

  const ungrouped = allResponsibilities.filter((r) => !allGroupedCodes.has(r.code));

  const renderGroup = (group: Group) => {
    const items = group.codes
      .map((code) => byCode[code])
      .filter(Boolean);
    if (items.length === 0) return null;
    return [
      <ListSubheader key={`header-${group.label}`} sx={{ fontWeight: 700, fontSize: '0.7rem', lineHeight: '28px', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {group.label}
      </ListSubheader>,
      ...items.map((r) => {
        const isChecked = value.includes(r.code);
        return (
          <MenuItem key={r.code} value={r.code} sx={{ pl: 2, ...(isChecked && { backgroundColor: 'action.selected' }) }}>
            <Checkbox size="small" checked={isChecked} color="secondary" />
            <ListItemText
              primary={r.label}
              secondary={r.code}
              primaryTypographyProps={{ fontWeight: isChecked ? 700 : 400 }}
              secondaryTypographyProps={{ sx: { fontSize: '0.65rem' } }}
            />
          </MenuItem>
        );
      }),
    ];
  };

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel id="responsibilities-label">{label}</InputLabel>
      <Select
        labelId="responsibilities-label"
        id="responsibilities"
        multiple
        value={value}
        label={label}
        onChange={(e: SelectChangeEvent<string[]>) => onChange(e.target.value as string[])}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((code) => (
              <Chip
                key={code}
                label={byCode[code]?.label ?? code}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        )}
        MenuProps={{ PaperProps: { sx: { maxHeight: 420 } } }}
      >
        {GROUPS.map((group) => renderGroup(group))}
        {ungrouped.length > 0 && [
          <ListSubheader key="header-other" sx={{ fontWeight: 700, fontSize: '0.7rem', lineHeight: '28px', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {t('jobPosition.form.otherResponsibilities')}
          </ListSubheader>,
          ...ungrouped.map((r) => {
            const isChecked = value.includes(r.code);
            return (
              <MenuItem key={r.code} value={r.code} sx={{ pl: 2, ...(isChecked && { backgroundColor: 'action.selected' }) }}>
                <Checkbox size="small" checked={isChecked} color="secondary" />
                <ListItemText
                  primary={r.label}
                  secondary={r.code}
                  primaryTypographyProps={{ fontWeight: isChecked ? 700 : 400 }}
                  secondaryTypographyProps={{ sx: { fontSize: '0.65rem' } }}
                />
              </MenuItem>
            );
          }),
        ]}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default ResponsibilityGroupedSelect;