import {initializeApp} from 'firebase/app';
import {getDatabase} from 'firebase/database';
import {getStorage} from 'firebase/storage';
import {getFirestore} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBn3kjPcBvXcEu85ydU2FSRSnBf3qIZCQA',
  authDomain: 'universityrouter.firebaseapp.com',
  projectId: 'universityrouter',
  storageBucket: 'universityrouter.appspot.com',
  messagingSenderId: '1085912574512',
  appId: '1:1085912574512:web:ec12e2279e8b7f505b5bf5',
  measurementId: 'G-LWWQ6NYSHF',
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {app, auth, database, storage, db};
