import express, { Router } from "express";

import { fileUploadRouter } from "./fileUpload.router";
import { jobPositionRouter } from "./jobPosition.route";
import { jobPositionCategoryRouter } from "./jobPositionCategory.route";
import { machineAvailabilityStatusRouter } from "./machineAvailabilityStatus.router";
import { machineEquipmentRouter } from "./machineEquipment.router";
import { machineEquipmentTypeRouter } from "./machineEquipmentType.router";
import { personRouter } from "./person.route";
import { roleRouter } from "./role.route";
import { signInRouter } from "./signin.route";

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