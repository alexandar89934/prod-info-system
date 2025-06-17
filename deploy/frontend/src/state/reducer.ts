import { combineReducers } from '@reduxjs/toolkit';

import authSlice from '@/state/auth/auth.slice.ts';
import machineAvailabilityStatusSlice from '@/state/machineAvailabilityStatus/machineAvailabilityStatus.slice.ts';
import machineEquipmentTypesSlice from '@/state/machineEquipmentTypes/machineEquipmentTypes.slice.ts';
import personSlice from '@/state/person/person.slice.ts';
import roleSlice from '@/state/role/role.slice.ts';
import themeSlice from '@/state/theme/theme.slice.ts';
import workplaceSlice from '@/state/workplace/workplace.slice.ts';
import workplaceCategorySlice from '@/state/workplaceCategory/workplaceCategory.slice.ts';

const reducer = combineReducers({
  theme: themeSlice,
  auth: authSlice,
  person: personSlice,
  role: roleSlice,
  workplace: workplaceSlice,
  workplaceCategory: workplaceCategorySlice,
  machineAvailabilityStatus: machineAvailabilityStatusSlice,
  machineEquipmentType: machineEquipmentTypesSlice,
});

export default { reducer };
