import { JwtPayload } from "jsonwebtoken";
import multer from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userID: string;
      };

      file?: Express.Multer.File;
    }
  }
}

export {};