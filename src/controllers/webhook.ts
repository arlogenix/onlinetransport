import env from "../util/validateEnv";
import { RequestHandler } from "express";
import { messagesCheck, statusCheck } from "../util/messageValidation";
import {sendMarkAsRead, sendTextMessage } from "../util/apiHandler";


const verify_token=env.VERIFY_TOKEN;



//# This is Trigger, when you go to the the Project's BASE_URL 
export const checkWebhook:RequestHandler=async (req, res) => {
    res.status(200).send("Hello! This is a webhook setup!");
};

//# This is for verifying the Callback URL 
//# This will trigger, once you entered - Callback URL and verify_token
//# 1. BASE_URL + webhook = https://www.BASE_URL/webhook
//# 2. verify_token = apple
//# Check the Doc  - 
export const vertifyWebhook:RequestHandler=async (req, res) => {
    const mode=req.query["hub.mode"];
    const challange=req.query["hub.challenge"];
    const token=req.query["hub.verify_token"];


    if(mode && token){

        if(mode==="subscribe" && token===verify_token){
            res.status(200).send(challange);
        }else{
            res.status(403);
        }

    }
    console.log("hello this is webhook setup");
};


//# This is will trigger, whatevever the changes happens in the Chat
//# All the Bot related Business logic will come here!
export const listenWebhook:RequestHandler=async (req, res) => {
    console.log("# Listening Webhook event #");

    const body_param=req.body;
    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){

        //# message's value
        //# to get the Response value from Webhook
        if(messagesCheck(body_param)){
               console.log("# message event #")

               const phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               const phone_no = body_param.entry[0].changes[0].value.messages[0].from; 
               const message_id=body_param.entry[0].changes[0].value.messages[0].id;
              
               console.log("phone number "+phon_no_id);
               console.log("from "+phone_no);
               console.log("message id  "+message_id);


               //# your business logic starts
               //# find the existing session using current user's phoneNumber
             sendTextMessage(phone_no,"hi")
                //todo - your business logic
               //#your business logic ends


             // for marking read every messages we received
               sendMarkAsRead(message_id);  
        //# message's status
        //# SENT | DELIVERED | SEEN 
        }else if(statusCheck(body_param)){
              console.log("# message status event check #")
                    
        }

        res.sendStatus(200);
    }else{
        console.log("# not required webhook event! #")
        res.sendStatus(404);
    }
};