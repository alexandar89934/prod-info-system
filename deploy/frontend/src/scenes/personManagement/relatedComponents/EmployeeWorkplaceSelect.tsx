import {
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
  useTheme,
} from '@mui/material';
import { ChangeEvent, FC, useEffect } from 'react';
import { Controller, Control, FieldPath } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { PersonFormDataBase } from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';
import { fetchWorkplaces } from '@/state/workplace/workplace.actions.ts';
import { selectWorkplaces } from '@/state/workplace/workplace.selectors.ts';
import { Workplace } from '@/state/workplace/workplace.types.ts';

type EmployeeWorkplaceSelectProps = {
  control: Control<PersonFormDataBase>;
  name: FieldPath<PersonFormDataBase>; // npr. 'workplaces' ili 'roles'
};
const renderSelectedWorkplaces = (
  selected: number[],
  workplaceOptions: Workplace[]
): string => {
  return (selected ?? [])
    .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id))
    .map((id) => {
      const workplace = workplaceOptions.find((w) => w.id === id);
      return workplace?.name ?? `Unknown (${id})`;
    })
    .join(', ');
};

const extractSelectedNumbers = (
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (value: number[]) => void
) => {
  const rawValue = event.target.value;

  const selected = (
    Array.isArray(rawValue) ? rawValue : String(rawValue).split(',').map(Number)
  ).filter((id): id is number => typeof id === 'number' && !Number.isNaN(id));

  onChange(selected);
};

const EmployeeWorkplaceSelect: FC<EmployeeWorkplaceSelectProps> = ({
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
              renderSelectedWorkplaces(selected, workplaceOptions),
          }}
          value={field.value ?? []}
          onChange={(event) => extractSelectedNumbers(event, field.onChange)}
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
                checked={(field.value as number[])?.includes(workplace.id)}
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
