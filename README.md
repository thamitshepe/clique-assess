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

For clustering testing purposes I signed in with 2 different google accounts, 
I has interest tech and music
The other has just tech
They got assigned the same group as shown below

![image](https://github.com/thamitshepe/clique-assess/assets/60922877/170a1d6b-6af1-49e5-813f-a57a7bc3604a)

![image](https://github.com/thamitshepe/clique-assess/assets/60922877/6f6ff158-5199-43de-9adb-1baadb015b81)

