import { Express } from "express";
import signUpRouter from "./signup.routers";
import activateAccount from "./activate.routers";
import LoginUser from "./login.routers";
import getAllUser from "./GetUser.routers";
import ReSend from "./ReSendCode.routers";
import Check from "./acount.login.routers";
import uploadrouter from "./upload.image.routers";
import TopRate from "./RatingRes.routers";

import { uploadCloud } from "../config/cloudinary";

const route = (app: Express) => {
  app.use("/register", signUpRouter);
  app.use("/activateAccount", activateAccount);
  app.use("/getAllUser", getAllUser);
  app.use("/login", LoginUser);
  app.use("/ReSendCode", ReSend);
  app.use("/account", Check);
  app.use("/api/upload", uploadrouter);
  app.use("/topRating", TopRate);
};

export default route;
