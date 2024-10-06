import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';
import { adminAuthentication } from '@/middleware';
import { taxonomyUpload } from '@/config/fileUpload';

const adminTaxonomyRouting = Router()

adminTaxonomyRouting.post('/create-taxonomy', adminAuthentication(), async (req: Request, res: Response) => {
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

adminTaxonomyRouting.post('/thumbnail-upload', taxonomyUpload.single('image'), async (req, res) => {
   try {
      const file = req.file
      res.status(200).json({ success: true, message: 'Successfully uploaded', file })
   } catch (error) {
      res.status(500).json({ success: false })
   }
})

export default adminTaxonomyRouting