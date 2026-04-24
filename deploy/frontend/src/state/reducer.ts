import { combineReducers } from '@reduxjs/toolkit';

import machineEquipmentSlice from './machineEquipment/machineEquipment.slice';

import authSlice from '@/state/auth/auth.slice.ts';
import filesSlice from '@/state/fileUploads/files.slice.ts';
import jobPositionSlice from '@/state/jobPosition/jobPosition.slice.ts';
import jobPositionCategorySlice from '@/state/jobPositionCategory/jobPositionCategory.slice.ts';
import machineAvailabilityStatusSlice from '@/state/machineAvailabilityStatus/machineAvailabilityStatus.slice.ts';
import machineEquipmentTypesSlice from '@/state/machineEquipmentTypes/machineEquipmentTypes.slice.ts';
import personSlice from '@/state/person/person.slice.ts';
import roleSlice from '@/state/role/role.slice.ts';
import themeSlice from '@/state/theme/theme.slice.ts';

const reducer = combineReducers({
  theme: themeSlice,
  auth: authSlice,
  person: personSlice,
  role: roleSlice,
  jobPosition: jobPositionSlice,
  jobPositionCategory: jobPositionCategorySlice,
  machineAvailabilityStatus: machineAvailabilityStatusSlice,
  machineEquipmentType: machineEquipmentTypesSlice,
  machineEquipment: machineEquipmentSlice,
  filesUpload: filesSlice,
});

export default { reducer };