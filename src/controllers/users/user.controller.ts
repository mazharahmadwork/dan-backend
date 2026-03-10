import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { UserService } from "./user.service";
import { User, UserResponse } from "./user.types";

function toResponse(user: User): UserResponse {
  const { password_hash: _, ...rest } = user;
  return rest as UserResponse;
}

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserService.getUsers();
    res.json(users.map(toResponse));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(toResponse(user));
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      full_name,
      date_of_birth,
      country_id,
      verification_status
    } = req.body;

    if (!email || !password || !full_name || !date_of_birth || !country_id) {
      return res.status(400).json({
        message:
          "email, password, full_name, date_of_birth and country_id are required"
      });
    }

    const user = await UserService.createUser({
      email,
      password,
      full_name,
      date_of_birth,
      country_id,
      verification_status
    });
    res.status(201).json(toResponse(user));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "EMAIL_IN_USE") {
        return res.status(409).json({ message: "Email already in use" });
      }
      if (error.message === "INVALID_COUNTRY") {
        return res
          .status(400)
          .json({ message: "Invalid country_id. Country does not exist." });
      }
    }
    if (error instanceof DatabaseError) {
      if (error.code === "23503") {
        return res
          .status(400)
          .json({ message: "Invalid country_id. Country does not exist." });
      }
      if (error.code === "42P01") {
        return res.status(500).json({
          message:
            "Users table not found. Run the CREATE TABLE users from queries.txt."
        });
      }
    }
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Failed to create user",
      ...(error instanceof Error && { error: error.message })
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const {
      email,
      password,
      full_name,
      date_of_birth,
      country_id,
      verification_status
    } = req.body;

    const updated = await UserService.updateUser(id, {
      email,
      password,
      full_name,
      date_of_birth,
      country_id,
      verification_status
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(toResponse(updated));
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
