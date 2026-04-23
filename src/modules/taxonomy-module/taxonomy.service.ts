import { Request, Response, NextFunction } from "express";
import prisma from "@/config/prisma";
import { catchAsync } from "@/utils/try";
import { deleteFilesFromStore } from "@/config/fileUpload";
import { CreateTaxonomyBody, UpdateTaxonomyBody, TaxonomyListQuery } from "./interface/taxonomy.interface";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRequestHandler) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};

export const createTaxonomy = asyncHandler(async (req: Request<{}, {}, CreateTaxonomyBody>, res: Response): Promise<void> => {
   const body = req.body;

   const [checkErr, checkSlug] = await catchAsync(
      prisma.taxonomy.findUnique({
         where: { slug: body.slug },
      }),
   );

   if (checkErr) {
      res.status(500).json({ success: false, message: "Database error", error: checkErr });
      return;
   }

   if (checkSlug) {
      res.status(409).json({ success: false, message: "Slug already exists" });
      return;
   }

   const [createErr, newTaxonomy] = await catchAsync(
      prisma.taxonomy.create({
         data: { ...body, type: body.type as any },
      }),
   );

   if (createErr) {
      res.status(500).json({ success: false, message: "Failed to create taxonomy", error: createErr });
      return;
   }

   if (!newTaxonomy) {
      res.status(409).json({ success: false, message: "Unsuccessful" });
      return;
   }

   res.status(200).json({ success: true, message: "Created successfully" });
});

export const updateTaxonomy = asyncHandler(async (req: Request<{ id: string }, {}, UpdateTaxonomyBody>, res: Response): Promise<void> => {
   const id = req.params.id;
   const body = req.body;

   const [slugErr, checkSlug] = await catchAsync(
      prisma.taxonomy.findUnique({
         where: {
            slug: body.slug,
            NOT: { id: +id },
         },
      }),
   );

   if (slugErr) {
      res.status(500).json({ success: false, message: "Database error", error: slugErr });
      return;
   }

   if (checkSlug) {
      res.status(409).json({ success: false, message: "Slug already exists" });
      return;
   }

   const [findErr, taxonomy] = await catchAsync(
      prisma.taxonomy.findUnique({
         where: { id: +id },
         select: {
            thumbnail: true,
         },
      }),
   );

   if (findErr) {
      res.status(500).json({ success: false, message: "Database error", error: findErr });
      return;
   }

   const [updateErr, updatedTaxonomy] = await catchAsync(
      prisma.taxonomy.update({
         where: { id: +id },
         data: { ...body, type: body.type as any },
      }),
   );

   if (updateErr) {
      res.status(500).json({ success: false, message: "Failed to update taxonomy", error: updateErr });
      return;
   }

   if (!updatedTaxonomy) {
      res.status(409).json({ success: false, message: "Not updated" });
      return;
   }

   if (taxonomy?.thumbnail !== body?.thumbnail) {
      await deleteFilesFromStore([taxonomy?.thumbnail]);
   }

   res.status(200).json({ success: true, message: "Updated successfully" });
});

export const getTaxonomyById = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const id = req.params.id;

   const [err, taxonomy] = await catchAsync(
      prisma.taxonomy.findUnique({
         where: { id: +id },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Something wrong", error: err });
      return;
   }

   if (!taxonomy) {
      res.status(404).json({ success: false, message: "Taxonomy not found" });
      return;
   }

   res.status(200).json({ success: true, taxonomy });
});

export const deleteTaxonomy = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
   const id = req.params.id;
   const thumbnail = req.query.thumbnail || "";

   const [err, deletedTaxonomy] = await catchAsync(
      prisma.taxonomy.delete({
         where: { id: +id },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Failed to delete taxonomy", error: err });
      return;
   }

   if (!deletedTaxonomy) {
      res.status(409).json({ success: false, message: "Delete not successfully" });
      return;
   }

   res.status(200).json({ success: true, message: "Deleted successfully" });
});

export const getAllTaxonomies = asyncHandler(async (req: Request<{}, {}, {}, TaxonomyListQuery>, res: Response): Promise<void> => {
   const { search, column = "createdAt", sortOrder = "desc", page = "1", limit = "15" } = req.query;

   const conditions: Record<string, any> = {};
   if (search) {
      conditions.name = {
         contains: search,
         mode: "insensitive",
      };
   }

   const query: Record<string, any> = {};
   if (column && sortOrder) {
      query.orderBy = { [column]: sortOrder };
   }

   const [err, taxonomies] = await catchAsync(
      prisma.taxonomy.findMany({
         where: conditions,
         take: parseInt(String(limit), 10),
         skip: (parseInt(String(page), 10) - 1) * parseInt(String(limit), 10),
         ...query,
      }),
   );

   if (err) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error occurred" });
      return;
   }

   const [countErr, count] = await catchAsync(prisma.taxonomy.count({ where: conditions }));

   if (countErr) {
      res.status(500).json({ success: false, message: "Database error", error: countErr });
      return;
   }

   res.status(200).json({
      success: true,
      taxonomies,
      total: count,
   });
});

export const getDishesCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const [err, categories] = await catchAsync(
      prisma.taxonomy.findMany({
         where: {
            type: "category",
         },
         select: {
            id: true,
            name: true,
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, error: err });
      return;
   }

   res.status(200).json({ success: true, categories });
});

export const uploadThumbnail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const file = req.file;

   res.status(200).json({ success: true, message: "Successfully uploaded", file });
});

export const getTabMenu = asyncHandler(async (req: Request, res: Response): Promise<void> => {
   const [err, categories] = await catchAsync(
      prisma.taxonomy.findMany({
         where: {
            type: "category",
         },
         include: {
            dishes: {
               take: 10,
            },
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Database error", error: err });
      return;
   }

   res.status(200).json({ success: true, categories });
});

export const getCategoryWithDishes = asyncHandler(async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
   const { slug } = req.params;
   const limit = parseInt(req.query.limit as string) || 10;

   const [err, category] = await catchAsync(
      prisma.taxonomy.findUnique({
         where: { slug },
         include: {
            dishes: {
               take: limit,
            },
         },
      }),
   );

   if (err) {
      res.status(500).json({ success: false, message: "Database error", error: err });
      return;
   }

   if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
   }

   res.status(200).json({ success: true, category });
});
