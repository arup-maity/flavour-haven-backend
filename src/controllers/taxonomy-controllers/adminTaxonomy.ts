import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';
import { taxonomyUpload } from '@/config/fileUpload';

const adminTaxonomyRouting = Router()

interface Query {
   orderBy?: {
      [key: string]: 'asc' | 'desc'; 
   };
}

adminTaxonomyRouting.use(adminAuthentication())
adminTaxonomyRouting.post('/create-taxonomy', async (req: Request, res: Response) => {
   try {
      const body = req.body;
      const checkSlug = await prisma.taxonomy.findUnique({
         where: { slug: body.slug }
      })
      if (checkSlug) res.status(409).send({ success: false, message: "Slug already exists" })
      const newTaxonomy = await prisma.taxonomy.create({
         data: body
      })
      if (!newTaxonomy) res.status(409).json({ success: false, message: "Unsccessfull" })
      res.status(200).json({ success: true, message: 'Created successfully' })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: 'Failed to create taxonomy' })
   }
})
adminTaxonomyRouting.put('/update-taxonomy/:id', async (req, res) => {
   try {
      const id = req.params.id;
      const { oldThumbnail, ...rest } = req.body;
      const checkSlug = await prisma.taxonomy.findUnique({
         where: {
            slug: rest.slug,
            NOT: { id: +id }
         }
      })
      if (checkSlug) res.status(409).send({ success: false, message: "Slug already exists" })
      const updatedTaxonomy = await prisma.taxonomy.update({
         where: { id: +id },
         data: rest
      })
      if (!updatedTaxonomy) res.status(409).send({ success: false, message: "Not updated" })
      if (oldThumbnail !== rest?.thumbnail) {
         // await deleteFile('restaurant', oldThumbnail)
      }
      res.status(200).send({ success: true, message: 'Updated successfully' })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: 'Failed to update taxonomy' })
   }
})
adminTaxonomyRouting.get('/read-taxonomy/:id', async (req, res) => {
   try {
      const id = req.params.id;
      const taxonomy = await prisma.taxonomy.findUnique({
         where: { id: +id }
      })
      res.status(200).send({ success: true, taxonomy })
   } catch (error) {
      res.status(500).send({ success: false, message: 'Something wrong', error })
   }
})
adminTaxonomyRouting.delete("/delete-taxonomy/:id", async (req, res) => {
   try {
      const id = req.params.id;
      const thumbnail = req.query.thumbnail
      const deletedTaxonomy = await prisma.taxonomy.delete({
         where: { id: +id }
      })
      if (!deletedTaxonomy) res.status(409).send({ success: false, message: "Delete not successfully" })
      // await deleteFile('restaurant', thumbnail)
      res.status(200).send({ success: true, message: 'Deleted successfully' })
   } catch (error) {
      console.error(error)
      res.status(500).send({ success: false, message: 'Failed to delete taxonomy' })
   }
})
adminTaxonomyRouting.get('/all-taxonomies', async (req, res) => {
   try {
      const { search, column = 'createdAt', sortOrder = 'desc', page = 1, limit = 15 } = req.query
      const conditions: any = {}
      if (search) {
         conditions.cityName = {
            contains: search,
            mode: "insensitive"
         }
      }
      const query: Query = {};
      if (column && sortOrder) {
         query.orderBy = { [column]: sortOrder }
      }

      const taxonomies = await prisma.taxonomy.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query
      })
      const count = await prisma.taxonomy.count()
      res.status(200).send({ success: true, taxonomies, total: count })
   } catch (error) {
      res.status(500).send({ success: false, error })
   }
})
adminTaxonomyRouting.post('/thumbnail-upload', adminAuthentication(), taxonomyUpload.single('image'), async (req, res) => {
   try {
      const file = req.file
      res.status(200).json({ success: true, message: 'Successfully uploaded', file })
   } catch (error) {
      res.status(500).json({ success: false })
   }
})

export default adminTaxonomyRouting