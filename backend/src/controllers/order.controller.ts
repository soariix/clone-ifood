import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const createOrderSchema = z.object({
  restaurantId: z.string(),
  addressId: z.string(),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1),
      notes: z.string().optional(),
    }),
  ).min(1),
});

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
    return;
  }

  const { restaurantId, addressId, items } = parsed.data;

  // Busca os itens e calcula o total
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.itemId) }, restaurantId, isAvailable: true },
  });

  if (menuItems.length !== items.length) {
    res.status(400).json({ message: 'Um ou mais itens não estão disponíveis' });
    return;
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) {
    res.status(404).json({ message: 'Restaurante não encontrado' });
    return;
  }

  const subtotal = items.reduce((sum, oi) => {
    const mi = menuItems.find((m) => m.id === oi.itemId)!;
    return sum + mi.price * oi.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      restaurantId,
      addressId,
      deliveryFee: restaurant.deliveryFee,
      total: subtotal + restaurant.deliveryFee,
      items: {
        create: items.map((oi) => {
          const mi = menuItems.find((m) => m.id === oi.itemId)!;
          return { menuItemId: oi.itemId, quantity: oi.quantity, unitPrice: mi.price, notes: oi.notes };
        }),
      },
    },
    include: { items: { include: { menuItem: true } }, restaurant: true, address: true },
  });

  res.status(201).json(order);
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { items: { include: { menuItem: true } }, restaurant: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  res.json(orders);
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { items: { include: { menuItem: true } }, restaurant: true, address: true },
  });

  if (!order) {
    res.status(404).json({ message: 'Pedido não encontrado' });
    return;
  }

  res.json(order);
}
