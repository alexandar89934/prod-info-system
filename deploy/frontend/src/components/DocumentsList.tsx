import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
  useMediaQuery,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DocumentTableHead from './DocumentTableHead';

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
  isEdit?: boolean;
  fullWidth?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  personId,
  isEdit,
  fullWidth,
}) => {
  const isUpdateMode = isEdit;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {isMobile ? (
        // Mobile layout - list view
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: 1,
            mb: 2,
          }}
        >
          {documents.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ p: 2 }}>
              No documents available
            </Typography>
          ) : (
            <Stack spacing={1}>
              {documents.map((doc) => (
                <Box
                  key={doc.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderBottom: '1px solid #eee',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '60%',
                    }}
                  >
                    {doc.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleView(doc.name)}
                      color="success"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(doc.name)}
                      color="secondary"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(doc)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        // Desktop layout - table view
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
                    <TableRow key={doc.name}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell align="left">
                        <Button
                          size="small"
                          onClick={() => handleView(doc.name)}
                          sx={{ mr: 1 }}
                          color="success"
                          startIcon={<ViewIcon />}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDownload(doc.name)}
                          sx={{ mr: 1 }}
                          color="secondary"
                          startIcon={<DownloadIcon />}
                        >
                          Download
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDelete(doc)}
                          sx={{ mr: 1 }}
                          color="error"
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </TableContainer>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-end',
          marginTop: 2,
        }}
      >
        <Button
          variant="contained"
          component="label"
          color="primary"
          size={isMobile ? 'medium' : 'small'}
          startIcon={<AttachFileIcon />}
          sx={{
            width: isMobile ? '100%' : 'auto',
            py: isMobile ? 1.5 : 1,
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
