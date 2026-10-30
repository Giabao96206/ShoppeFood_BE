import { Express } from "express";
import express from "express";
import signUpRouter from "./signup.routers";
import activateAccount from "./activate.routers";
import LoginUser from "./login.routers";
import getConversation from "./GetUser.routers";
import ReSend from "./ReSendCode.routers";
import Check from "./acount.login.routers";
import uploadrouter from "./upload.image.routers";
import TopRate from "./RatingRes.routers";
import Menu from "./GetMenu.routers";
import createOder from "./order.routers";
import getOrder from "./getOrder.router";
import AuthEdit from "./edit.routers";
import Cancel from "./order.cacel.routers"
import getAI from  "./AI.api.roters"
import {router as getAllMessage, routerGetMM as getMoreMessage, routerPushtoken as RouterPT, routerEditMM as EditMM } from "./Messages.router"
import { authMiddleware } from "../middleware/auth/auth.middleware";

const route = (app: Express) => {
  // Public routes
  app.use("/register", signUpRouter);
  app.use("/activateAccount", activateAccount);
  app.use("/login", LoginUser);
  app.use("/ReSendCode", ReSend);
  app.use("/topRating", TopRate);
  app.use("/menu", Menu);

  // Protected routes
  const protectedRouter = express.Router();
  protectedRouter.use(authMiddleware);

  protectedRouter.use("/getAllUser", getConversation);
  protectedRouter.use("/account", Check);
  protectedRouter.use("/api/upload", uploadrouter);
  protectedRouter.use("/api/order", createOder);
  protectedRouter.use("/api/getOrder", getOrder);
  protectedRouter.use("/editUser", AuthEdit);
  protectedRouter.use("/cancelOrder", Cancel);
  protectedRouter.use("/getAI", getAI);
  protectedRouter.use("/getAllMessage", getAllMessage);
  protectedRouter.use("/getMoreMessage", getMoreMessage);
  protectedRouter.use("/api/users/push-token", RouterPT);
  protectedRouter.use("/editMM", EditMM);

  app.use("/", protectedRouter);
};

export default route;
