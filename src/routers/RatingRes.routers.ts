import express from "express";
import { TopRating } from "../controller/auth.restaurants.controller";

const router = express.Router();

router.get("/", TopRating);

export default router;
