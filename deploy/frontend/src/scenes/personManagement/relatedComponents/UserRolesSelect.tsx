import {
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
  useTheme,
} from '@mui/material';
import React, { useEffect } from 'react';
import { Controller, Control, useController } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { fetchRoles } from '@/state/role/role.actions.ts';
import { selectRoles } from '@/state/role/role.selectors.ts';
import { AppDispatch } from '@/state/store.ts';

interface UserRolesSelectProps {
  control: Control<any>;
  name: string;
}
const UserRolesSelect: React.FC<UserRolesSelectProps> = ({ control, name }) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);
  const rolesOptions = useSelector(selectRoles);
  const {
    field: { value: selectedValues, onChange },
  } = useController({ name, control });

  useEffect(() => {
    if (rolesOptions.length === 0) return;

    const userRole = rolesOptions.find((role) => role?.name === 'User');
    const userRoleId = userRole?.id;

    if (
      userRoleId &&
      (!selectedValues || !selectedValues.includes(userRoleId))
    ) {
      onChange([...(selectedValues || []), userRoleId]);
    }
  }, [selectedValues, onChange, rolesOptions]);
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (selectedRoles: number[]) =>
          selectedRoles.includes(
            rolesOptions.find((role) => role?.name === 'User')?.id || -1
          )
            ? true
            : 'The "user" role is mandatory.',
      }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          id={name}
          variant="outlined"
          fullWidth
          select
          error={!!error}
          helperText={error ? error.message : ''}
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              (selected as number[])
                .map(
                  (id) =>
                    rolesOptions.find((r) => r.id === id)?.name || id.toString()
                )
                .join(', '),
            MenuProps: {
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              disablePortal: true,
            },
          }}
          value={field.value ?? []}
          onChange={(event) => {
            const selectedRoles = Array.isArray(event.target.value)
              ? event.target.value
              : event.target.value.split(',').map(Number);
            const userRole = rolesOptions.find((role) => role?.name === 'User');
            const userRoleId = userRole?.id;
            if (userRoleId && !selectedRoles.includes(userRoleId)) {
              selectedRoles.push(userRoleId);
            }
            field.onChange(selectedRoles);
          }}
        >
          {rolesOptions.map((role) => (
            <MenuItem
              key={role.id}
              value={role.id}
              disabled={role.name === 'User'}
            >
              <Checkbox
                sx={{
                  color: 'rgba(0, 0, 0, 0.54)',
                  '&.Mui-checked': {
                    color: theme.palette.primary.dark,
                  },
                }}
                checked={(field.value as number[]).includes(role.id)}
              />
              <ListItemText primary={role.name} />
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};

export default UserRolesSelect;
