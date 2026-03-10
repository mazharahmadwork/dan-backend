import { Request, Response } from "express";
import { CountryService } from "./country.service";

export const getCountries = async (_req: Request, res: Response) => {
  try {
    const countries = await CountryService.getCountries();
    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Failed to fetch countries" });
  }
};

export const getCountryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const country = await CountryService.getCountryById(id);

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.json(country);
  } catch (error) {
    console.error("Error fetching country:", error);
    res.status(500).json({ message: "Failed to fetch country" });
  }
};

export const createCountry = async (req: Request, res: Response) => {
  try {
    const { name, iso_code } = req.body;

    if (!name || !iso_code) {
      return res
        .status(400)
        .json({ message: "name and iso_code are required" });
    }

    const country = await CountryService.createCountry({ name, iso_code });
    res.status(201).json(country);
  } catch (error) {
    console.error("Error creating country:", error);
    res.status(500).json({ message: "Failed to create country" });
  }
};

export const updateCountry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, iso_code } = req.body;

    if (!name || !iso_code) {
      return res
        .status(400)
        .json({ message: "name and iso_code are required" });
    }

    const updated = await CountryService.updateCountry(id, { name, iso_code });

    if (!updated) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating country:", error);
    res.status(500).json({ message: "Failed to update country" });
  }
};

export const deleteCountry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await CountryService.deleteCountry(id);

    if (!deleted) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting country:", error);
    res.status(500).json({ message: "Failed to delete country" });
  }
};
