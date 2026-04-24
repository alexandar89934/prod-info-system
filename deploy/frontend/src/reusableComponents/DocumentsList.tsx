import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
  useMediaQuery,
  Typography,
  Stack,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DocumentTableHead from './DocumentTableHead';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog.tsx';
import axiosServer from '@/services/axios.service.ts';
import {
  deleteFile,
  deleteFileNewPerson,
  downloadFile,
  uploadFile,
  uploadFileForNewPerson,
} from '@/state/person/person.actions.ts';
import { mimeTypes } from '@/state/person/person.types.ts';
import { selectPerson } from '@/state/person/person.selectors.ts';
import { AppDispatch } from '@/state/store.ts';

interface ViewModal {
  url: string;
  fileName: string;
  mimeType: string;
}

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<ViewModal | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const person = useSelector(selectPerson);
  const { documents } = person;

  const handleView = async (docName: string) => {
    setViewLoading(true);
    try {
      const response = await axiosServer.get(`/person/view-file/${docName}`, {
        responseType: 'blob',
      });
      const ext = docName.split('.').pop()?.toLowerCase() ?? '';
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setViewModal({ url, fileName: docName, mimeType });
    } catch {
      setUploadError('Failed to load document.');
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    if (viewModal) URL.revokeObjectURL(viewModal.url);
    setViewModal(null);
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

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleAddNewDocument = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds the 10 MB limit.');
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setUploadError(null);
    const fileUploadFormData = new FormData();
    fileUploadFormData.append('uploadFile', file);
    if (isUpdateMode) fileUploadFormData.append('personId', personId);

    const action = isUpdateMode
      ? uploadFile(fileUploadFormData)
      : uploadFileForNewPerson(fileUploadFormData);

    const result = await dispatch(action);
    if (result.meta.requestStatus === 'rejected') {
      setUploadError((result.payload as string) || 'Upload failed.');
      setTimeout(() => setUploadError(null), 5000);
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
                      disabled={viewLoading}
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
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={doc.name}
                      >
                        {doc.name}
                      </TableCell>
                      <TableCell align="left">
                        <Button
                          size="small"
                          onClick={() => handleView(doc.name)}
                          sx={{ mr: 1 }}
                          color="success"
                          startIcon={<ViewIcon />}
                          disabled={viewLoading}
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

      {uploadError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError}
        </Alert>
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

      <Dialog
        open={!!viewModal}
        onClose={handleCloseView}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ maxWidth: 'calc(100% - 100px)' }}
            title={viewModal?.fileName}
          >
            {viewModal?.fileName}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => dispatch(downloadFile(viewModal!.fileName))}
            >
              Download
            </Button>
            <IconButton onClick={handleCloseView} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
          {viewModal && viewModal.mimeType.startsWith('image/') ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111',
              }}
            >
              <img
                src={viewModal.url}
                alt={viewModal.fileName}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
          ) : viewModal &&
            (viewModal.mimeType === 'application/pdf' ||
              viewModal.mimeType.startsWith('text/')) ? (
            <iframe
              src={viewModal.url}
              title={viewModal.fileName}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
              }}
            >
              <Typography color="text.secondary">
                Preview is not available for this file type.
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => dispatch(downloadFile(viewModal!.fileName))}
              >
                Download to open
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {viewLoading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 1400,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default DocumentList;
