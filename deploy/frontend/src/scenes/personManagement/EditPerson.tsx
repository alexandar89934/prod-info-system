import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import profile from '../../assets/profile.jpeg';

import PersonForm from '@/scenes/personManagement/relatedComponents/PersonForm.tsx';
import { getName } from '@/state/auth/auth.selectors.ts';
import {
  fetchPersonById,
  updatePerson,
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
import { AppDispatch } from '@/state/store.ts';
import { personSchema } from '@/zodValidationSchemas/person.schema.ts';

const EditPerson = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const person = useSelector(selectPerson);
  const imagePath = person?.picture ?? profile;
  const error = useSelector(selectError);
  const loading = useSelector(selectLoading);
  const success = useSelector(selectSuccess);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        navigate('/');
        dispatch(clearPerson());
        dispatch(clearNotifications());
      }, 3000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [error, success, dispatch, navigate]);

  const {
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PersonFormDataBase>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      id: '',
      employeeNumber: 0,
      name: '',
      address: '',
      mail: '',
      additionalInfo: '',
      picture: '',
      startDate: '',
      endDate: '',
      roles: [],
      workplaces: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getName(),
      updatedBy: getName(),
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchPersonById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (person) {
      reset({
        employeeNumber: person.employeeNumber || 0,
        name: person.name || '',
        address: person.address || '',
        mail: person.mail || '',
        additionalInfo: person.additionalInfo || '',
        picture: person.picture || '',
        startDate: person.startDate
          ? new Date(person.startDate).toISOString().split('T')[0]
          : '',
        endDate: person.endDate
          ? new Date(person.endDate).toISOString().split('T')[0]
          : '',
        roles: person.roles || [],
        workplaces: person.workplaces || [],
        createdAt: person.createdAt ? new Date(person.createdAt) : new Date(),
        updatedAt: new Date(),
        createdBy: person.createdBy,
        updatedBy: getName(),
      });
    }
  }, [person, id, reset]);

  const onSubmit = async (data: PersonFormDataBase) => {
    await dispatch(updatePerson({ ...data, id })).unwrap();
    setTimeout(() => {
      navigate('/person');
      dispatch(clearPerson());
      dispatch(clearNotifications());
    }, 3000);
  };

  const handleCancel = () => {
    dispatch(clearPerson());
    dispatch(clearNotifications());
    navigate('/person');
  };

  return (
    <PersonForm
      title="Edit Person"
      control={control}
      errors={errors}
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
      onCancel={handleCancel}
      submitButtonText="Update Person"
      imagePath={imagePath}
      onImageUpload={(uploadedPath: string) => {
        setValue('picture', uploadedPath);
      }}
      personId={id}
      isEdit
    />
  );
};

export default EditPerson;
