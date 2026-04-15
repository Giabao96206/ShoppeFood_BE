import { Request, Response, NextFunction } from "express";
export const ValiDateCode = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Missing email or code" });
  }
  next();
};
