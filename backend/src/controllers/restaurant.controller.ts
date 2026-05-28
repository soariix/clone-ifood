import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getRestaurants(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const category = req.query.category as string | undefined;
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;

  const where = {
    ...(category ? { category: { slug: category } } : {}),
    ...(minRating ? { rating: { gte: minRating } } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.restaurant.findMany({
      where,
      include: { category: true },
      orderBy: { rating: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.restaurant.count({ where }),
  ]);

  res.json({
    data,
    total,
    page,
    limit,
    hasNextPage: page * limit < total,
  });
}

export async function getRestaurantById(req: Request, res: Response): Promise<void> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });

  if (!restaurant) {
    res.status(404).json({ message: 'Restaurante não encontrado' });
    return;
  }

  res.json(restaurant);
}

export async function getRestaurantMenu(req: Request, res: Response): Promise<void> {
  const items = await prisma.menuItem.findMany({
    where: { restaurantId: req.params.id },
    orderBy: { sectionTitle: 'asc' },
  });

  // Agrupa por seção
  const sectionsMap = new Map<string, typeof items>();
  for (const item of items) {
    if (!sectionsMap.has(item.sectionTitle)) sectionsMap.set(item.sectionTitle, []);
    sectionsMap.get(item.sectionTitle)!.push(item);
  }

  const sections = Array.from(sectionsMap.entries()).map(([title, data]) => ({ title, data }));
  res.json(sections);
}

export async function searchRestaurants(req: Request, res: Response): Promise<void> {
  const q = (req.query.q as string) ?? '';
  const restaurants = await prisma.restaurant.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ],
    },
    include: { category: true },
    take: 20,
  });

  res.json(restaurants);
}
