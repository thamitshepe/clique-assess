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

class ManageSubscriptionRequest(BaseModel):
    customerId: str

# Define the whitelist of email addresses
WHITELIST = {
    "betvisionai@gmail.com",
    "securesolellc@gmail.com",
    "beach.austin15@gmail.com",
    "thamitshepe@icloud.com",
    "josephbriant97@gmail.com",
    "tracehaggard@outlook.com",
    "perilousdreams@gmail.com",
    "rikikimaru@gmail.com"
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


@app.post("/api/manage-subscription")
async def manage_subscription(request: ManageSubscriptionRequest):
    customer_id = request.customerId

    try:
        # Generate the login link for the customer
        login_link = stripe.Customer.create_login_link(customer_id)
        return {"url": login_link.url}
    except stripe.error.StripeError as e:
        print(e)
        raise HTTPException(status_code=400, detail="Stripe API error")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
