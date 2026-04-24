import express from "express";
import { MenuRestaurant } from "../controller/auth.restaurants.controller";

const router = express.Router();

router.get("/:id", MenuRestaurant);

export default router;
