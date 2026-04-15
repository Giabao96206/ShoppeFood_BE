import { Express } from "express";
import signUpRouter from "./signup.routers";
import activateAccount from "./activate.routers";
import LoginUser from "./login.routers";
import getAllUser from "./GetUser.routers";
import { uploadCloud } from "../config/cloudinary";

const route = (app: Express) => {
  app.use("/register", signUpRouter);
  app.use("/activateAccount", activateAccount);
  app.use("/getAllUser", getAllUser);
  app.use("/login", LoginUser);
};

export default route;
