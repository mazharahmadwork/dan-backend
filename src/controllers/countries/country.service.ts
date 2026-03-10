import { randomUUID } from "crypto";
import { Country, CreateCountryDTO } from "./country.types";
import { CountryModel } from "./country.model";

export const CountryService = {
  async getCountries(): Promise<Country[]> {
    return CountryModel.findAll();
  },

  async getCountryById(id: string): Promise<Country | null> {
    return CountryModel.findById(id);
  },

  async createCountry(data: CreateCountryDTO): Promise<Country> {
    const country: Country = {
      id: randomUUID(),
      name: data.name,
      iso_code: data.iso_code
    };

    return CountryModel.create(country);
  },

  async updateCountry(
    id: string,
    data: CreateCountryDTO
  ): Promise<Country | null> {
    const existing = await CountryModel.findById(id);
    if (!existing) {
      return null;
    }

    const updated: Country = {
      ...existing,
      name: data.name,
      iso_code: data.iso_code
    };

    return CountryModel.update(id, updated);
  },

  async deleteCountry(id: string): Promise<boolean> {
    return CountryModel.delete(id);
  }
};
