import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { auth } from "@/services/firebase";
import { 
  getUserProfile, 
  getWorkoutsThisWeek, 
  getLastWorkout,
  getActivityFeed,
  Workout,
  Activity 
} from "@/services/database";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [streak, setStreak] = useState(7);
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Hent brukerprofil
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserName(profile.displayName || "Bruker");
        setStreak(profile.streak || 0);
      }

      // Hent statistikk
      const workouts = await getWorkoutsThisWeek(user.uid);
      setWeeklyWorkouts(workouts);

      // Hent siste økt
      const last = await getLastWorkout(user.uid);
      setLastWorkout(last);

      // Hent aktivitetsfeed
      const feed = await getActivityFeed(3);
      setActivities(feed);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `For ${diffMins} min siden`;
    if (diffHours < 24) return `For ${diffHours} t siden`;
    if (diffDays === 1) return "I går";
    return `${diffDays} dager siden`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Ionicons name="flash" size={24} color="#34C759" />
              <Text style={styles.logoText}>Kraft</Text>
            </View>
            <Text style={styles.greeting}>Hei, {userName}</Text>
            <Text style={styles.subtitle}>Her er oversikten din i dag</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{weeklyWorkouts}</Text>
            <Text style={styles.statLabel}>Økter denne uken</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(weeklyWorkouts / 7) * 100}%` }]} />
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak} dager</Text>
            <Text style={styles.statLabel}>Streak</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
          </View>
        </View>

        {/* Last Workout Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Siste økt</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>Se alle</Text>
            </TouchableOpacity>
          </View>
          
          {lastWorkout ? (
            <View style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Ionicons name="barbell-outline" size={20} color="#34C759" />
                <Text style={styles.workoutName}>{lastWorkout.name}</Text>
              </View>
              <Text style={styles.workoutDetails}>
                I går • {lastWorkout.duration} min • {lastWorkout.exercises.length} øvelser
              </Text>
              <View style={styles.workoutButtons}>
                <TouchableOpacity style={styles.primaryButton}>
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={styles.primaryButtonText}>Start økt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Ionicons name="add" size={16} color="#34C759" />
                  <Text style={styles.secondaryButtonText}>Logg økt</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.workoutCard}>
              <Text style={styles.noWorkoutText}>Ingen økter ennå</Text>
              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Start din første økt</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Friends Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Venners aktivitet</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>Se mer</Text>
            </TouchableOpacity>
          </View>

          {activities.length > 0 ? (
            activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {activity.userName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityName}>{activity.userName}</Text> {activity.message}
                  </Text>
                  <Text style={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Ingen aktivitet ennå</Text>
              <Text style={styles.emptyStateSubtext}>Legg til venner for å se deres aktivitet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  notificationButton: {
    padding: 8,
  },
  statsCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#C8E6C9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#C8E6C9',
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllLink: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  workoutButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
  },
  activityText: {
    fontSize: 15,
    color: '#000',
    marginBottom: 4,
  },
  activityName: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 13,
    color: '#999',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
