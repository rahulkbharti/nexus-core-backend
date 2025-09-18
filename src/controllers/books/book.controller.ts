import type { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const CreateBook = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { ISBN, title, author, publisher, publicationDate, genre, synopsis } =
      req.body;
    const organizationId = req.user.organizationId;

    if (
      !ISBN ||
      !title ||
      !author ||
      !publisher ||
      !publicationDate ||
      !genre ||
      !organizationId
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Assuming you have a Book model (e.g., using Prisma)
    const newBook = await prisma.book.create({
      data: {
        ISBN,
        title,
        author,
        publisher,
        publicationDate: new Date(publicationDate),
        genre,
        synopsis,
        organization: { connect: { id: req.user.organizationId } },
      },
    });
    res
      .status(201)
      .json({ message: "Book created successfully", book: newBook });
  } catch (error: unknown) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetBooks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { page = "1", limit = "10" } = req.query;
    const organizationId = req.user.organizationId;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { organizationId },
        skip,
        take: limitNum,
        orderBy: { id: "desc" },
        include: { copies: true },
      }),
      prisma.book.count({ where: { organizationId } }),
    ]);

    res.json({
      books,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: unknown) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UpdateBook = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const { ISBN, title, author, publisher, publicationDate, genre, synopsis } =
      req.body;

    const book = await prisma.book.findUnique({
      where: { id: Number(id), organizationId },
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const updatedBook = await prisma.book.update({
      where: { id: Number(id) },
      data: {
        ISBN,
        title,
        author,
        publisher,
        publicationDate: publicationDate
          ? new Date(publicationDate)
          : undefined,
        genre,
        synopsis,
      },
    });

    res.json({ message: "Book updated successfully", book: updatedBook });
  } catch (error: unknown) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteBook = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const book = await prisma.book.findUnique({
      where: { id: Number(id), organizationId },
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await prisma.book.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Book deleted successfully" });
  } catch (error: unknown) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
