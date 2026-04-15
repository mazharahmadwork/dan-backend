import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { User, CreateUserDTO, UpdateUserDTO } from "./user.types";
import { UserModel } from "./user.model";
import { CountryModel } from "../countries/country.model";

const SALT_ROUNDS = 10;

export const UserService = {
  async getUsers(): Promise<User[]> {
    return UserModel.findAll();
  },

  async getUserById(id: string): Promise<User | null> {
    return UserModel.findById(id);
  },

  async createUser(data: CreateUserDTO): Promise<User> {
    const country = await CountryModel.findById(data.country_id);
    if (!country) {
      throw new Error("INVALID_COUNTRY");
    }

    const existing = await UserModel.findByEmail(data.email);
    if (existing) {
      throw new Error("EMAIL_IN_USE");
    }

    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const now = new Date().toISOString();

    const user: User = {
      id: randomUUID(),
      email: data.email,
      password_hash,
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      age: data.age ?? null,
      country_id: data.country_id,
      verification_status: data.verification_status ?? "unverified",
      created_at: now,
      updated_at: now
    };

    return UserModel.create(user);
  },

  async updateUser(id: string, data: UpdateUserDTO): Promise<User | null> {
    const existing = await UserModel.findById(id);
    if (!existing) {
      return null;
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await UserModel.findByEmail(data.email);
      if (emailTaken) {
        throw new Error("EMAIL_IN_USE");
      }
    }

    const updated: User = {
      ...existing,
      email: data.email ?? existing.email,
      password_hash: data.password
        ? await bcrypt.hash(data.password, SALT_ROUNDS)
        : existing.password_hash,
      full_name: data.full_name ?? existing.full_name,
      date_of_birth: data.date_of_birth ?? existing.date_of_birth,
      age: data.age ?? existing.age,
      country_id: data.country_id ?? existing.country_id,
      verification_status:
        data.verification_status ?? existing.verification_status,
      updated_at: new Date().toISOString()
    };

    return UserModel.update(id, updated);
  },

  async deleteUser(id: string): Promise<boolean> {
    return UserModel.delete(id);
  }
};
