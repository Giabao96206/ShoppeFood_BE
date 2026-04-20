import { Request, Response, NextFunction } from "express";
export const ValiDateReSendCode = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  }
  next();
};
