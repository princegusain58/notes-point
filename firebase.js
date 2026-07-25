import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
 
const firebaseConfig = {
  apiKey: "AIzaSyB8Q233ol5opi0Io8tEp498yDEmMesjmgE",
  authDomain: "notes-point-215c8.firebaseapp.com",
  projectId: "notes-point-215c8",
  messagingSenderId: "945990871633",
  appId: "1:945990871633:web:4cfd8339055182317fa670"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
console.log("Firebase Connected Successfully");

export { db, auth };
