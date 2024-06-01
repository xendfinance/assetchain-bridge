
rm -rf .firebase/ .firebaserc firebase.json
cp -r ./src/gotbit-tools/scripts/firebase-config/. .

mv .firebaserc .firebaserc.temp
envsubst < .firebaserc.temp > .firebaserc

yarn
yarn build
firebase deploy --token $FIREBASE_TOKEN
