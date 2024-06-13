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

# Configure API key (assuming it's stored in an environment variable)
genai.configure(api_key='AIzaSyAzfWkrMY6lXep8aCbiJanV1qxlKZ0Kor8')

@app.route('/update_user_data', methods=['PUT'])
def update_user_data():
    try:
        data = request.json  # Payload containing userId, action, interests, and name
        user_id_list = data.get('userId')
        action = data.get('action')
        interests = data.get('interests', {})
        new_name = data.get('name')

        # Ensure user_id is extracted correctly from the list
        if not isinstance(user_id_list, list) or len(user_id_list) != 1:
            return jsonify({'error': 'userId should be a list containing exactly one ID'}), 400
        user_id = user_id_list[0]

        user_ref = db.collection('users').document(user_id)

        if action == 'update':
            if interests:
                # Clean up interests lists by stripping extra spaces and quotes
                deleted_interests = [interest.strip().strip("'") for interest in interests.get('delete', [])]
                added_interests = [interest.strip().strip("'") for interest in interests.get('add', [])]

                if deleted_interests:
                    user_ref.update({'interests': firestore.ArrayRemove(deleted_interests)})
                if added_interests:
                    user_ref.update({'interests': firestore.ArrayUnion(added_interests)})

            if new_name:
                user_ref.update({'name': new_name})

            return jsonify({'message': 'User data updated successfully'}), 200
        else:
            return jsonify({'error': 'Invalid action parameter. Use "update".'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/groups', methods=['GET'])
def get_groups():
    try:
        groups_ref = db.collection('groups')
        groups = []

        # Fetch group data from Firestore
        for doc in groups_ref.stream():
            group_data = doc.to_dict()
            group = {
                'groupId': doc.id,  # Add groupId field using document ID
                'name': group_data['name'],
                'users': group_data.get('users', [])  # Assume 'users' is an array field
            }
            groups.append(group)

        return jsonify(groups), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_group_data', methods=['PUT'])
def update_group_data():
    try:
        data = request.json  # Payload containing groupId, action, users, and name
        group_id_list = data.get('groupId')
        action = data.get('action')
        users = data.get('users', [])
        new_name = data.get('name')

        # Ensure group_id is extracted correctly from the list
        if not isinstance(group_id_list, list) or len(group_id_list) != 1:
            return jsonify({'error': 'groupId should be a list containing exactly one ID'}), 400
        group_id = group_id_list[0]

        group_ref = db.collection('groups').document(group_id)

        if action == 'update':
            if users:
                # Clean up users list (assuming users are stored as an array of user IDs)
                deleted_users = [user.strip() for user in users.get('delete', [])]
                added_users = [user.strip() for user in users.get('add', [])]

                if deleted_users:
                    group_ref.update({'users': firestore.ArrayRemove(deleted_users)})
                if added_users:
                    group_ref.update({'users': firestore.ArrayUnion(added_users)})

            if new_name:
                group_ref.update({'name': new_name})

            return jsonify({'message': 'Group data updated successfully'}), 200
        else:
            return jsonify({'error': 'Invalid action parameter. Use "update".'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route for triggering clustering process with GET request
@app.route('/re-cluster', methods=['GET'])
def re_cluster():
    try:
        run_clustering_for_new_user()
        return jsonify({'message': 'Clustering performed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

