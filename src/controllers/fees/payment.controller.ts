import type { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createPayment = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { feeId, memberId, amount, method, status, reference } = req.body;

    const payment = await prisma.payment.create({
      data: {
        fee: { connect: { id: feeId } },
        member: { connect: { userId: memberId } },
        organization: { connect: { id: req.user.organizationId } },
        amount,
        method,
        status,
        reference,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment", details: error });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * pageSize;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { organizationId: req.user.organizationId },
        skip,
        take: pageSize,
        orderBy: { id: "desc" },
      }),
      prisma.payment.count({
        where: { organizationId: req.user.organizationId },
      }),
    ]);

    res.json({
      payments,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments", details: error });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;
    const { amount, method, status, reference } = req.body;

    const payment = await prisma.payment.update({
      where: {
        id: Number(id),
        organizationId: req.user.organizationId,
      },
      data: {
        amount,
        method,
        status,
        reference,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment updated successfully", payment });
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment", details: error });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;

    const payment = await prisma.payment.deleteMany({
      where: {
        id: Number(id),
        memberId: req.user.id,
      },
    });

    if (payment.count === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete payment", details: error });
  }
};
