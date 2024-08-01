import { RequestHandler } from "express";
import stripePackage from "stripe";
import env from "../util/validateEnv";
import { debug, StripeProductMode } from "../util/sessions";


const stripe_key = env.STRIPE_SECRET_KEY;
const base_url = env.BASE_URL;
const stripe_end_point_secret =env.STRIPE_END_POINT_SECRET;


const stripe = new stripePackage(stripe_key,{
    apiVersion: '2024-04-10',
  });


export const makeSubscription: RequestHandler = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
          return res.status(400).json({ error: "Invalid number" });
        }
    
        const customer = await stripe.customers.create({
          metadata: {
            PhoneNumber: phoneNumber
          },
        });

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${base_url}/checkout-success`,
            cancel_url: `${base_url}`,
            payment_method_types: ["card"],
            mode:StripeProductMode.SUBSCRIPTION,
            line_items: [
                {
                    price:"price_1PEPnWF4bXuwvLKjfxkpq6UL",
                    quantity: 1,
                },
            ],
            customer: customer.id,
        });

        res.status(200).json(stripeSession);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error making subscription");
    }
}


export const checkStripeWebhook: RequestHandler = async (req, res)=> {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) return res.status(400).end();
   
    let event;

    try {
       
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            stripe_end_point_secret
        );
        
          
          switch (event.type) {
            case 'checkout.session.completed':
                if (debug) console.log("checkout.session.completed");
                break;
            default:
                console.log(event.type);
                break;
        }
        
        res.sendStatus(200).end();
    } catch (err) {
        console.error(err);
        return res.status(400).send('Webhook Error');
    }
};
     

