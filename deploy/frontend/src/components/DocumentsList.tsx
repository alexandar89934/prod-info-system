import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DocumentTableHead from './DocumentTableHead';
import DocumentTableRow from './DocumentTableRow';

import ConfirmDialog from '@/components/ConfirmDialog.tsx';
import {
  deleteFile,
  deleteFileNewPerson,
  downloadFile,
  uploadFile,
  uploadFileForNewPerson,
  viewFile,
} from '@/state/person/person.actions.ts';
import { selectPerson } from '@/state/person/person.selectors.ts';
import { AppDispatch } from '@/state/store.ts';

interface DocumentListProps {
  personId?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ personId }) => {
  const isUpdateMode = Boolean(personId);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const person = useSelector(selectPerson);
  const { documents } = person;

  const handleView = (docName) => {
    dispatch(viewFile(docName));
  };

  const handleDownload = (docName) => {
    dispatch(downloadFile(docName));
  };

  const handleDelete = (document) => {
    setSelectedDocument(document);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDocument(null);
  };

  const handleConfirmDelete = async () => {
    if (!isUpdateMode) {
      await dispatch(
        deleteFileNewPerson({ documentPath: selectedDocument.path })
      );
      handleClose();
      return;
    }
    await dispatch(
      deleteFile({ personId, documentName: selectedDocument.name })
    );
    handleClose();
  };

  const handleAddNewDocument = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const fileUploadFormData = new FormData();
      fileUploadFormData.append('uploadFile', file);
      if (isUpdateMode) fileUploadFormData.append('personId', personId);

      if (isUpdateMode) {
        await dispatch(uploadFile(fileUploadFormData));
      }
      if (!isUpdateMode) {
        await dispatch(uploadFileForNewPerson(fileUploadFormData));
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <TableContainer
        sx={{
          flexGrow: 1,
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: 1,
          position: 'relative',
        }}
      >
        <Table>
          <DocumentTableHead />
        </Table>
        <Box
          sx={{
            maxHeight: '25vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <Table>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <DocumentTableRow
                    key={doc.name}
                    document={doc}
                    onView={handleView}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 2,
        }}
      >
        <Button
          variant="contained"
          component="label"
          color="primary"
          sx={{
            marginRight: 1,
          }}
        >
          Add New Document
          <input type="file" hidden onChange={handleAddNewDocument} />
        </Button>
      </Box>
      <ConfirmDialog
        open={open}
        title="Confirm Delete"
        message={`Are you sure you want to permanently delete ${selectedDocument?.name}?`}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default DocumentList;
