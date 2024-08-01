import express from "express";
import * as StripeController from "../controllers/stripe";
import bodyParser from "body-parser";


const router=express.Router();

router.post("/webhook",bodyParser.raw({ type: "application/json" }),StripeController.checkStripeWebhook);
router.post("/subscription",StripeController.makeSubscription)


export default router;