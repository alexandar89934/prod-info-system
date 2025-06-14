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

// @ts-ignore
interface CustomGridProps
  extends React.ComponentProps<typeof GridToolbarColumnsButton> {
  onPointerEnterCapture?: React.PointerEventHandler<any>;
  onPointerLeaveCapture?: React.PointerEventHandler<any>;
}

const CustomGridToolbarColumnsButton: React.FC<CustomGridProps> = (props) => {
  // @ts-ignore
  return <GridToolbarColumnsButton {...props} />;
};

const CustomGridToolbarDensitySelector: React.FC<CustomGridProps> = (props) => {
  // @ts-ignore
  return <GridToolbarDensitySelector {...props} />;
};

const DataGridCustomToolbar: React.FC<DataGridCustomToolbarProps> = ({
  setSearch,
}) => {
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, setSearch]);

  return (
    <GridToolbarContainer style={{ width: '100%', padding: 0 }}>
      <FlexBetween width="100%">
        <FlexBetween>
          <CustomGridToolbarColumnsButton placeholder="Columns selection" />
          <CustomGridToolbarDensitySelector placeholder="Density selection" />
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
                  {searchInput ? (
                    <IconButton onClick={() => setSearchInput('')}>
                      <Clear fontSize="small" />
                    </IconButton>
                  ) : null}
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
