
import express from "express";
import { testDB } from "../controllers/test.controller.js";

const router = express.Router();

router.get("/test-db", testDB);

export default router;

