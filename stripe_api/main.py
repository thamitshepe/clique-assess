from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import stripe
import os

app = FastAPI()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class SubscriptionCheckRequest(BaseModel):
    sessionId: str  # You'd validate this against Clerk's API, possibly needing a custom request

# Define the whitelist of email addresses
WHITELIST = {
    "betvisionai@gmail.com",
    "securesolellc@gmail.com",
    "dedicated.professor65@gmail.com",
    "beach.austin15@gmail.com"
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
    # Assume you validate sessionId and find the user email or ID associated with it
    email = "user_email_from_clerk_session@domain.com"  # This needs actual implementation

    try:
        # Check if the email is in the whitelist
        if email in WHITELIST:
            return {"subscribed": True}  # User is in the whitelist, skip subscription check

        # Proceed with subscription check for non-whitelisted users
        customers = stripe.Customer.list(email=email).auto_paging_iter()
        for customer in customers:
            subscriptions = stripe.Subscription.list(customer=customer.id, status='active').auto_paging_iter()
            for subscription in subscriptions:
                if subscription and subscription.status == 'active':
                    return {"subscribed": True}
        return {"subscribed": False}
    except stripe.error.StripeError as e:
        print(e)
        raise HTTPException(status_code=400, detail="Stripe API error")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
