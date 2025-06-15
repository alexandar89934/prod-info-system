import express, { Router } from "express";

import { machineAvailabilityStatusRouter } from "./machineAvailabilityStatus.router";
import { personRouter } from "./person.route";
import { roleRouter } from "./role.route";
import { signInRouter } from "./signin.route";
import { workplaceRouter } from "./workplace.route";
import { workplaceCategoryRouter } from "./workplaceCategory.route";

export const apiRouter = express.Router();

const defaultRoutes = [
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
    path: "/workplace",
    route: workplaceRouter,
  },
  {
    path: "/workplace-category",
    route: workplaceCategoryRouter,
  },
  {
    path: "/machine-availability-status",
    route: machineAvailabilityStatusRouter,
  },
];

const addRoutes = (router: Router, routes: any[]) => {
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
