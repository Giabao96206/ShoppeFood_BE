import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Chưa có token" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    req.user = decoded;
    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token hết hạn" });
    }
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};
