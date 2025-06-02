import { Router, Request, Response } from 'express';
import prisma from '@/config/prisma';

const publicTaxonomyRouting = Router()

interface TabMenuQueryType {
   categories?: string[]; // categories can be a single string or an array of strings
}
publicTaxonomyRouting.get("/tab-menu", async (req: Request<{}, {}, {}, TabMenuQueryType>, res: Response) => {
   try {
      const { categories } = req.query
      const tabMenu = await prisma.taxonomy.findMany({
         where: {
            slug: {
               in: categories
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
                  },
               },

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

publicTaxonomyRouting.get("/category-with-dishes/:slug", async (req, res): Promise<any> => {
   try {
      const { slug } = req.params
      const { limit = 15 } = req.query
      const taxonomyData = await prisma.taxonomy.findUnique({
         where: {
            slug: slug
         },
         include: {
            dishes: {
               take: +limit,
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
         },
      });

      return res.status(200).json({ success: true, taxonomy: taxonomyData, message: 'Successfully done' })
   } catch (error) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
   }
})

export default publicTaxonomyRouting