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
    completed: boolean;
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
const workoutRef = collection(firestore, "workouts");
const docRef = await addDoc(workoutRef, {
    ...workout,
    date: Timestamp.fromDate(workout.date),
});

await updateUserStreak(workout.userId);
    return docRef.id;
};

export const getUserWorkouts = async (userId: string, limitCount: number = 10) => {
    const workoutsRef = collection(firestore, "workouts");
    const q = query(
        workoutsRef,
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    })) as Workout[];
  };

  export const getLastWorkout = async (userId: string): Promise<Workout | null> => {
    const workouts = await getUserWorkouts(userId, 1);
    return workouts.length > 0 ? workouts[0] : null;
  };

  // ============== ACTIVITY FUNCTIONS ==============

  export const createActivity = async (activity: Omit<Activity, "id">) => {
    const activityRef = collection(firestore, "activities");
    await addDoc(activityRef, {
        ...activity,
        timestamp: Timestamp.fromDate(activity.timestamp),
    });
  };
  
  export const getActivityFeed = async (limitCount: number = 20): Promise<Activity[]> => {
    const activitiesRef = collection(firestore, "activities");
    const q = query(
        activitiesRef,
        orderBy("timestamp", "desc"),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
    })) as Activity[];
  };

  export const subscribeToActivityFeed = (callback: (activities: Activity[]) => void) => {
    const activitiesRef = collection(firestore, "activities");
    const q = query(
        activitiesRef,
        orderBy("timestamp", "desc"),
        limit(20)
    );
    
    return onSnapshot(q, (snapshot) => {
        const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate(),
        })) as Activity[];
        callback(activities);
    });
  };

  // ============== FRIEND FUNCTIONS ==============

  export const sendFriendRequest = async (userId: string, friendId: string) => {
    const friendRef = collection(firestore, "friends");
    await addDoc(friendRef, {
        userId,
        friendId,
        status: "pending",
        createdAt: Timestamp.now(),
    });
  };

  export const acceptFriendRequest = async (friendRequestId: string) => {
    const friendRef = doc(firestore, "friends", friendRequestId);
    await updateDoc(friendRef, { status: "accepted" });
  };
  
  export const getUserFriends = async (userId: string): Promise<Friend[]> => {
    const friendsRef = collection(firestore, "friends");
    const q = query(
        friendsRef,
        where("userId", "==", userId),
        where("status", "==", "accepted"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
    })) as Friend[];
  };

  // ============== HELPER FUNCTIONS ==============

  export const getWorkoutsThisWeek = async (userId: string): Promise<number> => {
    const workouts = await getUserWorkouts(userId, 100);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return workouts.filter(w => w.date >= weekAgo).length;
  };

  // ============== LEADERBOARD FUNCTIONS ==============
  export interface LeaderboardUser {
    id: string;
    name: string;
    points: number;
    workouts: number;
    streak: number;
    isCurrentUser: boolean;
  }

  export const getLeaderboardUsers = async (
    userId: string,
    period: "week" | "month" | "all" = "week"
  ): Promise<LeaderboardUser[]> => {
    const now = new Date();
    let startDate: Date;

    // Bruker velger periode
    switch (period) {
        case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case "all":
            startDate = new Date(0);
            break;
    }

    // Hent økter
    const workoutsRef = collection(firestore, "workouts");
    const q = query(
        workoutsRef,
        where("date", ">=", Timestamp.fromDate(startDate)),
        orderBy("date", "desc")
    );


    const workoutsSnapshot = await getDocs(q);
    const userStats: Record<string, { workouts: number, points: number, streak: number }> = {};

    // Beregn statistikk
    workoutsSnapshot.docs.forEach(doc => {
        const workout = doc.data();
        const uid = workout.userId;

        if (!userStats[uid]) {
            userStats[uid] = { workouts: 0, points: 0, streak: 0 };
        }

        userStats[uid].workouts++;
        const exerciseCount = workout.exercises?.length || 0;
        userStats[uid].points += 10 + exerciseCount;
    });

    // Hent brukerinfo
  const usersRef = collection(firestore, "users");
  const usersSnapshot = await getDocs(usersRef);

  const leaderboard: LeaderboardUser[] = [];

  usersSnapshot.docs.forEach((doc) => {
    const userData = doc.data();
    const uid = doc.id;
    const stats = userStats[uid];

    if (stats) {
      leaderboard.push({
        id: uid,
        name: userData.displayName || userData.username || "Bruker",
        points: stats.points,
        workouts: stats.workouts,
        streak: userData.streak || 0,
        isCurrentUser: uid === userId,
      });
    }
  });

  // Sorter etter poeng
  leaderboard.sort((a, b) => b.points - a.points);

  return leaderboard;
};

export const getUserFriendsLeaderboard = async (
  userId: string,
  period: "week" | "month" | "all" = "week"
): Promise<LeaderboardUser[]> => {
  // Hent venner
  const friends = await getUserFriends(userId);
  const friendIds = friends.map((f) => f.friendId);

  // Hent alle brukere (inkludert deg selv og venner)
  const allUsers = await getLeaderboardUsers(userId, period);
  
  // Filtrer til kun venner + deg selv
  return allUsers.filter((user) => user.id === userId || friendIds.includes(user.id));
};

// ============== WORKOUT TEMPLATE FUNCTIONS ==============

export interface WorkoutTemplate {
    id: string;
    userId: string;
    name: string;
    exercises: Exercise[];
    createdAt: Date;
    lastUsed?: Date;
}

export const createWorkoutTemplate = async (template: Omit<WorkoutTemplate, "id">) => {
    const templateRef = collection(firestore, "workoutTemplates");
    const docRef = await addDoc(templateRef, {
        ...template,
        createdAt: Timestamp.fromDate(template.createdAt),
        lastUsed: template.lastUsed ? Timestamp.fromDate(template.lastUsed) : null,
    });
    return docRef.id;
};

export const getUserWorkoutTemplates = async (userId: string): Promise<WorkoutTemplate[]> => {
    const templatesRef = collection(firestore, "workoutTemplates");
    const q = query(
        templatesRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        lastUsed: doc.data().lastUsed ? doc.data().lastUsed.toDate() : null,
    })) as WorkoutTemplate[];
};

export const updateTemplateLastUsed = async (templateId: string) => {
    const templateRef = doc(firestore, "workoutTemplates", templateId);
    await updateDoc(templateRef, {
        lastUsed: Timestamp.now(),
    });
};

export const deleteWorkoutTemplate = async (templateId: string) => {
    const templateRef = doc(firestore, "workoutTemplates", templateId);
    await deleteDoc(templateRef);
};
