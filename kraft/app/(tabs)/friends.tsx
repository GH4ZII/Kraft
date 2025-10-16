import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { auth } from "@/services/firebase";
import { 
  searchUsersByUsername, 
  followUser, 
  unfollowUser, 
  isFollowing, 
  getFollowing,
  User,
  Friend 
} from "@/services/database";

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [following, setFollowing] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const friends = await getFollowing(user.uid);
      setFollowing(friends);

      // Hent follow-status for alle brukere
      const statusMap: Record<string, boolean> = {};
      for (const friend of friends) {
        statusMap[friend.friendId] = true;
      }
      setFollowingStatus(statusMap);
    } catch (error) {
      console.error("Error loading following:", error);
      Alert.alert("Feil", "Kunne ikke laste venner");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    
    try {
      const results = await searchUsersByUsername(query);
      // Filtrer ut deg selv fra søkeresultatene
      const user = auth.currentUser;
      const filteredResults = results.filter(userResult => userResult.id !== user?.uid);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Feil", "Kunne ikke søke etter brukere");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (friendId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await followUser(user.uid, friendId);
      setFollowingStatus(prev => ({ ...prev, [friendId]: true }));
      
      // Oppdater following-listen hvis vi er på venner-siden
      if (!isSearching) {
        loadFollowing();
      }
    } catch (error) {
      console.error("Error following user:", error);
      Alert.alert("Feil", "Kunne ikke følge bruker");
    }
  };

  const handleUnfollow = async (friendId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await unfollowUser(user.uid, friendId);
      setFollowingStatus(prev => ({ ...prev, [friendId]: false }));
      
      // Oppdater following-listen hvis vi er på venner-siden
      if (!isSearching) {
        loadFollowing();
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert("Feil", "Kunne ikke slutte å følge bruker");
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isCurrentlyFollowing = followingStatus[item.id] || false;

    return (
      <View style={styles.userItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.followButton,
            isCurrentlyFollowing && styles.followingButton
          ]}
          onPress={() => 
            isCurrentlyFollowing 
              ? handleUnfollow(item.id) 
              : handleFollow(item.id)
          }
        >
          <Text style={[
            styles.followButtonText,
            isCurrentlyFollowing && styles.followingButtonText
          ]}>
            {isCurrentlyFollowing ? "Følger" : "Følg"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFollowingItem = ({ item }: { item: Friend }) => {
    // Vi trenger brukerinfo for friend-objektet
    // For nå viser vi bare friendId, men vi kunne hente full brukerinfo
    return (
      <View style={styles.userItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.friendId.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.friendId}</Text>
          <Text style={styles.userEmail}>Bruker ID: {item.friendId}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.followButton, styles.followingButton]}
          onPress={() => handleUnfollow(item.friendId)}
        >
          <Text style={[styles.followButtonText, styles.followingButtonText]}>
            Følger
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Ingen brukere funnet</Text>
          <Text style={styles.emptySubtext}>Prøv et annet søkeord</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Ingen venner ennå</Text>
          <Text style={styles.emptySubtext}>Søk etter brukere for å følge dem</Text>
        </View>
      );
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
            <Text style={styles.title}>Venner</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Søk etter brukere..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {isSearching ? (
          // Search Results
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>
              Søkeresultater for "{searchQuery}"
            </Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Søker...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        ) : (
          // Following List
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>
              Du følger ({following.length})
            </Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Laster...</Text>
              </View>
            ) : following.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={following}
                renderItem={renderFollowingItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#34C759',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followingButton: {
    backgroundColor: '#E8F5E9',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#34C759',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});