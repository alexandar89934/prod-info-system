import express, { Router } from "express";

import { personRouter } from "./person.route";
import { roleRouter } from "./role.route";
import { signInRouter } from "./signin.route";

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
