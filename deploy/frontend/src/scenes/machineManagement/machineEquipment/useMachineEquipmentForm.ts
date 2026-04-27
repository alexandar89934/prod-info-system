import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { GalleryImage } from '@/reusableComponents/ImageGallery.tsx';
import { DocumentRef } from '@/reusableComponents/MachineDocumentUpload.tsx';
import {
  uploadSingleFile,
  deleteFileMachineEquipment,
} from '@/state/fileUploads/files.actions.ts';
import {
  selectLoading as selectFileLoading,
  selectError as selectFileError,
} from '@/state/fileUploads/files.selectors.ts';
import { useAppDispatch } from '@/state/hooks';
import {
  selectMachineEquipmentLoading,
  selectMachineEquipmentError,
  selectMachineEquipmentSuccess,
} from '@/state/machineEquipment/machineEquipment.selectors.ts';
import {
  clearError,
  clearSuccess,
} from '@/state/machineEquipment/machineEquipment.slice.ts';
import { fetchMachineEquipmentTypes } from '@/state/machineEquipmentTypes/machineEquipmentTypes.actions.ts';
import { selectMachineEquipmentTypes } from '@/state/machineEquipmentTypes/machineEquipmentTypes.selectors.ts';

export const useMachineEquipmentForm = () => {
  const dispatch = useAppDispatch();

  const types = useSelector(selectMachineEquipmentTypes);
  const loading = useSelector(selectMachineEquipmentLoading);
  const error = useSelector(selectMachineEquipmentError);
  const success = useSelector(selectMachineEquipmentSuccess);
  const fileLoading = useSelector(selectFileLoading);
  const fileError = useSelector(selectFileError);

  const [pictures, setPictures] = useState<GalleryImage[]>([]);
  const [documents, setDocuments] = useState<DocumentRef[]>([]);

  useEffect(() => {
    dispatch(
      fetchMachineEquipmentTypes({
        page: 1,
        limit: 100,
        search: '',
        sortField: '',
        sortOrder: '',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!error && !success) return;
    const timer = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success, dispatch]);

  const picturesToSubmit = pictures.map((p) => ({
    name: p.name,
    path: p.path,
    dateAdded:
      p.dateAdded instanceof Date ? p.dateAdded : new Date(p.dateAdded),
  }));

  const documentsToSubmit = documents.map((d) => ({
    name: d.name,
    path: d.path,
    dateAdded: d.dateAdded instanceof Date ? d.dateAdded : new Date(d.dateAdded),
  }));

  const handleImagesSelected = async (files: FileList) => {
    const results = await Promise.all(
      Array.from(files).map((file) => {
        const formData = new FormData();
        formData.append('uploadSingleFile', file);
        return dispatch(uploadSingleFile(formData));
      })
    );
    results.forEach((result) => {
      if (uploadSingleFile.fulfilled.match(result)) {
        setPictures((prev) => [
          ...prev,
          {
            name: result.payload.name,
            path: result.payload.path,
            dateAdded: new Date().toISOString(),
          },
        ]);
      }
    });
  };

  const handleImageRemove = async (image: GalleryImage) => {
    const result = await dispatch(
      deleteFileMachineEquipment({ documentPath: image.path })
    );
    if (deleteFileMachineEquipment.fulfilled.match(result)) {
      setPictures((prev) => prev.filter((pic) => pic.path !== image.path));
    }
  };

  return {
    types,
    pictures,
    setPictures,
    picturesToSubmit,
    documents,
    setDocuments,
    documentsToSubmit,
    fileLoading,
    fileError,
    loading,
    error,
    success,
    handleImagesSelected,
    handleImageRemove,
  };
};