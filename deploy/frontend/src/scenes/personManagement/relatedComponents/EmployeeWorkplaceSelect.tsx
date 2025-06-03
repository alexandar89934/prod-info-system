import {
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
  useTheme,
} from '@mui/material';
import React, { useEffect } from 'react';
import { Controller, Control } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@/state/store.ts';
import { fetchWorkplaces } from '@/state/workplace/workplace.actions.ts';
import { selectWorkplaces } from '@/state/workplace/workplace.selectors.ts';
import { Workplace } from '@/state/workplace/workplace.types.ts';

interface EmployeeWorkplaceSelectProps {
  control: Control<any>;
  name: string;
}

const EmployeeWorkplaceSelect: React.FC<EmployeeWorkplaceSelectProps> = ({
  control,
  name,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(
      fetchWorkplaces({
        limit: 9999,
        page: 1,
        search: '',
        sortField: '',
        sortOrder: '',
      })
    );
  }, [dispatch]);

  const workplaceOptions: Workplace[] = useSelector(selectWorkplaces);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          id={name}
          variant="outlined"
          fullWidth
          select
          error={!!error}
          helperText={error?.message}
          SelectProps={{
            multiple: true,
            renderValue: (selected: number[]) =>
              (selected ?? [])
                .filter(
                  (id): id is number =>
                    typeof id === 'number' && !Number.isNaN(id)
                )
                .map((id) => {
                  const workplace = workplaceOptions.find((w) => w.id === id);
                  return workplace?.name ?? `Unknown (${id})`;
                })
                .join(', '),
          }}
          value={field.value ?? []}
          onChange={(event) => {
            const selected = (
              Array.isArray(event.target.value)
                ? event.target.value
                : event.target.value.split(',').map(Number)
            ).filter(
              (id): id is number => typeof id === 'number' && !Number.isNaN(id)
            );
            field.onChange(selected);
          }}
        >
          {workplaceOptions.map((workplace: Workplace) => (
            <MenuItem key={workplace.id} value={workplace.id}>
              <Checkbox
                sx={{
                  color: 'rgba(0, 0, 0, 0.54)',
                  '&.Mui-checked': {
                    color: theme.palette.primary.dark,
                  },
                }}
                checked={(field.value ?? []).includes(workplace.id)}
              />
              <ListItemText
                primary={workplace.name}
                secondary={workplace.categoryName}
              />
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};

export default EmployeeWorkplaceSelect;
