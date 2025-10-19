import type { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { welcomeMember } from "../../services/authEmailService";

export const createPayment = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { feeId, amount, method, status, reference } = req.body;

    const { payment, fees, user } = await prisma.$transaction(async (tx) => {
      // Step 1: Fetch current fee
      const currentFee = await tx.fee.findUnique({
        where: { id: feeId },
        select: { balance: true, amount: true, memberId: true },
      });

      // Step 2 : Pay Fees
      const payment = await tx.payment.create({
        data: {
          fee: { connect: { id: feeId } },
          member: { connect: { userId: currentFee?.memberId } },
          organization: { connect: { id: req.user.organizationId } },
          amount,
          method,
          status,
          reference,
        },
      });

      // Step 3: Update Fee Balance
      const newBalance = (currentFee?.balance ?? 0) + amount;
      const totalAmount = currentFee?.amount ?? 0;
      const fees = await tx.fee.update({
        where: { id: feeId },
        data: {
          status: newBalance >= totalAmount ? "PAID" : "PARTIAL",
          balance: {
            increment: amount,
          },
        },
      });

      // Step 4 : Active the member if balance is full paid or more than 50% PAID
      const user = await tx.user.update({
        where: { id: currentFee?.memberId },
        data: { isActive: newBalance >= totalAmount / 2 },
      });

      return { payment, fees, user };
    });
    // Fetch organization details
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
    });
    const orgName = org?.name || "Your Organization";
    const orgAddress = org?.address || "Organization Address";
    // console.log(safeMember);
    // console.log({ name, email, password });
    const { name, email, password } = user || {};
    welcomeMember({
      name: name ?? "",
      email: email ?? "",
      orgName,
      orgAddress,
      password: password ?? "",
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
    res
      .status(201)
      .json({ message: "Payment Successful", payment, fees, user });
  } catch (error) {
    console.log(error);
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
