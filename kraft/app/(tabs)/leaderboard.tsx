import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { auth } from "@/services/firebase";
import { getLeaderboardUsers, getUserFriendsLeaderboard, LeaderboardUser } from "@/services/database";
import { router } from "expo-router";

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week");
  const [selectedType, setSelectedType] = useState<"all" | "friends">("all");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedType]);

  const loadLeaderboard = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      let leaderboardData: LeaderboardUser[];

      if (selectedType === "friends") {
        leaderboardData = await getUserFriendsLeaderboard(user.uid, selectedPeriod);
      } else {
        leaderboardData = await getLeaderboardUsers(user.uid, selectedPeriod);
      }

      setUsers(leaderboardData);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      Alert.alert("Feil", "Kunne ikke laste leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🏆";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank;
    }
  };

  const handleFindFriends = () => {
    router.push("/(tabs)/friends");
  };

  const handleShareProgress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const currentUser = users.find((u) => u.isCurrentUser);
    if (!currentUser) return;

    try {
      await Share.share({
        message: `Jeg er på plass ${currentUser.points} i Kraft leaderboard! 💪\n\nPoeng: ${currentUser.points}\nØkter: ${currentUser.workouts}\nStreak: ${currentUser.streak} dager`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleSetGoal = () => {
    Alert.alert(
      "Sett ukesmål",
      "Dette kommer snart! Du vil kunne sette mål for antall økter eller poeng per uke.",
      [{ text: "OK" }]
    );
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "week":
        return "Uke";
      case "month":
        return "Måned";
      case "all":
        return "Alltid";
    }
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
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Leaderboards</Text>
          <Text style={styles.subtitle}>Se hvordan du ligger an mot venner og lokalsamfunnet</Text>
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === "week" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("week")}
          >
            <Text style={[styles.filterText, selectedPeriod === "week" && styles.filterTextActive]}>
              Uke
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === "month" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("month")}
          >
            <Text style={[styles.filterText, selectedPeriod === "month" && styles.filterTextActive]}>
              Måned
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === "all" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("all")}
          >
            <Text style={[styles.filterText, selectedPeriod === "all" && styles.filterTextActive]}>
              Alltid
            </Text>
          </TouchableOpacity>
        </View>

        {/* Type Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonSecondary, selectedType === "all" && styles.filterButtonActive]}
            onPress={() => setSelectedType("all")}
          >
            <Ionicons name="trophy-outline" size={18} color={selectedType === "all" ? "#fff" : "#000"} />
            <Text style={[styles.filterText, selectedType === "all" && styles.filterTextActive]}>
              Globalt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonSecondary, selectedType === "friends" && styles.filterButtonActive]}
            onPress={() => setSelectedType("friends")}
          >
            <Text style={[styles.filterText, selectedType === "friends" && styles.filterTextActive]}>
              Venner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Laster...</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Ingen data ennå</Text>
            <Text style={styles.emptySubtext}>Logg dine første økter for å komme på leaderboard!</Text>
          </View>
        ) : (
          <View style={styles.leaderboardList}>
            {users.map((user, index) => (
              <View
                key={user.id}
                style={[
                  styles.leaderboardItem,
                  user.isCurrentUser && styles.currentUserItem
                ]}
              >
                <View style={styles.rankColumn}>
                  <Text style={styles.rankText}>{getRankIcon(index + 1)}</Text>
                </View>
                
                <View style={styles.avatarColumn}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                  </View>
                </View>
                
                <View style={styles.userInfoColumn}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userStats}>
                    {user.points} poeng • {user.workouts} økter
                  </Text>
                </View>
                
                <View style={styles.pointsColumn}>
                  <Text style={styles.pointsText}>{user.points}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Weekly Goal Section */}
        <View style={styles.goalSection}>
          <View style={styles.goalContent}>
            <Ionicons name="flag-outline" size={24} color="#34C759" />
            <View style={styles.goalTextContainer}>
              <Text style={styles.goalTitle}>Sett deg et ukesmål</Text>
              <Text style={styles.goalSubtitle}>
                Velg antall økter eller poeng du vil sikte mot denne uken
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.goalButton} onPress={handleSetGoal}>
            <Text style={styles.goalButtonText}>Velg mål</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleFindFriends}>
            <Ionicons name="people-outline" size={20} color="#000" />
            <Text style={styles.actionButtonSecondaryText}>Finn venner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonPrimary} onPress={handleShareProgress}>
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonPrimaryText}>Del fremgang</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },
  settingsButton: {
    padding: 8,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonSecondary: {
    flexDirection: 'row',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#34C759',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  leaderboardList: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  leaderboardItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  rankColumn: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarColumn: {
    marginHorizontal: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  userInfoColumn: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 14,
    color: '#666',
  },
  pointsColumn: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  goalSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  goalTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  goalButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  goalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});