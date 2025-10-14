import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp,
    onSnapshot,
    deleteDoc
} from "firebase/firestore";
import { firestore } from "@/services/firebase";

// ============== TYPES ==============

export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    streak: number;
    lastWorkoutDate?: Date;
}

export interface Workout {
    id: string;
    userId: string;
    name: string;
    duration: number;
    exercises: Exercise[];
    date: Date;
    notes?: string;
}

export interface Exercise {
    name: string;
    sets: Set[];
}

export interface Set {
    reps: number;
    weight: number;
    restTime: number;
}

export interface Activity {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    type: "workout" | "pr" | "streak";
    workoutName?: string;
    duration?: number;
    exerciseName?: string;
    weight?: number;
    message: string;
    timestamp: Date;
}

export interface Friend {
    id: string;
    userId: string;
    friendId: string;
    status: "pending" | "accepted";
    createdAt: Date;
}

// ============== USER FUNCTIONS ==============

export const createUserProfile = async (userId: string, data: Partial<User>) => {
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, {
        ...data,
        streak: 0,
        createdAt: Timestamp.now(),
    });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, data);
};

export const updateUserStreak = async (userId: string) => {
    const user = await getUserProfile(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkoutDate = user.lastWorkoutDate
    ? new Date(user.lastWorkoutDate)
    : null;

    const lastWorkout = lastWorkoutDate
    ? new Date(lastWorkoutDate.setHours(0, 0, 0, 0))
    : null;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak;

    if (!lastWorkout) {
        newStreak = 1;
    } else if (lastWorkout.getTime() === yesterday.getTime()) {
        newStreak = user.streak + 1;
    } else if (lastWorkout.getTime() === today.getTime()) {
        return;
    } else {
        newStreak = 1;
    }

    await updateUserProfile(userId, {
        streak: newStreak,
        lastWorkoutDate: today,
    });
};


// ============== WORKOUT FUNCTIONS ==============

export const createWorkout = async (workout: Omit<Workout, "id">) => {


