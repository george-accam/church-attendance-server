import { Router } from "express";
import { getTitheAndWelfare, getSingleTitheAndWelfare, createTitheAndWelfare, updateTitheAndWelfare, deleteTitheAndWelfare } from "../controllers/titheAndWelfareControllers.js";

const router = Router();

router.post("/tithe-welfare", createTitheAndWelfare); // create a new tithe and welfare record
router.put("/tithe-welfare/:id", updateTitheAndWelfare); // update a single tithe and welfare record
router.get("/tithe-welfare", getTitheAndWelfare); // get all tithe and welfare records
router.get("/tithe-welfare/:userId", getSingleTitheAndWelfare); // get a single tithe and welfare record
router.delete("/tithe-welfare/:id", deleteTitheAndWelfare); // delete a single tithe and welfare record

export default router;