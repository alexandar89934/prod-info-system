import { Visibility, Download, Delete } from '@mui/icons-material';
import { TableRow, TableCell, IconButton } from '@mui/material';
import React from 'react';

import { DocumentData } from '@/state/person/person.types';

interface DocumentTableRowProps {
  document: DocumentData;
  onView: (docName: string) => void;
  onDownload: (docName: string) => void;
  onDelete: (document: DocumentData) => void;
}

const DocumentTableRow: React.FC<DocumentTableRowProps> = ({
  document,
  onView,
  onDownload,
  onDelete,
}) => {
  return (
    <TableRow key={document.name}>
      <TableCell>{document.name}</TableCell>
      <TableCell sx={{ width: '30%' }}>
        <IconButton onClick={() => onView(document.name)} color="primary">
          <Visibility />
        </IconButton>
        <IconButton onClick={() => onDownload(document.name)} color="secondary">
          <Download />
        </IconButton>
        <IconButton onClick={() => onDelete(document)} color="error">
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default DocumentTableRow;
