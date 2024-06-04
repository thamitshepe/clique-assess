from fastapi import FastAPI, HTTPException
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
    "thamitshepe@icloud.com",
    "josephbriant97@gmail.com",
    "tracehaggard@outlook.com",
    "perilousdreams@gmail.com",
    "rikikimaru@gmail.com",
    "sneakers0804@gmail.com",
    "rujunli0721@gmail.com",
    "antwaneg52@gmail.com",
    "gonmaca1@gmail.com"
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
                    if subscription and (subscription.status == 'active' or 'trial' in subscription.status):
                        return {"subscribed": True}
        return {"subscribed": False}
    except stripe.error.StripeError as e:
        print(e)
        raise HTTPException(status_code=400, detail="Stripe API error")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")