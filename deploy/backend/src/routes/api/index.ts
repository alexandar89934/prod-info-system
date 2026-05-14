import express, { Router } from "express";

import { attendanceRouter } from "./attendance.route";
import { attendanceEditRequestRouter } from "./attendanceEditRequest.route";
import { companyRouter } from "./company.route";
import { customerOrderRouter } from "./customerOrder.route";
import { fileUploadRouter } from "./fileUpload.router";
import { itemRouter } from "./item.route";
import { jobPositionRouter } from "./jobPosition.route";
import { jobPositionCategoryRouter } from "./jobPositionCategory.route";
import { leaveRecordRouter } from "./leaveRecord.route";
import { machineRouter } from "./machine.router";
import { machineAvailabilityStatusRouter } from "./machineAvailabilityStatus.router";
import { machineEquipmentRouter } from "./machineEquipment.router";
import { machineEquipmentTypeRouter } from "./machineEquipmentType.router";
import { moldRouter } from "./mold.route";
import { moldMachineCompatibilityRouter } from "./moldMachineCompatibility.route";
import { packagingUnitRouter } from "./packagingUnit.route";
import { personRouter } from "./person.route";
import { productionPlanRouter } from "./productionPlan.route";
import { productionPlanActionRouter } from "./productionPlanAction.route";
import { responsibilityRouter } from "./responsibility.route";
import { roleRouter } from "./role.route";
import { signInRouter } from "./signin.route";
import { systemConfigRouter } from "./systemConfig.route";

export const apiRouter = express.Router();

interface RouteDefinition {
  path: string;
  route: Router | RouteDefinition[];
}

const defaultRoutes: RouteDefinition[] = [
  {
    path: "/auth",
    route: signInRouter,
  },
  {
    path: "/person",
    route: personRouter,
  },
  {
    path: "/role",
    route: roleRouter,
  },
  {
    path: "/job-position",
    route: jobPositionRouter,
  },
  {
    path: "/job-position-category",
    route: jobPositionCategoryRouter,
  },
  {
    path: "/machine-availability-status",
    route: machineAvailabilityStatusRouter,
  },
  {
    path: "/machine-equipment-type",
    route: machineEquipmentTypeRouter,
  },
  {
    path: "/machine-equipment",
    route: machineEquipmentRouter,
  },
  {
    path: "/file-upload",
    route: fileUploadRouter,
  },
  {
    path: "/machine",
    route: machineRouter,
  },
  {
    path: "/responsibility",
    route: responsibilityRouter,
  },
  {
    path: "/system-config",
    route: systemConfigRouter,
  },
  {
    path: "/attendance",
    route: attendanceRouter,
  },
  {
    path: "/attendance-edit-request",
    route: attendanceEditRequestRouter,
  },
  {
    path: "/leave-record",
    route: leaveRecordRouter,
  },
  {
    path: "/mold",
    route: moldRouter,
  },
  {
    path: "/mold-machine-compatibility",
    route: moldMachineCompatibilityRouter,
  },
  {
    path: "/item",
    route: itemRouter,
  },
  {
    path: "/packaging-unit",
    route: packagingUnitRouter,
  },
  {
    path: "/company",
    route: companyRouter,
  },
  {
    path: "/customer-order",
    route: customerOrderRouter,
  },
  {
    path: "/production-plan",
    route: productionPlanRouter,
  },
  {
    path: "/production-plan-action",
    route: productionPlanActionRouter,
  },
];

const addRoutes = (router: Router, routes: RouteDefinition[]) => {
  routes.forEach((route) => {
    if (Array.isArray(route.route)) {
      const nestedRouter = express.Router();
      addRoutes(nestedRouter, route.route);
      router.use(route.path, nestedRouter);
    } else {
      router.use(route.path, route.route);
    }
  });
};

addRoutes(apiRouter, defaultRoutes);
