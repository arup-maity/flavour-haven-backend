import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';

const publicTaxonomyRouting = Router()

interface TabMenuQuery {
   categories?: string[]; // categories can be a single string or an array of strings
}
publicTaxonomyRouting.get("/tab-menu", async (req: Request<{}, {}, {}, TabMenuQuery>, res: Response) => {
   try {
      const { categories } = req.query
      const tabMenu = await prisma.taxonomy.findMany({
         where: {
            slug: {
               in: categories, // Apply filter if categoryArray is not empty
            },
         },
         include: {
            dishes: {
               include: {
                  dish: {
                     select: {
                        title: true,
                        price: true,
                        thumbnail: true,
                        nonVeg: true
                     }
                  }
               }
            }
         }
      });
      // res.json(tabMenu);
      res.status(200).json({ success: true, tabMenu })
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
   }
});


export default publicTaxonomyRouting