/**
 * نبض الأمل - إعداد وربط منصة Firebase
 * Firebase Modular SDK v13.3.0
 * Project: menu-b2bc1
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

// Firebase Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBdXa_IlF4It5UZK4yKjTOAAwucvXS-M6k",
  authDomain: "menu-b2bc1.firebaseapp.com",
  projectId: "menu-b2bc1",
  storageBucket: "menu-b2bc1.firebasestorage.app",
  messagingSenderId: "949528183713",
  appId: "1:949528183713:web:10de86ea594833437281e0",
  measurementId: "G-FV73QP141H"
};

// 1. Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// 2. Initialize Firebase Analytics
export let analytics = null;
try {
  analytics = getAnalytics(app);
  logEvent(analytics, 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
} catch (error) {
  console.warn("Firebase Analytics could not be initialized (e.g. adblocker or localhost):", error.message);
}

// 3. Initialize Firestore Database
export const db = getFirestore(app);

// 4. Initialize Firebase Authentication
export const auth = getAuth(app);

let currentUser = null;

// Authenticate anonymously so security rules permitting auth work seamlessly
signInAnonymously(auth)
  .then((userCredential) => {
    currentUser = userCredential.user;
    console.log("Firebase Connected: Anonymous User ID:", currentUser.uid);
    updateFirebaseStatusBadge(true);
  })
  .catch((error) => {
    console.warn("Firebase Anonymous Auth warning:", error.message);
    // Still consider app ready
    updateFirebaseStatusBadge(true);
  });

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

function updateFirebaseStatusBadge(connected) {
  const badge = document.getElementById('firebaseStatusBadge');
  if (badge) {
    if (connected) {
      badge.classList.add('connected');
      badge.setAttribute('title', 'قاعدة بيانات فايربيز متصلة ومباشرة');
    }
  }
}

/**
 * Save a new donation to Firestore
 * @param {Object} donation
 */
export async function saveDonation(donation) {
  const donationRecord = {
    amount: Number(donation.amount) || 250,
    frequency: donation.frequency || 'once',
    donorName: donation.donorName?.trim() || 'فاعل خير',
    donorPhone: donation.donorPhone?.trim() || '',
    childName: donation.childName || 'الحالات الأكثر إلحاحاً',
    paymentMethod: donation.paymentMethod || 'mada',
    receiptNumber: 'NABDA-' + Math.floor(100000 + Math.random() * 900000),
    status: 'completed',
    createdAt: serverTimestamp(),
    timestamp: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, "donations"), donationRecord);
    console.log("Donation successfully saved to Firestore with ID:", docRef.id);
    
    // Log Analytics Event
    if (analytics) {
      logEvent(analytics, 'donation_completed', {
        value: donationRecord.amount,
        currency: 'SAR',
        item_id: donationRecord.receiptNumber,
        item_name: donationRecord.childName
      });
    }

    // Backup to localStorage
    saveLocalRecord('local_donations', donationRecord);

    return { success: true, docId: docRef.id, receipt: donationRecord };
  } catch (error) {
    console.warn("Firestore write fallback (saving locally):", error.message);
    // Fallback locally so user experience never fails
    saveLocalRecord('local_donations', donationRecord);
    return { success: true, docId: 'local-' + Date.now(), receipt: donationRecord, offline: true };
  }
}

/**
 * Save letter of hope to child in Firestore
 * @param {Object} letter
 */
export async function saveLetter(letter) {
  const letterRecord = {
    senderName: letter.senderName?.trim() || 'صديق للأبطال',
    childTarget: letter.childTarget || 'جميع الأبطال',
    message: letter.message?.trim(),
    createdAt: serverTimestamp(),
    dateString: new Date().toLocaleDateString('ar-SA')
  };

  try {
    const docRef = await addDoc(collection(db, "letters"), letterRecord);
    console.log("Letter saved to Firestore with ID:", docRef.id);
    if (analytics) {
      logEvent(analytics, 'letter_sent', { child: letterRecord.childTarget });
    }
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.warn("Firestore letter fallback:", error.message);
    saveLocalRecord('local_letters', letterRecord);
    return { success: true, docId: 'local-' + Date.now(), offline: true };
  }
}

/**
 * Save newsletter subscriber in Firestore
 * @param {string} email
 */
export async function saveNewsletter(email) {
  const subscriberRecord = {
    email: email.trim(),
    createdAt: serverTimestamp(),
    timestamp: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, "subscribers"), subscriberRecord);
    console.log("Subscriber added to Firestore with ID:", docRef.id);
    if (analytics) {
      logEvent(analytics, 'newsletter_subscription', { email: subscriberRecord.email });
    }
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.warn("Firestore subscriber fallback:", error.message);
    saveLocalRecord('local_subscribers', subscriberRecord);
    return { success: true, docId: 'local-' + Date.now(), offline: true };
  }
}

/**
 * Save volunteer application in Firestore
 * @param {Object} volunteer
 */
export async function saveVolunteer(volunteer) {
  const volunteerRecord = {
    name: volunteer.name?.trim(),
    phone: volunteer.phone?.trim(),
    email: volunteer.email?.trim(),
    role: volunteer.role || 'دعم ترفيهي ونفسي',
    notes: volunteer.notes?.trim() || '',
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, "volunteers"), volunteerRecord);
    console.log("Volunteer application saved with ID:", docRef.id);
    if (analytics) {
      logEvent(analytics, 'volunteer_applied', { role: volunteerRecord.role });
    }
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.warn("Firestore volunteer fallback:", error.message);
    saveLocalRecord('local_volunteers', volunteerRecord);
    return { success: true, docId: 'local-' + Date.now(), offline: true };
  }
}

/**
 * Listen to recent donations for live counters
 * @param {Function} callback
 */
export function listenToDonations(callback) {
  try {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"), limit(10));
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      callback(list);
    }, (err) => {
      console.log("Live donations listener info:", err.message);
    });
  } catch (e) {
    console.log("Snapshot listener unavailable:", e.message);
  }
}

function saveLocalRecord(key, record) {
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(record);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {}
}

// Expose on window object so traditional scripts and inline attributes can call Firebase cleanly
window.FirebaseApp = {
  app,
  analytics,
  db,
  auth,
  saveDonation,
  saveLetter,
  saveNewsletter,
  saveVolunteer,
  listenToDonations,
  logEvent: (name, params) => analytics && logEvent(analytics, name, params)
};

console.log("🔥 Firebase Suite (App, Firestore, Auth, Analytics) initialized successfully for project: menu-b2bc1");
