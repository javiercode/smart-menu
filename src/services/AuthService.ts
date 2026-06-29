import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged, 
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { auth as fbAuth, db as fbDb } from '../core/firebase/config';
import type { UserProfile, Restaurant } from '../core/types';

export interface IAuthService {
  signIn(email: string, password: string): Promise<UserProfile>;
  signUp(email: string, password: string, restaurantName: string): Promise<UserProfile>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void;
}

// ---------------------------------------------------------
// Concrete Firebase Implementation
// ---------------------------------------------------------
class FirebaseAuthService implements IAuthService {
  async signIn(email: string, password: string): Promise<UserProfile> {
    if (!fbAuth || !fbDb) throw new Error('Firebase no está inicializado.');
    
    const userCredential = await signInWithEmailAndPassword(fbAuth, email, password);
    const user = userCredential.user;
    
    // Fetch profile from Firestore
    const profileDoc = await getDoc(doc(fbDb, 'users', user.uid));
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    
    // Fallback if document doesn't exist
    return {
      uid: user.uid,
      email: user.email || email,
      role: 'admin'
    };
  }

  async signUp(email: string, password: string, restaurantName: string): Promise<UserProfile> {
    if (!fbAuth || !fbDb) throw new Error('Firebase no está inicializado.');
    
    const userCredential = await createUserWithEmailAndPassword(fbAuth, email, password);
    const user = userCredential.user;
    
    // Create restaurant B2B tenant
    const restaurantId = `rest_${user.uid}`;
    const restaurantDocRef = doc(fbDb, 'restaurants', restaurantId);
    const restaurantData: Restaurant = {
      id: restaurantId,
      name: restaurantName,
      email: email,
      primaryColor: '#1976d2', // Default MUI blue
      secondaryColor: '#dc004e' // Default MUI pink
    };
    await setDoc(restaurantDocRef, restaurantData);
    
    // Create user profile
    const profileDocRef = doc(fbDb, 'users', user.uid);
    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      restaurantId: restaurantId,
      role: 'admin'
    };
    await setDoc(profileDocRef, profileData);
    
    return profileData;
  }

  async signOut(): Promise<void> {
    if (!fbAuth) throw new Error('Firebase no está inicializado.');
    await fbSignOut(fbAuth);
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    if (!fbAuth || !fbDb) {
      callback(null);
      return () => {};
    }
    
    return fbOnAuthStateChanged(fbAuth, async (user: FirebaseUser | null) => {
      if (user) {
        try {
          const profileDoc = await getDoc(doc(fbDb!, 'users', user.uid));
          if (profileDoc.exists()) {
            callback(profileDoc.data() as UserProfile);
          } else {
            callback({
              uid: user.uid,
              email: user.email || '',
              role: 'admin'
            });
          }
        } catch (error) {
          console.error('Error fetching user profile during auth state change:', error);
          callback({
            uid: user.uid,
            email: user.email || '',
            role: 'admin'
          });
        }
      } else {
        callback(null);
      }
    });
  }
}

export const AuthService: IAuthService = new FirebaseAuthService();
