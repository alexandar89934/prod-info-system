import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { GalleryImage } from '@/reusableComponents/ImageGallery.tsx';
import { DocumentRef } from '@/reusableComponents/MachineDocumentUpload.tsx';
import {
  deleteFileMachineEquipment,
  uploadSingleFile,
} from '@/state/fileUploads/files.actions.ts';
import {
  selectError as selectFileError,
  selectLoading as selectFileLoading,
} from '@/state/fileUploads/files.selectors.ts';
import { useAppDispatch } from '@/state/hooks';
import {
  selectItemError,
  selectItemLoading,
  selectItemSuccess,
} from '@/state/item/item.selectors';
import { clearError, clearSuccess } from '@/state/item/item.slice';

export const useItemForm = () => {
  const dispatch = useAppDispatch();

  const loading = useSelector(selectItemLoading);
  const error = useSelector(selectItemError);
  const success = useSelector(selectItemSuccess);
  const fileLoading = useSelector(selectFileLoading);
  const fileError = useSelector(selectFileError);

  const [pictures, setPictures] = useState<GalleryImage[]>([]);
  const [documents, setDocuments] = useState<DocumentRef[]>([]);

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
    dateAdded: p.dateAdded instanceof Date ? p.dateAdded : new Date(p.dateAdded),
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
          { name: result.payload.name, path: result.payload.path, dateAdded: new Date().toISOString() },
        ]);
      }
    });
  };

  const handleImageRemove = async (image: GalleryImage) => {
    const result = await dispatch(deleteFileMachineEquipment({ documentPath: image.path }));
    if (deleteFileMachineEquipment.fulfilled.match(result)) {
      setPictures((prev) => prev.filter((pic) => pic.path !== image.path));
    }
  };

  return {
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