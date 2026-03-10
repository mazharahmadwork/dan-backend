import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { OrganizationMemberService } from "./organization-member.service";

export const getOrganizationMembers = async (_req: Request, res: Response) => {
  try {
    const members = await OrganizationMemberService.getOrganizationMembers();
    res.json(members);
  } catch (error) {
    console.error("Error fetching organization members:", error);
    res.status(500).json({ message: "Failed to fetch organization members" });
  }
};

export const getOrganizationMemberById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as { id: string };
    const member = await OrganizationMemberService.getOrganizationMemberById(id);

    if (!member) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error("Error fetching organization member:", error);
    res.status(500).json({ message: "Failed to fetch organization member" });
  }
};

export const getMembersByOrganizationId = async (
  req: Request,
  res: Response
) => {
  try {
    const organization_id = req.query.organization_id as string;
    if (!organization_id) {
      return res
        .status(400)
        .json({ message: "organization_id query is required" });
    }
    const members =
      await OrganizationMemberService.getMembersByOrganizationId(organization_id);
    res.json(members);
  } catch (error) {
    console.error("Error fetching members by organization:", error);
    res.status(500).json({ message: "Failed to fetch organization members" });
  }
};

export const getMembersByUserId = async (req: Request, res: Response) => {
  try {
    const user_id = req.query.user_id as string;
    if (!user_id) {
      return res.status(400).json({ message: "user_id query is required" });
    }
    const members = await OrganizationMemberService.getMembersByUserId(user_id);
    res.json(members);
  } catch (error) {
    console.error("Error fetching members by user:", error);
    res.status(500).json({ message: "Failed to fetch organization members" });
  }
};

export const createOrganizationMember = async (
  req: Request,
  res: Response
) => {
  try {
    const { organization_id, user_id, role } = req.body;

    if (!organization_id || !user_id || !role) {
      return res.status(400).json({
        message: "organization_id, user_id and role are required"
      });
    }

    const member = await OrganizationMemberService.createOrganizationMember({
      organization_id,
      user_id,
      role
    });
    res.status(201).json(member);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_ORGANIZATION") {
        return res.status(400).json({
          message: "Invalid organization_id. Organization does not exist."
        });
      }
      if (error.message === "INVALID_USER") {
        return res.status(400).json({
          message: "Invalid user_id. User does not exist."
        });
      }
      if (error.message === "ALREADY_MEMBER") {
        return res.status(409).json({
          message: "User is already a member of this organization."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message: "Invalid organization_id or user_id. Organization or user does not exist."
      });
    }
    if (error instanceof DatabaseError && error.code === "23505") {
      return res.status(409).json({
        message: "User is already a member of this organization."
      });
    }
    if (error instanceof DatabaseError && error.code === "42P01") {
      return res.status(500).json({
        message:
          "Organization members table not found. Run the CREATE TABLE from queries.txt."
      });
    }
    console.error("Error creating organization member:", error);
    res.status(500).json({ message: "Failed to create organization member" });
  }
};

export const updateOrganizationMember = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as { id: string };
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "role is required" });
    }

    const updated = await OrganizationMemberService.updateOrganizationMember(
      id,
      { role }
    );

    if (!updated) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating organization member:", error);
    res.status(500).json({ message: "Failed to update organization member" });
  }
};

export const deleteOrganizationMember = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as { id: string };
    const deleted =
      await OrganizationMemberService.deleteOrganizationMember(id);

    if (!deleted) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting organization member:", error);
    res.status(500).json({ message: "Failed to delete organization member" });
  }
};
