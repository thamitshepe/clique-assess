import csv
import random
import os
from firebase_admin import credentials, firestore, initialize_app

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Path to the CSV file
csv_file_path = os.path.join(current_dir, "SocialMediaUsersDataset.csv")

# Path to the service account key JSON file
service_account_key_path = os.path.join(current_dir, "service_key.json")

# Initialize Firestore with credentials
cred = credentials.Certificate(service_account_key_path)
initialize_app(cred)
db = firestore.client()

# Function to add users to Firestore
def add_users_from_csv(csv_file, num_users):
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        users = list(reader)

        # Shuffle the users and select the first num_users
        random.shuffle(users)
        selected_users = users[:num_users]

        # Add each selected user to Firestore
        for user in selected_users:
            user_id = user['UserID']

            # Check if the user already exists in Firestore
            existing_user = db.collection('users').document(user_id).get()
            if existing_user.exists:
                print(f"User {user_id} already exists in Firestore. Skipping...")
                continue  # Skip adding this user

            # If the user does not exist, add them to Firestore
            name = user['Name']
            interests_str = user['Interests']
            
            # Parse interests as a list
            interests = interests_str.split(',') if interests_str else []

            # Add user document to Firestore with interests as an array
            user_doc_ref = db.collection('users').document(user_id)
            user_doc_ref.set({
                'userId': user_id,
                'name': name,
                'interests': interests
            })
            print(f"Added user {name} to Firestore.")


# Number of random users to select
num_random_users = 5

# Add users to Firestore
add_users_from_csv(csv_file_path, num_random_users)
