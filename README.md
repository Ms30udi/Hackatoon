## Database (Aiven)

Rah khdemt b MySQL database hosted f Aiven.
ghadi npartagi m3akom DB url 

**ila bghito t runniw l'Backend alwlidate** :
7eto database url f .env (DATABASE_URL=...)

cd backend 

python -m venv venv

venv\Scripts\activate  

pip install -r requirements.txt


**ila bghito t runniw l'Frontend alwlidate** :

cd frontend

npm install

npm run dev


mohim dik **venv** : bhala kandiro wahd lprojet virtuelle bach manb9awch nl9aw mochkil f les versions dial dependencies 
**dependencies** dial lbackend kaynin f requirements.txt
**frontend** rah bghina nkhedmo b react w tailwind css



**to push in github**
cd hackatoon
git add .
git commit -m "message"
git checkout -b dev 
git push origin dev
