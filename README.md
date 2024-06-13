# clique-assess


Youll need to run 3 apps for the assessment, 

In app folder. 
run npm install then npm run dev 

In react-firebase-chat folder
run npm install, also in the functions folder 
then run npm start 

In backend folder, 
pip install requirements
then run py grouping.py in terminal 

Group making based on interests is done through:
Embeddings generated for esch users interests with genai from google, 
Embeddings used in k means clustering to know which users have similar interestst, 

Clustering is done whenever new user is registered into firestore, 

limitation: every re run of clustering program may put users in a group they were not initially in, 

solution: consider incremental clustering and a max for each cluster, therfore only working with clusters that arent full 
