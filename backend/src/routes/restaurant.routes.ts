import { Router } from 'express';
import {
    getRestaurantById,
    getRestaurantMenu,
    getRestaurants,
    searchRestaurants,
} from '../controllers/restaurant.controller';

export const restaurantRouter = Router();

restaurantRouter.get('/', getRestaurants);
restaurantRouter.get('/search', searchRestaurants);
restaurantRouter.get('/:id', getRestaurantById);
restaurantRouter.get('/:id/menu', getRestaurantMenu);
