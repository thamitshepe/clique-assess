from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
from sklearn.cluster import KMeans
import google.generativeai as genai
import asyncio


app = Flask(__name__)
CORS(app)

# Initialize Firestore with credentials
cred = credentials.Certificate("service_key.json")
initialize_app(cred)
db = firestore.client()

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
            # Fetch the current user data for comparison
            user_doc = user_ref.get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                current_interests = user_data.get('interests', [])

                if interests:
                    # Clean up interests lists by stripping extra spaces and quotes
                    deleted_interests = [interest.strip().strip("'") for interest in interests.get('delete', [])]
                    added_interests = [interest.strip().strip("'") for interest in interests.get('add', [])]

                    # Log current interests and the interests to be removed
                    print(f"Current interests: {current_interests}")
                    print(f"Interests to delete: {deleted_interests}")

                    # Ensure exact matches for deletion
                    exact_deleted_interests = [interest for interest in deleted_interests if interest in current_interests]

                    if exact_deleted_interests:
                        user_ref.update({'interests': firestore.ArrayRemove(exact_deleted_interests)})

                    if added_interests:
                        user_ref.update({'interests': firestore.ArrayUnion(added_interests)})

            if new_name:
                user_ref.update({'name': new_name})

            return jsonify({'message': 'User data updated successfully'}), 200
        else:
            return jsonify({'error': 'Invalid action parameter. Use "update".'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users_ref = db.collection('users')
        users = []

        # Fetch user data from Firestore
        user_docs = users_ref.stream()

        # Process user documents
        for doc in user_docs:
            user_data = doc.to_dict()
            user = {
                'userId': doc.id,  # Add userId field using document ID
                'name': user_data.get('name', 'Unknown'),
                'interests': user_data.get('interests', [])  # Handle missing 'interests' field gracefully
            }
            users.append(user)

        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/groups', methods=['GET'])
def get_groups():
    try:
        groups_ref = db.collection('groups')
        users_ref = db.collection('users')
        groups = []
        user_ids = set()

        # Fetch group data from Firestore
        for doc in groups_ref.stream():
            group_data = doc.to_dict()
            group = {
                'groupId': doc.id,  # Add groupId field using document ID
                'name': group_data['name'],
                'users': group_data.get('users', [])  # Initialize with user IDs
            }
            groups.append(group)
            user_ids.update(group['users'])

        # Fetch all user details in one batch
        user_docs = users_ref.where('userId', 'in', list(user_ids)).stream()
        users = {doc.id: doc.to_dict() for doc in user_docs}

        # Replace user IDs with user details
        for group in groups:
            group['users'] = [
                {
                    'userId': user_id,
                    'name': users.get(user_id, {}).get('name', 'Unknown')
                }
                for user_id in group['users']
            ]

        return jsonify(groups), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def update_group_data():
    try:
        data = request.json  # Payload containing groupId, action, users, and name
        group_id_list = data.get('groupId')
        action = data.get('action')
        users = data.get('users', {})
        new_name = data.get('name')

        # Ensure groupId is extracted correctly from the list
        if not isinstance(group_id_list, list) or len(group_id_list) != 1:
            return jsonify({'error': 'groupId should be a list containing exactly one ID'}), 400
        group_id = group_id_list[0]

        group_ref = db.collection('groups').document(group_id)

        if action == 'update':
            if users:
                deleted_users = users.get('delete', [])
                added_users = users.get('add', [])

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

@app.route('/delete_document', methods=['DELETE'])
def delete_document():
    try:
        document_type = request.args.get('type')  # 'group' or 'user'
        document_id = request.args.get('documentId')  # groupId or userId

        if document_type == 'group':
            # Delete group document
            db.collection('groups').document(document_id).delete()
            return jsonify({'message': f'Group document {document_id} deleted successfully.'}), 200
        elif document_type == 'user':
            # Delete user document
            db.collection('users').document(document_id).delete()
            return jsonify({'message': f'User document {document_id} deleted successfully.'}), 200
        else:
            return jsonify({'error': 'Invalid document type specified.'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/re-cluster', methods=['GET'])
async def re_cluster():
    try:
        await run_clustering_for_new_user()
        return jsonify({'message': 'Clustering performed successfully'}), 200
    except Exception as e:
        # Log the error with a detailed message
        app.logger.error('Error during clustering: %s', str(e))
        return jsonify({'error': str(e)}), 500

def fetch_user_data_from_firestore():
    try:
        users_ref = db.collection('users')
        user_data = []
        for doc in users_ref.stream():
            user_data.append(doc.to_dict())
        return user_data
    except Exception as e:
        app.logger.error('Error fetching user data from Firestore: %s', str(e))
        raise

def preprocess_interests_and_generate_embeddings(user_data):
    embeddings = []
    try:
        for user in user_data:
            user_id = user['userId']
            user_name = user['name']
            interests = user['interests']
            interests_str = ','.join(interests)
            response = genai.embed_content(model="models/embedding-001", content=interests_str, task_type="clustering")
            embedding = response["embedding"]
            embeddings.append((user_id, user_name, embedding))
        return embeddings
    except Exception as e:
        app.logger.error('Error during embedding generation: %s', str(e))
        raise

def perform_clustering(embeddings):
    try:
        embeddings_array = [emb[2] for emb in embeddings]
        num_clusters = len(embeddings) // 10 + 1
        kmeans = KMeans(n_clusters=num_clusters, random_state=10)
        kmeans.fit(embeddings_array)
        clusters = kmeans.labels_
        return clusters
    except Exception as e:
        app.logger.error('Error during clustering: %s', str(e))
        raise

def assign_group_id_and_create_groups(user_data, clusters):
    groups_ref = db.collection('groups')
    user_groups = {f"groupId{cluster_num}": [] for cluster_num in range(len(set(clusters)))}
    try:
        for i, user in enumerate(user_data):
            group_id = f"groupId{clusters[i]}"
            user_ref = db.collection('users').document(user['userId'])
            user_ref.update({'groupId': group_id})
            user_groups[group_id].append(user['userId'])
        for cluster_num in range(len(set(clusters))):
            group_id = f"groupId{cluster_num}"
            group_data = {
                'createdAt': firestore.SERVER_TIMESTAMP,
                'groupId': group_id,
                'name': f'Group {cluster_num}',
                'users': user_groups[group_id]
            }
            groups_ref.document(group_id).set(group_data)
    except Exception as e:
        app.logger.error('Error during group creation: %s', str(e))
        raise

async def run_clustering_for_new_user():
    try:
        user_data = fetch_user_data_from_firestore()
        embeddings = preprocess_interests_and_generate_embeddings(user_data)
        clusters = perform_clustering(embeddings)
        assign_group_id_and_create_groups(user_data, clusters)
        app.logger.info('Clustering completed and group documents created in Firestore.')
    except Exception as e:
        app.logger.error('Error in clustering process: %s', str(e))
        raise

if __name__ == '__main__':
    app.run(debug=True)

