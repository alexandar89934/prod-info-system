import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';

import ConfirmDialog from '@/reusableComponents/ConfirmDialog.tsx';
import axiosServer from '@/services/axios.service.ts';
import { deleteFileMachineEquipment, uploadSingleFile } from '@/state/fileUploads/files.actions.ts';
import { useAppDispatch } from '@/state/hooks';

export type DocumentRef = {
  name: string;
  path: string;
  dateAdded: string | Date;
};

interface MachineDocumentUploadProps {
  documents: DocumentRef[];
  onChange: (docs: DocumentRef[]) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const MachineDocumentUpload: React.FC<MachineDocumentUploadProps> = ({
  documents,
  onChange,
  isLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DocumentRef | null>(null);
  const [viewModal, setViewModal] = useState<{ url: string; fileName: string; mimeType: string } | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds 100 MB limit.');
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('uploadSingleFile', file);
    const result = await dispatch(uploadSingleFile(formData));

    if (uploadSingleFile.fulfilled.match(result)) {
      onChange([
        ...documents,
        { name: result.payload.name, path: result.payload.path, dateAdded: new Date().toISOString() },
      ]);
    } else {
      setUploadError('Upload failed.');
      setTimeout(() => setUploadError(null), 5000);
    }
    setUploading(false);
  };

  const handleDeleteClick = (doc: DocumentRef) => {
    setPendingDelete(doc);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setConfirmOpen(false);
    const result = await dispatch(deleteFileMachineEquipment({ documentPath: pendingDelete.path }));
    if (deleteFileMachineEquipment.fulfilled.match(result)) {
      onChange(documents.filter((d) => d.path !== pendingDelete.path));
    }
    setPendingDelete(null);
  };

  const handleView = async (doc: DocumentRef) => {
    setViewLoading(true);
    try {
      const filename = doc.name;
      const response = await axiosServer.get(`/file-upload/view-file/${filename}`, {
        responseType: 'blob',
      });
      const ext = filename.split('.').pop()?.toLowerCase() ?? '';
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg',
        jpeg: 'image/jpeg', gif: 'image/gif', txt: 'text/plain',
      };
      const mimeType = mimeMap[ext] || 'application/octet-stream';
      const url = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      setViewModal({ url, fileName: filename, mimeType });
    } catch {
      setUploadError('Failed to load document.');
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (doc: DocumentRef) => {
    const link = document.createElement('a');
    link.href = `/api/file-upload/view-file/${doc.name}`;
    link.download = doc.name;
    link.click();
  };

  const handleCloseView = () => {
    if (viewModal) URL.revokeObjectURL(viewModal.url);
    setViewModal(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {isMobile ? (
        <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 1, mb: 1 }}>
          {documents.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ p: 2 }}>No documents</Typography>
          ) : (
            <Stack spacing={1}>
              {documents.map((doc) => (
                <Box key={doc.path} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: '55%' }}>{doc.name}</Typography>
                  <Box>
                    <IconButton size="small" color="success" onClick={() => handleView(doc)} disabled={viewLoading}><ViewIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="secondary" onClick={() => handleDownload(doc)}><DownloadIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(doc)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        <TableContainer sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 1, mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="caption" fontWeight={600}>File</Typography></TableCell>
                <TableCell><Typography variant="caption" fontWeight={600}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow><TableCell colSpan={2} align="center">No documents</TableCell></TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.path}>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.name}>
                      {doc.name}
                    </TableCell>
                    <TableCell>
                      <Button size="small" color="success" startIcon={<ViewIcon />} onClick={() => handleView(doc)} disabled={viewLoading} sx={{ mr: 1 }}>View</Button>
                      <Button size="small" color="secondary" startIcon={<DownloadIcon />} onClick={() => handleDownload(doc)} sx={{ mr: 1 }}>Download</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(doc)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {uploadError && <Alert severity="error" sx={{ mb: 1 }}>{uploadError}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          component="label"
          size="small"
          startIcon={uploading || isLoading ? <CircularProgress size={16} /> : <AttachFileIcon />}
          disabled={uploading || isLoading}
        >
          Add Document
          <input type="file" hidden onChange={handleUpload} />
        </Button>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Delete"
        message={`Delete "${pendingDelete?.name}" permanently?`}
        onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
        onConfirm={handleConfirmDelete}
      />

      <Dialog open={!!viewModal} onClose={handleCloseView} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          <Typography variant="subtitle1" noWrap sx={{ maxWidth: 'calc(100% - 80px)' }}>{viewModal?.fileName}</Typography>
          <IconButton onClick={handleCloseView} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
          {viewModal?.mimeType.startsWith('image/') ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
              <img src={viewModal.url} alt={viewModal.fileName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </Box>
          ) : viewModal && (viewModal.mimeType === 'application/pdf' || viewModal.mimeType.startsWith('text/')) ? (
            <iframe src={viewModal.url} title={viewModal.fileName} style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
              <Typography color="text.secondary">Preview not available for this file type.</Typography>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => viewModal && handleDownload({ name: viewModal.fileName, path: '', dateAdded: '' })}>
                Download to open
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {viewLoading && (
        <Box sx={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1400 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default MachineDocumentUpload;