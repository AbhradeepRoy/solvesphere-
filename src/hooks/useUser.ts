import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "../types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          const newProfile: Partial<UserProfile> = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Student",
            photoURL: firebaseUser.photoURL || "",
            xp: 0,
            streak: 0,
            badges: [],
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, { ...newProfile, createdAt: serverTimestamp(), lastActive: serverTimestamp() });
          setProfile(newProfile as UserProfile);
        }

        // Real-time updates for XP/badges
        const unSubProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });
        return () => unSubProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addXP = async (amount: number) => {
    if (!user || !profile) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { xp: profile.xp + amount, lastActive: serverTimestamp() }, { merge: true });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { ...updates, lastActive: serverTimestamp() }, { merge: true });
  };

  return { user, profile, loading, addXP, updateProfile };
}
