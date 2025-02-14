import { Search, Clear } from '@mui/icons-material';
import { IconButton, TextField, InputAdornment } from '@mui/material';
import {
  GridToolbarDensitySelector,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';

import FlexBetween from './FlexBetween';

interface DataGridCustomToolbarProps {
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const DataGridCustomToolbar: React.FC<DataGridCustomToolbarProps> = ({
  setSearch,
}) => {
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput); // Trigger search after delay
    }, 1000);

    return () => clearTimeout(delayDebounceFn); // Cleanup on unmount or change
  }, [searchInput, setSearch]);

  return (
    <GridToolbarContainer style={{ width: '100%', padding: 0 }}>
      <FlexBetween width="100%">
        <FlexBetween>
          <GridToolbarColumnsButton
            placeholder="Collumn selection"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
          <GridToolbarDensitySelector
            placeholder="Density selection"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
          <GridToolbarExport />
        </FlexBetween>
        <TextField
          label="Search..."
          sx={{ mb: '0.5rem', width: '15rem' }}
          onChange={(e) => setSearchInput(e.target.value)}
          value={searchInput}
          variant="standard"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {searchInput && (
                    <IconButton onClick={() => setSearchInput('')}>
                      <Clear fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => setSearch(searchInput)}
                    disabled={!searchInput}
                  >
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </FlexBetween>
    </GridToolbarContainer>
  );
};

export default DataGridCustomToolbar;
