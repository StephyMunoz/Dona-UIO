// Import the functions you need from the SDKs you need
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';
import Config from 'react-native-config';

const firebaseConfig = {
  apiKey: Config.REACT_APP_API_KEY,
  authDomain: Config.REACT_APP_AUTH_DOMAIN,
  databaseURL: Config.REACT_APP_DATABASE_URL,
  projectId: Config.REACT_APP_PROJECT_ID,
  storageBucket: Config.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: Config.REACT_APP_MESSAGING_SENDER_ID,
  appId: Config.REACT_APP_APP_ID,
  measurementId: Config.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); // if already initialized, use that one
}

// const app = firebase.initializeApp(firebaseConfig);

export const db = app.database();
export const auth = app.auth();
export const storage = app.storage();
