import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { userInfo } from "os";

export const createFee = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { memberId, type, description, amount, balance, status, dueDate } =
      req.body;

    const fee = await prisma.fee.create({
      data: {
        member: { connect: { userId: memberId } },
        organization: { connect: { id: req.user.organizationId } },
        type,
        description,
        amount,
        balance,
        status,
        dueDate: new Date(dueDate),
      },
    });

    res.status(201).json({ message: "Fee created successfully", fee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create fee", details: error });
  }
};

export const getFees = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * pageSize;

    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where: { organizationId: req.user.organizationId },
        skip,
        take: pageSize,
        orderBy: { id: "desc" },
        include: {
          member: { select: { user: { select: { email: true, name: true } } } },
        },
      }),
      prisma.fee.count({
        where: { organizationId: req.user.organizationId },
      }),
    ]);

    res.json({
      fees,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fees", details: error });
  }
};

export const updateFee = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;
    const { type, description, amount, balance, status, dueDate } = req.body;

    const fee = await prisma.fee.update({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
      data: {
        type,
        description,
        amount,
        balance,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    res.json(fee);
  } catch (error) {
    res.status(500).json({ error: "Failed to update fee", details: error });
  }
};

export const deleteFee = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;

    await prisma.fee.delete({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
    });

    res.json({ message: "Fee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete fee", details: error });
  }
};
