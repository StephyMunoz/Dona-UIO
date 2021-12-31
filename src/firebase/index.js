// Import the functions you need from the SDKs you need
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCRJIL8hg7y-evgmHQ_G51-QfuSUAJcQ1M',
  authDomain: 'dona-uio.firebaseapp.com',
  databaseURL: 'https://dona-uio-default-rtdb.firebaseio.com',
  projectId: 'dona-uio',
  storageBucket: 'dona-uio.appspot.com',
  messagingSenderId: '83275633302',
  appId: '1:83275633302:web:a35e503bc04edc3c82e8b7',
  measurementId: 'G-60NG7DYDKN',
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); // if already initialized, use that one
}

export const db = app.database();
export const auth = app.auth();
export const storage = app.storage();
