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

    // Hvis det ikke finnes en siste økt-dato, start streak på 1
    if (!lastWorkoutDate) {
        await updateUserProfile(userId, {
            streak: 1,
            lastWorkoutDate: today,
        });
        return;
    }

    const lastWorkout = new Date(lastWorkoutDate);
    lastWorkout.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak;

    // Hvis siste økt var i går, øk streak med 1
    if (lastWorkout.getTime() === yesterday.getTime()) {
        newStreak = user.streak + 1;
    } 
    // Hvis siste økt var i dag, behold samme streak
    else if (lastWorkout.getTime() === today.getTime()) {
        return; // Streak allerede oppdatert i dag
    } 
    // Hvis det har gått mer enn 1 dag, start streak på nytt
    else {
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

  export const searchUsersByUsername = async (searchQuery: string): Promise<User[]> => {
    const usersRef = collection(firestore, "users");
    const querySnapshot = await getDocs(usersRef);
    
    const allUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
    })) as User[];

    // Filtrer lokalt på displayName (case-insensitive)
    const filteredUsers = allUsers.filter(user => 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredUsers;
  };

  export const followUser = async (userId: string, friendId: string) => {
    const friendRef = collection(firestore, "friends");
    await addDoc(friendRef, {
        userId,
        friendId,
        status: "accepted",
        createdAt: Timestamp.now(),
    });
  };

  export const unfollowUser = async (userId: string, friendId: string) => {
    const friendsRef = collection(firestore, "friends");
    const q = query(
        friendsRef,
        where("userId", "==", userId),
        where("friendId", "==", friendId),
        where("status", "==", "accepted")
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const friendDoc = querySnapshot.docs[0];
        await deleteDoc(doc(firestore, "friends", friendDoc.id));
    }
  };

  export const getFollowing = async (userId: string): Promise<Friend[]> => {
    return getUserFriends(userId); // Samme funksjon som getUserFriends
  };

  export const isFollowing = async (userId: string, friendId: string): Promise<boolean> => {
    const friendsRef = collection(firestore, "friends");
    const q = query(
        friendsRef,
        where("userId", "==", userId),
        where("friendId", "==", friendId),
        where("status", "==", "accepted")
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  export const getFriendsActivityFeed = async (userId: string, limitCount: number = 20): Promise<Activity[]> => {
    // Hent brukerens venner
    const friends = await getUserFriends(userId);
    const friendIds = friends.map(friend => friend.friendId);

    if (friendIds.length === 0) {
        return []; // Ingen venner, returner tom liste
    }

    // Hent aktiviteter fra venner (uten orderBy for å unngå composite index)
    const activitiesRef = collection(firestore, "activities");
    const q = query(
        activitiesRef,
        where("userId", "in", friendIds),
        limit(limitCount * 2) // Hent flere for å sortere lokalt
    );

    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
    })) as Activity[];

    // Sorter lokalt etter timestamp (nyeste først) og begrens til limitCount
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activities.slice(0, limitCount);
  };

  // ============== HELPER FUNCTIONS ==============

  export const getWorkoutsThisWeek = async (userId: string): Promise<number> => {
    const workouts = await getUserWorkouts(userId, 100);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return workouts.filter(w => w.date >= weekAgo).length;
  };

  export const calculateStreakFromWorkouts = async (userId: string): Promise<number> => {
    const workouts = await getUserWorkouts(userId, 100);
    if (workouts.length === 0) return 0;

    // Sorter økter etter dato (nyeste først)
    workouts.sort((a, b) => b.date.getTime() - a.date.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sjekk om det finnes en økt i dag
    const todayWorkout = workouts.find(w => {
      const workoutDate = new Date(w.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    });

    if (todayWorkout) {
      streak = 1;
    } else {
      // Sjekk om det finnes en økt i går
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayWorkout = workouts.find(w => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === yesterday.getTime();
      });

      if (!yesterdayWorkout) return 0; // Ingen streak hvis ingen økt i går eller i dag
      streak = 1;
    }

    // Fortsett bakover i tid for å finne kontinuerlig streak
    let currentDate = new Date(today);
    if (!todayWorkout) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      currentDate = new Date(yesterday);
    }

    for (let i = 0; i < workouts.length; i++) {
      const workoutDate = new Date(workouts[i].date);
      workoutDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);

      if (workoutDate.getTime() === expectedDate.getTime()) {
        streak++;
        currentDate = new Date(expectedDate);
      } else if (workoutDate.getTime() < expectedDate.getTime()) {
        break; // Streak brutt
      }
    }

    return streak;
  };

  export const syncUserStreak = async (userId: string): Promise<number> => {
    const calculatedStreak = await calculateStreakFromWorkouts(userId);
    await updateUserProfile(userId, { streak: calculatedStreak });
    return calculatedStreak;
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
