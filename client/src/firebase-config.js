import firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyBiX-7ggnun1Rtd-wQnZuOTgHECPEJKf5Y',
  authDomain: 'trial-fb.firebaseapp.com',
  databaseURL: 'https://trial-fb.firebaseio.com',
  projectId: 'trial-fb',
  storageBucket: '',
  messagingSenderId: '860654994970',
  appId: '1:860654994970:web:d5d00594ad788eb3'
};


export const app = firebase.initializeApp(config);
export const database = app.database();