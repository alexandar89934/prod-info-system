import { Request, Response } from "express";
import httpStatus from "http-status";

import { workplaceCategoryService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createWorkplaceCategory = catchAsync(
  async (req: Request, res: Response) => {
    const categoryData = req.body;
    const category =
      await workplaceCategoryService.createWorkplaceCategory(categoryData);

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Workplace Category!",
      content: { category },
    });
  },
);

export const updateWorkplaceCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid workplace category ID in request.",
      });
    }

    const categoryData = { ...req.body, id: Number(id) };
    const category =
      await workplaceCategoryService.updateWorkplaceCategory(categoryData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Workplace Category!",
      content: { category },
    });
  },
);

export const getAllWorkplaceCategories = catchAsync(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { categories, totalCategories } =
      await workplaceCategoryService.getAllWorkplaceCategories(
        Number(limit),
        offset,
        String(search),
        String(sortField),
        String(sortOrder),
      );
    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched workplace categories.",
      content: {
        categories,
        pagination: {
          total: totalCategories,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  },
);

export const getWorkplaceCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid category ID in request.",
      });
    }

    const category = await workplaceCategoryService.getWorkplaceCategoryById(
      Number(id),
    );

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Workplace category not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched workplace category by ID.",
      content: { category },
    });
  },
);

export const deleteWorkplaceCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid workplace category ID in request.",
      });
    }

    const deleted = await workplaceCategoryService.deleteWorkplaceCategory(
      Number(id),
    );
    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Workplace category not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Workplace Category!",
      content: { deleted },
    });
  },
);
