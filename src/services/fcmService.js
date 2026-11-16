import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/confiq';



const storeFcmToken = async (userId, token) => {// Ensure you have initialized Firestore
  try {
    await setDoc(doc(db, 'fcmTokens', userId), {
      token: token,
      timestamp: serverTimestamp(),
    });
    console.log('FCM token stored successfully.');
  } catch (error) {
    console.error('Error storing FCM token:', error);
  }
};

export default storeFcmToken;
