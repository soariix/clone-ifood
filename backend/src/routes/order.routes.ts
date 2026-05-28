import { Router } from 'express';
import { createOrder, getOrderById, getOrders } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

export const orderRouter = Router();

orderRouter.use(authenticate); // todas as rotas de pedido exigem auth

orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/:id', getOrderById);
