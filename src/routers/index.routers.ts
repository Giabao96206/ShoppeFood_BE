import { Express } from "express";
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
import {router as getAI, routerFoodAI as getAIFood} from  "./AI.api.roters"
import {router as getAllMessage, routerGetMM as getMoreMessage, routerPushtoken as RouterPT, routerEditMM as EditMM } from "./Messages.router"
const route = (app: Express) => {
  app.use("/register", signUpRouter);
  app.use("/activateAccount", activateAccount);
  app.use("/getAllUser", getConversation);
  app.use("/login", LoginUser);
  app.use("/ReSendCode", ReSend);
  app.use("/account", Check);
  app.use("/api/upload", uploadrouter);
  app.use("/topRating", TopRate);
  app.use("/menu", Menu);
  app.use("/api/order", createOder);
  app.use("/api/getOrder", getOrder);
  app.use("/editUser", AuthEdit);
  app.use("/cancelOrder", Cancel);
  app.use("/getAI", getAI);
  app.use("/getFoodAI", getAIFood)
  app.use("/getAllMessage", getAllMessage);
  app.use("/getMoreMessage", getMoreMessage);
  app.use("/api/users/push-token", RouterPT);
  app.use("/editMM", EditMM);

};

export default route;
