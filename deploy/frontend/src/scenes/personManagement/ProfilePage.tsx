import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import profile from '@/assets/profile.jpeg';
import PersonForm from '@/components/PersonForm.tsx';
import { getEmployeeNumber, getName } from '@/state/auth/auth.selectors.ts';
import { setProfilePicture } from '@/state/auth/auth.slice.ts';
import {
  fetchPersonByEmployeeNumber,
  updatePerson,
} from '@/state/person/person.actions.ts';
import {
  selectPerson,
  selectError,
  selectLoading,
  selectSuccess,
} from '@/state/person/person.selectors.ts';
import {
  clearNotifications,
  clearPerson,
} from '@/state/person/person.slice.ts';
import { EditPersonFormData } from '@/state/person/person.types.ts';
import { AppDispatch } from '@/state/store.ts';
import { personSchema } from '@/zodValidationSchemas/person.schema.ts';

const ProfilePage = () => {
  const employeeNumber = getEmployeeNumber();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const person = useSelector(selectPerson) as unknown as EditPersonFormData;
  const profilePicture = person?.picture ?? profile;
  const id = person?.id;
  const error = useSelector(selectError);
  const loading = useSelector(selectLoading);
  const success = useSelector(selectSuccess);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearNotifications());
      }, 3000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [error, success, dispatch]);

  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditPersonFormData>({
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
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: getName(),
      updatedBy: getName(),
    },
  });

  useEffect(() => {
    if (employeeNumber) {
      dispatch(fetchPersonByEmployeeNumber(employeeNumber));
    }
  }, [dispatch, employeeNumber]);

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
        createdAt: person.createdAt ? new Date(person.createdAt) : new Date(),
        updatedAt: new Date(),
        createdBy: person.createdBy,
        updatedBy: getName(),
      });
      setProfilePicture(person.picture);
    }
  }, [person, employeeNumber, reset]);

  const onSubmit = async (data: EditPersonFormData) => {
    const response = await dispatch(updatePerson({ ...data, id })).unwrap();
    if (!response.success) {
      return;
    }
    setTimeout(() => {
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
      title="Edit Profile"
      control={control}
      errors={errors}
      register={register}
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
      onCancel={handleCancel}
      submitButtonText="Update Profile"
      imagePath={profilePicture}
      onImageUpload={(uploadedPath: string) => {
        localStorage.setItem('profilePicture', uploadedPath);
        dispatch(setProfilePicture({ profilePicture: uploadedPath }));
        setValue('picture', uploadedPath);
      }}
      personId={id}
      isEdit
    />
  );
};

export default ProfilePage;
