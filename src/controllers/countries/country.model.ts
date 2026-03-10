import { Country } from "./country.types";
import pool from "../../db";

export const CountryModel = {
  async findAll(): Promise<Country[]> {
    const { rows } = await pool.query<Country>(
      "SELECT id, name, iso_code FROM countries ORDER BY name"
    );
    return rows;
  },

  async findById(id: string): Promise<Country | null> {
    const { rows } = await pool.query<Country>(
      "SELECT id, name, iso_code FROM countries WHERE id = $1",
      [id]
    );
    return rows[0] ?? null;
  },

  async create(country: Country): Promise<Country> {
    const { rows } = await pool.query<Country>(
      "INSERT INTO countries (id, name, iso_code) VALUES ($1, $2, $3) RETURNING id, name, iso_code",
      [country.id, country.name, country.iso_code]
    );
    return rows[0];
  },

  async update(id: string, country: Country): Promise<Country | null> {
    const { rows } = await pool.query<Country>(
      "UPDATE countries SET name = $2, iso_code = $3 WHERE id = $1 RETURNING id, name, iso_code",
      [id, country.name, country.iso_code]
    );
    return rows[0] ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      "DELETE FROM countries WHERE id = $1",
      [id]
    );
    return rowCount === 1;
  }
};
