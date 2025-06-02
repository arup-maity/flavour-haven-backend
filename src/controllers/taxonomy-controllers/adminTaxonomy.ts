import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';
import { deleteFilesFromStore, taxonomyUpload } from '@/config/fileUpload';

const adminTaxonomyRouting = Router()

adminTaxonomyRouting.use(adminAuthentication())
adminTaxonomyRouting.post('/create-taxonomy', async (req: Request, res: Response): Promise<any> => {
   try {
      const body = req.body;
      const checkSlug = await prisma.taxonomy.findUnique({
         where: { slug: body.slug }
      })
      if (checkSlug) return res.status(409).json({ success: false, message: "Slug already exists" })
      const newTaxonomy = await prisma.taxonomy.create({
         data: body
      })
      if (!newTaxonomy) return res.status(409).json({ success: false, message: "Unsccessfull" })
      return res.status(200).json({ success: true, message: 'Created successfully' })
   } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, message: 'Failed to create taxonomy' })
   }
})
adminTaxonomyRouting.put('/update-taxonomy/:id', async (req: Request, res: Response): Promise<any> => {
   try {
      const id = req.params.id;
      const body = req.body;
      const checkSlug = await prisma.taxonomy.findUnique({
         where: {
            slug: body.slug,
            NOT: { id: +id }
         }
      })
      if (checkSlug) return res.status(409).json({ success: false, message: "Slug already exists" })
      // get data
      const taxonomy = await prisma.taxonomy.findUnique({
         where: { id: +id },
         select: {
            thumbnail: true
         }
      })
      // update
      const updatedTaxonomy = await prisma.taxonomy.update({
         where: { id: +id },
         data: body
      })
      if (!updatedTaxonomy) return res.status(409).json({ success: false, message: "Not updated" })
      if (taxonomy?.thumbnail !== body?.thumbnail) {
         await deleteFilesFromStore([taxonomy?.thumbnail])
      }
      return res.status(200).json({ success: true, message: 'Updated successfully' })
   } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, message: 'Failed to update taxonomy' })
   }
})
adminTaxonomyRouting.get('/read-taxonomy/:id', async (req: Request, res: Response): Promise<any> => {
   try {
      const id = req.params.id;
      const taxonomy = await prisma.taxonomy.findUnique({
         where: { id: +id }
      })
      if (!taxonomy) return res.status(404).json({ success: false, message: 'Taxonomy not found' })
      return res.status(200).json({ success: true, taxonomy })
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Something wrong', error })
   }
})
adminTaxonomyRouting.delete("/delete-taxonomy/:id", async (req: Request, res: Response): Promise<any> => {
   try {
      const id = req.params.id;
      const thumbnail = req.query.thumbnail || ''
      const deletedTaxonomy = await prisma.taxonomy.delete({
         where: { id: +id }
      })
      if (!deletedTaxonomy) return res.status(409).send({ success: false, message: "Delete not successfully" })
      return res.status(200).send({ success: true, message: 'Deleted successfully' })
   } catch (error) {
      console.error(error)
      return res.status(500).send({ success: false, message: 'Failed to delete taxonomy' })
   }
})
adminTaxonomyRouting.get("/all-taxonomies", async (req: Request, res: Response): Promise<any> => {
   try {
      const {
         search,
         column = "createdAt",
         sortOrder = "desc",
         page = "1",
         limit = "15",
      } = req.query as {
         search?: string;
         column?: string;
         sortOrder?: "asc" | "desc";
         page?: string;
         limit?: string;
      };

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

      const taxonomies = await prisma.taxonomy.findMany({
         where: conditions,
         take: parseInt(limit, 10),
         skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
         ...query,
      });

      const count = await prisma.taxonomy.count({ where: conditions });

      return res.status(200).send({
         success: true,
         taxonomies,
         total: count,
      });
   } catch (error: unknown) {
      return res.status(500).send({
         success: false,
         error: error instanceof Error ? error.message : "Unknown error occurred",
      });
   }
}
);
adminTaxonomyRouting.get('/dishes-category', async (req, res): Promise<any> => {
   try {
      const categories = await prisma.taxonomy.findMany({
         where: {
            type: 'category'
         },
         select: {
            id: true,
            name: true
         }
      })
      return res.status(200).json({ success: true, categories })
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
})
adminTaxonomyRouting.post('/thumbnail-upload', adminAuthentication(), taxonomyUpload.single('image'), async (req, res): Promise<any> => {
   try {
      const file = req.file
      return res.status(200).json({ success: true, message: 'Successfully uploaded', file })
   } catch (error) {
      return res.status(500).json({ success: false })
   }
})

export default adminTaxonomyRouting