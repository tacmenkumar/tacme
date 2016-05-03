echo $1

echo "Adding the files"
git add .
echo "Git Status"
git status
echo "Committing the app"
git commit -am "$1"
echo "Pushing app to github"
git push 
echo "Publishing app to Heroku"
git push heroku master

