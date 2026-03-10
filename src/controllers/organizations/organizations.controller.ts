import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { OrganizationService } from "./organizations.service";

export const getOrganizations = async (_req: Request, res: Response) => {
  try {
    const organizations = await OrganizationService.getOrganizations();
    res.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const organization = await OrganizationService.getOrganizationById(id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: "Failed to fetch organization" });
  }
};

export const getOrganizationByIdWithMembers = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as { id: string };
    const organization =
      await OrganizationService.getOrganizationByIdWithMembers(id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Error fetching organization with members:", error);
    res.status(500).json({
      message: "Failed to fetch organization with members"
    });
  }
};

export const getOrganizationsByOwnerId = async (req: Request, res: Response) => {
  try {
    const owner_id = req.query.owner_id as string;
    if (!owner_id) {
      return res.status(400).json({ message: "owner_id query is required" });
    }
    const organizations = await OrganizationService.getOrganizationsByOwnerId(owner_id);
    res.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations by owner:", error);
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
};

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, owner_id, is_active } = req.body;

    if (!name || !owner_id) {
      return res.status(400).json({
        message: "name and owner_id are required"
      });
    }

    const organization = await OrganizationService.createOrganization({
      name,
      owner_id,
      is_active
    });
    res.status(201).json(organization);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_OWNER") {
        return res.status(400).json({
          message: "Invalid owner_id. User does not exist."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message: "Invalid owner_id. User does not exist."
      });
    }
    if (error instanceof DatabaseError && error.code === "42P01") {
      return res.status(500).json({
        message: "Organizations table not found. Run the CREATE TABLE from queries.txt."
      });
    }
    console.error("Error creating organization:", error);
    res.status(500).json({ message: "Failed to create organization" });
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, owner_id, is_active } = req.body;

    const updated = await OrganizationService.updateOrganization(id, {
      name,
      owner_id,
      is_active
    });

    if (!updated) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_OWNER") {
        return res.status(400).json({
          message: "Invalid owner_id. User does not exist."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message: "Invalid owner_id. User does not exist."
      });
    }
    console.error("Error updating organization:", error);
    res.status(500).json({ message: "Failed to update organization" });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await OrganizationService.deleteOrganization(id);

    if (!deleted) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ message: "Failed to delete organization" });
  }
};
