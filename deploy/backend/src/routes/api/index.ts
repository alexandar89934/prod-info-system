import express, { Router } from "express";

import { signInRouter } from "./signin.route";

export const apiRouter = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: signInRouter,
  },
];

const addRoutes = (router: Router, routes: any[]) => {
  routes.forEach((route) => {
    if (Array.isArray(route.route)) {
      // If the route has nested routes, recursively add them
      const nestedRouter = express.Router();
      addRoutes(nestedRouter, route.route);
      router.use(route.path, nestedRouter);
    } else {
      router.use(route.path, route.route);
    }
  });
};

addRoutes(apiRouter, defaultRoutes);
