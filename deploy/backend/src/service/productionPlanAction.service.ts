import httpStatus from "http-status";
import { createActionQuery, getActionsByPlanIdQuery } from "../models/productionPlanAction.model";
import { getProductionPlanByIdQuery, incrementProducedQuantityQuery, incrementScrapQuantityQuery } from "../models/productionPlan.model";
import { getMoldMountedOnMachineQuery, setMoldCurrentMachineQuery } from "../models/mold.model";
import { getPersonForActionVerificationQuery } from "../models/attendance.model";
import { checkIfAdminQuery, checkUserHasResponsibilityQuery } from "../models/user.model";
import { compareHashedData } from "../shared/utils/hash";
import { ApiError } from "../shared/error/ApiError";
import { CreateProductionPlanActionData, ProductionPlanAction, ProductionPlanActionType } from "./productionPlanAction.service.types";

const ACTION_RESPONSIBILITY_MAP: Record<ProductionPlanActionType, string> = {
  mold_change_started:    "pokretanje_izmene_kalupa",
  mold_change_completed:  "zavrsetak_izmene_kalupa",
  plan_started:           "pokretanje_plana",
  first_good_part_approved: "odobrenje_prvog_komada_kk",
  operator_started:       "pocetak_rada_operatera",
  scrap_entry:            "unos_skarta_produkcija",
  qty_increased:          "povecanje_kolicine",
  packaging_unit_full:    "potvrda_pune_kaveze",
  operator_changed:       "izmena_operatera",
  quality_checked:        "kontrola_kk_u_produkciji",
  plan_stopped:           "zaustavljanje_plana",
  plan_completed:         "zavrsetak_plana",
  plan_change_started:    "pokretanje_promene_plana",
  plan_resumed:           "nastavak_plana",
  machine_service_started:"pokretanje_servisa_masine",
  machine_service_ended:  "zavrsetak_servisa_masine",
  machine_repair_started: "pokretanje_popravke_masine",
  machine_repair_ended:   "zavrsetak_popravke_masine",
  machine_fault_reported: "prijava_kvara_masine",
  plan_created:           "kreiranje_plana",
  plan_updated:           "izmena_plana",
  order_created:          "kreiranje_naloga",
  order_updated:          "izmena_naloga",
};

export const getByPlanId = async (planId: string): Promise<ProductionPlanAction[]> => {
  try {
    return await getActionsByPlanIdQuery(planId);
  } catch (error) {
    throw new ApiError("Error fetching plan actions!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const create = async (data: CreateProductionPlanActionData): Promise<ProductionPlanAction> => {
  try {
    const action = await createActionQuery(data);
    if (data.productionPlanId && data.actionType === "qty_increased" && data.quantity != null && data.quantity > 0) {
      await incrementProducedQuantityQuery(data.productionPlanId, data.quantity);
    }
    if (data.productionPlanId && data.actionType === "scrap_entry" && data.quantity != null && data.quantity > 0) {
      await incrementScrapQuantityQuery(data.productionPlanId, data.quantity);
    }
    if (data.productionPlanId && data.actionType === "mold_change_completed") {
      const plan = await getProductionPlanByIdQuery(data.productionPlanId);
      if (plan && plan.machineId && plan.moldId) {
        const previousMold = await getMoldMountedOnMachineQuery(plan.machineId);
        if (previousMold && previousMold.id !== plan.moldId) {
          await setMoldCurrentMachineQuery(previousMold.id, null);
        }
        await setMoldCurrentMachineQuery(plan.moldId, plan.machineId);
      }
    }
    return action;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error creating plan action!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const verifyActionPermission = async (
  employeeNumber: string,
  pin: string,
  actionType: ProductionPlanActionType
): Promise<{ personId: string; personName: string }> => {
  try {
    const person = await getPersonForActionVerificationQuery(employeeNumber);
    if (!person) throw new ApiError("Employee not found.", httpStatus.NOT_FOUND);

    if (person.pin) {
      const pinMatch = await compareHashedData(pin, person.pin);
      if (!pinMatch) throw new ApiError("Incorrect PIN.", httpStatus.UNPROCESSABLE_ENTITY);
    }

    const [adminResult] = await checkIfAdminQuery(person.userId);
    if (!adminResult?.isAdmin) {
      const responsibilityCode = ACTION_RESPONSIBILITY_MAP[actionType];
      const [result] = await checkUserHasResponsibilityQuery(person.userId, responsibilityCode);
      if (!result?.hasIt) {
        throw new ApiError(
          `This employee does not have the required permission: ${responsibilityCode}`,
          httpStatus.FORBIDDEN
        );
      }
    }

    return { personId: person.personId, personName: person.name };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error verifying action permission!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};