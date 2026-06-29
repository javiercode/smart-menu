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
import { MenuService } from './MenuService';
import type { UserProfile, Restaurant } from '../core/types';

export interface IAuthService {
  signIn(email: string, password: string): Promise<UserProfile>;
  signUp(email: string, password: string, restaurantName: string, inviteCode: string): Promise<UserProfile>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void;
}

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD") // Remove accents/diacritics
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumeric, spaces, and hyphens
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace double hyphens
};

// ---------------------------------------------------------
// Seed initial B2B authorization codes if they do not exist
// ---------------------------------------------------------
export const seedAuthorizationCodes = async () => {
  if (!fbDb) return;
  try {
    const demoCodeRef = doc(fbDb, 'authorization_codes', 'DEMO-CODE-2026');
    const snap = await getDoc(demoCodeRef);
    if (!snap.exists()) {
      console.log('Seeding initial B2B authorization codes in Cloud Firestore...');
      const initialCodes = [
        'DEMO-CODE-2026',
        'SMART-INVITE-1',
        'SMART-INVITE-2',
        'SMART-INVITE-3',
        'SMART-INVITE-4'
      ];
      for (const code of initialCodes) {
        await setDoc(doc(fbDb, 'authorization_codes', code), {
          used: false,
          expirationDate: '2030-12-31'
        });
      }
    }
  } catch (error) {
    console.warn('Could not seed authorization codes (perhaps rules are restrictive yet):', error);
  }
};

// ---------------------------------------------------------
// Concrete Firebase Implementation
// ---------------------------------------------------------
class FirebaseAuthService implements IAuthService {
  constructor() {
    // Attempt seeding when instantiated
    seedAuthorizationCodes();
  }

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

  async signUp(email: string, password: string, restaurantName: string, inviteCode: string): Promise<UserProfile> {
    if (!fbAuth || !fbDb) throw new Error('Firebase no está inicializado.');
    
    const codeRef = inviteCode.trim();
    if (!codeRef) {
      throw new Error('Se requiere un código de invitación para registrarse.');
    }

    // 1. Verify Invitation Code in Firestore
    const codeDocRef = doc(fbDb, 'authorization_codes', codeRef);
    const codeSnap = await getDoc(codeDocRef);
    if (!codeSnap.exists()) {
      throw new Error('Código de invitación inválido. Por favor contáctese con el administrador.');
    }
    const codeData = codeSnap.data();
    if (codeData.used) {
      throw new Error('Este código de invitación ya ha sido utilizado.');
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (codeData.expirationDate && codeData.expirationDate < todayStr) {
      throw new Error('Este código de invitación ha expirado.');
    }

    // 2. Generate a Unique Slug
    const baseSlug = generateSlug(restaurantName);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await MenuService.getRestaurantBySlug(uniqueSlug);
      if (!existing) {
        break;
      }
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // 3. Create user credentials
    const userCredential = await createUserWithEmailAndPassword(fbAuth, email, password);
    const user = userCredential.user;
    
    // 4. Create restaurant B2B tenant
    const restaurantId = `rest_${user.uid}`;
    const restaurantDocRef = doc(fbDb, 'restaurants', restaurantId);
    const restaurantData: Restaurant = {
      id: restaurantId,
      slug: uniqueSlug,
      name: restaurantName,
      email: email,
      primaryColor: '#1976d2', // Default MUI blue
      secondaryColor: '#dc004e' // Default MUI pink
    };
    await setDoc(restaurantDocRef, restaurantData);
    
    // 5. Create user profile
    const profileDocRef = doc(fbDb, 'users', user.uid);
    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      restaurantId: restaurantId,
      role: 'admin'
    };
    await setDoc(profileDocRef, profileData);

    // 6. Mark invitation code as used
    await setDoc(codeDocRef, { used: true }, { merge: true });
    
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
