from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
from sklearn.cluster import KMeans
import google.generativeai as genai
import random
import string


app = Flask(__name__)
CORS(app)

# Initialize Firestore with credentials
cred = credentials.Certificate("service_key.json")
initialize_app(cred)
db = firestore.client()

# Configure API key (assuming it's stored in an environment variable)
genai.configure(api_key='AIzaSyAzfWkrMY6lXep8aCbiJanV1qxlKZ0Kor8')

@app.route('/delete_groups', methods=['DELETE'])
def delete_groups():
    try:
        group_ids = request.args.getlist('groupId')
        for group_id in group_ids:
            db.collection('groups').document(group_id).delete()
        return jsonify({'message': 'Groups deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_users', methods=['DELETE'])
def delete_users():
    try:
        user_ids = request.args.getlist('userId')
        for user_id in user_ids:
            db.collection('users').document(user_id).delete()
        return jsonify({'message': 'Users deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_users', methods=['PUT'])
def update_users():
    try:
        group_id = request.args.get('groupId')
        user_ids = request.args.getlist('userId')
        action = request.args.get('action')  # Action can be 'add' or 'delete'

        if action == 'delete':
            # Delete users from the group
            for user_id in user_ids:
                user_ref = db.collection('users').document(user_id)
                user_ref.update({'groupId': firestore.DELETE_FIELD})
            return jsonify({'message': 'Users deleted successfully'}), 200
        elif action == 'add':
            # Add users to the group
            for user_id in user_ids:
                user_ref = db.collection('users').document(user_id)
                user = user_ref.get().to_dict()
                if user and 'groupId' not in user:
                    user_ref.update({'groupId': group_id})
            return jsonify({'message': 'Users added successfully'}), 200
        else:
            return jsonify({'error': 'Invalid action parameter. Use "add" or "delete".'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_user_data', methods=['PUT'])
def update_user_data():
    try:
        data = request.json  # Payload containing userId, action, interests, and name
        user_id = data.get('userId')
        action = data.get('action')
        interests = data.get('interests')
        new_name = data.get('name')

        user_ref = db.collection('users').document(user_id)

        if action == 'update':
            if interests:
                # Delete interests from the user's interests field
                deleted_interests = interests.get('delete', [])
                user_ref.update({'interests': firestore.ArrayRemove(deleted_interests)})
                # Add interests to the user's interests field
                added_interests = interests.get('add', [])
                user_ref.update({'interests': firestore.ArrayUnion(added_interests)})
            if new_name:
                # Update user name
                user_ref.update({'name': new_name})
            return jsonify({'message': 'User data updated successfully'}), 200
        else:
            return jsonify({'error': 'Invalid action parameter. Use "update".'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_group_name', methods=['PUT'])
def update_group_name():
    try:
        group_id = request.args.get('groupId')
        new_name = request.json.get('name')
        db.collection('groups').document(group_id).update({'name': new_name})
        return jsonify({'message': 'Group name updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users_ref = db.collection('users')
        users = []

        # Fetch user data from Firestore
        for doc in users_ref.stream():
            user_data = doc.to_dict()
            user = {
                'userId': doc.id,  # Add userId field using document ID
                'name': user_data['name'],
                'interests': user_data['interests']
            }
            users.append(user)

        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        name = request.json.get('name')
        user_id = generate_random_user_id()
        
        # Check if the generated user ID already exists
        while db.collection('users').document(user_id).get().exists:
            user_id = generate_random_user_id()

        user_data = {
            'userId': user_id,
            'name': name
        }
        db.collection('users').document(user_id).set(user_data)
        return jsonify({'message': 'User added successfully', 'userId': user_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_random_user_id():
    while True:
        user_id = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        if not db.collection('users').document(user_id).get().exists:
            return user_id

def fetch_user_data_from_firestore():
    users_ref = db.collection('users')
    user_data = []

    # Fetch user data from Firestore
    for doc in users_ref.stream():
        user_data.append(doc.to_dict())

    return user_data

def preprocess_interests_and_generate_embeddings(user_data):
    embeddings = []

    for user in user_data:
        user_id = user['userId']
        user_name = user['name']
        interests = user['interests']

        # Format interests as a comma-separated string
        interests_str = ','.join(interests)

        # Generate embeddings for user's interests using Gemini API
        response = genai.embed_content(model="models/embedding-001", content=interests_str, task_type="clustering")
        embedding = response["embedding"]

        embeddings.append((user_id, user_name, embedding))

    return embeddings

def perform_clustering(embeddings):
    # Extract embeddings
    embeddings_array = [emb[2] for emb in embeddings]

    # Determine the number of clusters
    num_clusters = len(embeddings) // 10 + 1

    # Perform KMeans clustering
    kmeans = KMeans(n_clusters=num_clusters, random_state=10)
    kmeans.fit(embeddings_array)
    clusters = kmeans.labels_

    return clusters

def assign_group_id_and_create_groups(user_data, clusters):
    groups_ref = db.collection('groups')

    # Create a dictionary to map users to their respective groups
    user_groups = {f"groupId{cluster_num}": [] for cluster_num in range(len(set(clusters)))}

    # Assign group ID to users and update user documents with group ID
    for i, user in enumerate(user_data):
        group_id = f"groupId{clusters[i]}"
        user_ref = db.collection('users').document(user['userId'])
        
        # Update user document with group ID, completely overwrite existing data
        user_ref.update({'groupId': group_id})
        
        # Add user to user_groups dictionary
        user_groups[group_id].append(user['userId'])

    # Create a group document for each cluster
    for cluster_num in range(len(set(clusters))):
        # Assign group ID
        group_id = f"groupId{cluster_num}"

        # Create group document
        group_data = {
            'createdAt': firestore.SERVER_TIMESTAMP,
            'groupId': group_id,
            'name': f'Group {cluster_num}',
            'users': user_groups[group_id]  # Add users array to group document
        }

        # Add group document to Firestore, completely overwrite existing document
        groups_ref.document(group_id).set(group_data)

def run_clustering_for_new_user():
    user_data = fetch_user_data_from_firestore()
    embeddings = preprocess_interests_and_generate_embeddings(user_data)
    clusters = perform_clustering(embeddings)
    assign_group_id_and_create_groups(user_data, clusters)
    print("Clustering completed and group documents created in Firestore.")

if __name__ == '__main__':
    app.run(debug=True)

