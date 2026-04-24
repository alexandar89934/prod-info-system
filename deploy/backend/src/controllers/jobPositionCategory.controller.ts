import { Request, Response } from "express";
import httpStatus from "http-status";

import { jobPositionCategoryService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createJobPositionCategory = catchAsync(
  async (req: Request, res: Response) => {
    const categoryData = req.body;
    const category =
      await jobPositionCategoryService.createJobPositionCategory(categoryData);

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Job Position Category!",
      content: { category },
    });
  },
);

export const updateJobPositionCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid job position category ID in request.",
      });
    }

    const categoryData = { ...req.body, id: Number(id) };
    const category =
      await jobPositionCategoryService.updateJobPositionCategory(categoryData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Job Position Category!",
      content: { category },
    });
  },
);

export const getAllJobPositionCategories = catchAsync(
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
      await jobPositionCategoryService.getAllJobPositionCategories(
        Number(limit),
        offset,
        String(search),
        String(sortField),
        String(sortOrder),
      );
    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched job position categories.",
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

export const getJobPositionCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid category ID in request.",
      });
    }

    const category = await jobPositionCategoryService.getJobPositionCategoryById(
      Number(id),
    );

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Job Position category not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched job position category by ID.",
      content: { category },
    });
  },
);

export const deleteJobPositionCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid job position category ID in request.",
      });
    }

    const deleted = await jobPositionCategoryService.deleteJobPositionCategory(
      Number(id),
    );
    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Job Position category not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Job Position Category!",
      content: { deleted },
    });
  },
);