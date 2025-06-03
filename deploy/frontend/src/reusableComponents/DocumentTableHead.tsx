import { TableHead, TableRow, TableCell, useTheme } from '@mui/material';
import React from 'react';

const DocumentTableHead: React.FC = () => {
  const theme = useTheme();

  return (
    <TableHead
      sx={{
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.background.default,
        zIndex: 2,
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <TableRow>
        <TableCell>Document Name</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default DocumentTableHead;
