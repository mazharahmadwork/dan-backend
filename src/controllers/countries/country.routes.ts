import { Router } from "express";
import {
  getCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry
} from "./country.controller";

const router = Router();

// GET /api/countries
router.get("/", getCountries);

// GET /api/countries/:id
router.get("/:id", getCountryById);

// POST /api/countries
router.post("/", createCountry);

// PUT /api/countries/:id
router.put("/:id", updateCountry);

// DELETE /api/countries/:id
router.delete("/:id", deleteCountry);

export default router;
