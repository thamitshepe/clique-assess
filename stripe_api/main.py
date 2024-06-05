from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import stripe
import os

app = FastAPI()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class SubscriptionCheckRequest(BaseModel):
    sessionId: str
    email: str  # Add email field

# Define the whitelist of email addresses
WHITELIST = {
    "betvisionai@gmail.com",
    "securesolellc@gmail.com",
    "beach.austin15@gmail.com",
    "josephbriant97@gmail.com",
    "tracehaggard@outlook.com",
    "perilousdreams@gmail.com",
    "rikikimaru@gmail.com",
    "sneakers0804@gmail.com",
    "rujunli0721@gmail.com",
    "antwaneg52@gmail.com",
    "gonmaca1@gmail.com",
    "milesdeals7@gmail.com"
}

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dashboard.betvisionai.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.post("/api/check-subscription")
async def check_subscription(request: SubscriptionCheckRequest):
    session_id = request.sessionId
    email = request.email.lower()  # Normalize email to lowercase

    try:
        # Check if the email is in the whitelist
        if email in {e.lower() for e in WHITELIST}:  # Normalize whitelist emails to lowercase
            return {"subscribed": True}  # User is in the whitelist, skip subscription check

        # Fetch all customers and filter by email case-insensitively
        customers = stripe.Customer.list().auto_paging_iter()
        for customer in customers:
            if customer.email and customer.email.lower() == email:
                subscriptions = stripe.Subscription.list(customer=customer.id).auto_paging_iter()
                for subscription in subscriptions:
                    if subscription and (subscription.status == 'active' or 'trial' or 'cancels' in subscription.status):
                        return {"subscribed": True}
        return {"subscribed": False}
    except stripe.error.StripeError as e:
        print(e)
        raise HTTPException(status_code=400, detail="Stripe API error")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    # Webhook endpoint for Stripe events
@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        if invoice['billing_reason'] == 'subscription_create' and invoice['amount_paid'] == 0:
            subscription_id = invoice['subscription']
            # Schedule the subscription for cancellation at the end of the trial
            stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)
            print(f"Subscription {subscription_id} set to cancel at period end.")

    return {"status": "success"}