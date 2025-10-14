import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  workouts: number;
  isCurrentUser: boolean;
  avatar?: string;
}

const mockUsers: LeaderboardUser[] = [
  { id: "1", name: "Ida", points: 312, workouts: 7, isCurrentUser: false },
  { id: "2", name: "Jonas", points: 298, workouts: 6, isCurrentUser: false },
  { id: "3", name: "Du", points: 274, workouts: 5, isCurrentUser: true },
  { id: "4", name: "Selma", points: 221, workouts: 5, isCurrentUser: false },
  { id: "5", name: "Maja", points: 190, workouts: 4, isCurrentUser: false },
];

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Uke");
  const [selectedType, setSelectedType] = useState("Venner");

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
            style={[styles.filterButton, selectedPeriod === "Uke" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("Uke")}
          >
            <Text style={[styles.filterText, selectedPeriod === "Uke" && styles.filterTextActive]}>
              Uke
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === "Måned" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("Måned")}
          >
            <Text style={[styles.filterText, selectedPeriod === "Måned" && styles.filterTextActive]}>
              Måned
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === "Alltid" && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod("Alltid")}
          >
            <Text style={[styles.filterText, selectedPeriod === "Alltid" && styles.filterTextActive]}>
              Alltid
            </Text>
          </TouchableOpacity>
        </View>

        {/* Type Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonSecondary, selectedType === "Ukens poeng" && styles.filterButtonActive]}
            onPress={() => setSelectedType("Ukens poeng")}
          >
            <Ionicons name="trophy-outline" size={18} color={selectedType === "Ukens poeng" ? "#fff" : "#000"} />
            <Text style={[styles.filterText, selectedType === "Ukens poeng" && styles.filterTextActive]}>
              Ukens poeng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonSecondary, selectedType === "Venner" && styles.filterButtonActive]}
            onPress={() => setSelectedType("Venner")}
          >
            <Text style={[styles.filterText, selectedType === "Venner" && styles.filterTextActive]}>
              Venner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonSecondary, selectedType === "Lokalt" && styles.filterButtonActive]}
            onPress={() => setSelectedType("Lokalt")}
          >
            <Text style={[styles.filterText, selectedType === "Lokalt" && styles.filterTextActive]}>
              Lokalt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonSecondary, selectedType === "Globalt" && styles.filterButtonActive]}
            onPress={() => setSelectedType("Globalt")}
          >
            <Text style={[styles.filterText, selectedType === "Globalt" && styles.filterTextActive]}>
              Globalt
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardList}>
          {mockUsers.map((user, index) => (
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
          <TouchableOpacity style={styles.goalButton}>
            <Text style={styles.goalButtonText}>Velg mål</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Ionicons name="people-outline" size={20} color="#000" />
            <Text style={styles.actionButtonSecondaryText}>Finn venner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonPrimary}>
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
});