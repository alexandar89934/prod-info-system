import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import profile from '../../assets/profile.jpeg';

import PersonForm from '@/scenes/personManagement/relatedComponents/PersonForm.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';
import { useAppDispatch } from '@/state/hooks.ts';
import {
  addPerson,
  deleteFileNewPerson,
} from '@/state/person/person.actions.ts';
import {
  selectError,
  selectLoading,
  selectPerson,
  selectSuccess,
} from '@/state/person/person.selectors.ts';
import {
  clearNotifications,
  clearPerson,
} from '@/state/person/person.slice.ts';
import { PersonFormDataBase } from '@/state/person/person.types.ts';
import { personSchema } from '@/zodValidationSchemas/person.schema.ts';

const AddPerson = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const person = useSelector(selectPerson);
  const error = useSelector(selectError);
  const loading = useSelector(selectLoading);
  const success = useSelector(selectSuccess);
  const documentsRef = useRef(person.documents);
  const [currentImagePath, setCurrentImagePath] = useState<string>(profile);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearPerson());
        dispatch(clearNotifications());
      }, 3000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [error, success, dispatch]);

  const {
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PersonFormDataBase>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      employeeNumber: 0,
      name: '',
      address: '',
      mail: '',
      additionalInfo: '',
      picture: profile,
      documents: [],
      roles: [],
      startDate: '',
      endDate: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getName(),
      updatedBy: getName(),
    },
  });

  const handleAddPerson = async (data: PersonFormDataBase) => {
    const payload = {
      ...data,
      picture: currentImagePath,
      documents: person?.documents ?? [],
    };
    await dispatch(addPerson(payload)).unwrap();
    reset();
    setCurrentImagePath(profile);
  };

  const cleanup = async () => {
    await Promise.all(
      documentsRef.current.map((doc) =>
        dispatch(deleteFileNewPerson({ documentPath: doc.path }))
      )
    );
    if (currentImagePath !== profile) {
      dispatch(deleteFileNewPerson({ documentPath: currentImagePath }));
    }
    reset();
  };

  const handleCancel = async () => {
    await cleanup();
    navigate('/person');
  };

  const onSubmit = async (data: PersonFormDataBase) => {
    await handleAddPerson(data);
  };

  const handleImageUpload = (uploadedPath: string) => {
    setCurrentImagePath(uploadedPath);
    setValue('picture', uploadedPath, { shouldValidate: true });
  };

  useEffect(() => {
    return () => {
      (async () => {
        await cleanup();
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    documentsRef.current = person.documents;
  }, [person.documents]);

  return (
    <PersonForm
      title="Add Person"
      control={control}
      errors={errors}
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
      onCancel={handleCancel}
      submitButtonText="Add Person"
      imagePath={currentImagePath}
      onImageUpload={handleImageUpload}
      isEdit={false}
    />
  );
};

export default AddPerson;
