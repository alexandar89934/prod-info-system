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
import { fetchJobPositions } from '@/state/jobPosition/jobPosition.actions.ts';
import { selectJobPositions } from '@/state/jobPosition/jobPosition.selectors.ts';
import { JobPosition } from '@/state/jobPosition/jobPosition.types.ts';

type EmployeeJobPositionSelectProps = {
  control: Control<PersonFormDataBase>;
  name: FieldPath<PersonFormDataBase>;
};
const renderSelectedJobPositions = (
  selected: number[],
  jobPositionOptions: JobPosition[]
): string => {
  return (selected ?? [])
    .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id))
    .map((id) => {
      const jobPosition = jobPositionOptions.find((w) => w.id === id);
      return jobPosition?.name ?? `Unknown (${id})`;
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

const EmployeeJobPositionSelect: FC<EmployeeJobPositionSelectProps> = ({
  control,
  name,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(
      fetchJobPositions({
        limit: 9999,
        page: 1,
        search: '',
        sortField: '',
        sortOrder: '',
      })
    );
  }, [dispatch]);

  const jobPositionOptions: JobPosition[] = useSelector(selectJobPositions);

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
              renderSelectedJobPositions(selected, jobPositionOptions),
          }}
          value={field.value ?? []}
          onChange={(event) => extractSelectedNumbers(event, field.onChange)}
        >
          {jobPositionOptions.map((jobPosition: JobPosition) => (
            <MenuItem key={jobPosition.id} value={jobPosition.id}>
              <Checkbox
                sx={{
                  color: 'rgba(0, 0, 0, 0.54)',
                  '&.Mui-checked': {
                    color: theme.palette.primary.dark,
                  },
                }}
                checked={(field.value as number[])?.includes(jobPosition.id)}
              />
              <ListItemText
                primary={jobPosition.name}
                secondary={jobPosition.categoryName}
              />
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};

export default EmployeeJobPositionSelect;