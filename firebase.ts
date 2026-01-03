import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFrUahscirzZ5AL6NDgPPAEzdtPI031WY",
  authDomain: "gradindstud.firebaseapp.com",
  projectId: "gradindstud",
  storageBucket: "gradindstud.firebasestorage.app",
  messagingSenderId: "244169188750",
  appId: "1:244169188750:web:e23f6450e9d73ebd58f0df",
  measurementId: "G-YQD3GXMT11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Auth state listener
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ============ RESUME STORAGE ============

export interface StoredResume {
  id: string;
  userId: string;
  name: string;
  targetRole: string;
  content: string;
  atsScore?: number;
  isPrimary: boolean;
  isAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Save a new resume
export const saveResume = async (userId: string, resume: Omit<StoredResume, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const resumeRef = doc(collection(db, 'resumes'));
    const now = new Date();
    const resumeData: StoredResume = {
      ...resume,
      id: resumeRef.id,
      userId,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(resumeRef, {
      ...resumeData,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    });
    return resumeData;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw error;
  }
};

// Get all resumes for a user
export const getUserResumes = async (userId: string): Promise<StoredResume[]> => {
  try {
    const q = query(
      collection(db, 'resumes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as StoredResume;
    });
  } catch (error) {
    console.error("Error getting resumes:", error);
    return [];
  }
};

// Update a resume
export const updateResume = async (resumeId: string, updates: Partial<StoredResume>) => {
  try {
    const resumeRef = doc(db, 'resumes', resumeId);
    await updateDoc(resumeRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    throw error;
  }
};

// Delete a resume
export const deleteResume = async (resumeId: string) => {
  try {
    await deleteDoc(doc(db, 'resumes', resumeId));
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw error;
  }
};

// Set a resume as primary (and unset others)
export const setPrimaryResume = async (userId: string, resumeId: string) => {
  try {
    // First, get all user resumes and unset primary
    const resumes = await getUserResumes(userId);
    for (const resume of resumes) {
      if (resume.isPrimary && resume.id !== resumeId) {
        await updateResume(resume.id, { isPrimary: false });
      }
    }
    // Set the selected resume as primary
    await updateResume(resumeId, { isPrimary: true });
  } catch (error) {
    console.error("Error setting primary resume:", error);
    throw error;
  }
};

export { auth, db };
export type { User };
