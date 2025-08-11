import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import {
  NavigateIcon,
  SortIcon,
  FilterIcon,
  SearchIcon,
  LocationIcon,
  AddIcon,
} from '../assets';
import { RootStackNavigationProp } from 'src/navigation/navigation';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp<'CreateTrip'>>();
  const [search, setSearch] = useState('');
  const [trips, setTrips] = useState<any[]>([]);
  const [userName, setUserName] = useState('User');
  const [profilePic, setProfilePic] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        try {
          const userStr = await AsyncStorage.getItem('loggedInUser');
          if (!userStr) return;
          const user = JSON.parse(userStr);
          if (user.profile != null) {
            setProfilePic(user.profile || user.photo || '');
          }
          setUserName(
            user.name ||
              user.fullName ||
              user.firstName + ' ' + user.lastName ||
              'User',
          );
          const tripsStr = await AsyncStorage.getItem('trips');
          const allTrips = tripsStr ? JSON.parse(tripsStr) : {};
          console.log('All Trips:', allTrips);
          setTrips(allTrips[user.email] || []);
        } catch (e) {
          setTrips([]);
          setUserName('User');
        }
      };
      fetchTrips();
    }, []),
  );

  const filteredTrips = trips.filter(trip =>
    trip.tripLocation?.toLowerCase().includes(search.toLowerCase()),
  );

  const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0]?.toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${month} ${day}`;
  };

  const handleAddTrip = () => {
    navigation.navigate('CreateTrip');
  };
  const handleEditTrip = (trip: any) => {
    navigation.navigate('CreateTrip', { trip });
  };

  const renderNoResults = () => (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>No trips found for "{search}"</Text>
      <Text style={styles.noResultsSubtext}>
        Try searching with a different location name
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.initialsCircle}>
            {profilePic && profilePic.length > 0 ? (
              <Image source={{ uri: profilePic }} style={styles.avatar} />
            ) : (
              <Text style={styles.initialsText}>{getInitials(userName)}</Text>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.hiText}>Hi, {userName}</Text>
          </View>
          <TouchableOpacity style={styles.langBtn}>
            <SortIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <SearchIcon width={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#A1A1A1"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <FilterIcon height={20} />
          </TouchableOpacity>
        </View>

        {trips && trips.length > 0 ? (
          <ScrollView style={{ flex: 1 }}>
            <Text style={styles.recentViewedLabel}>
              {search
                ? `Search Results (${filteredTrips.length})`
                : 'Recent Trips'}
            </Text>

            {filteredTrips.length > 0 ? (
              <FlatList
                data={filteredTrips}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleEditTrip(item)}>
                    <View style={styles.tripCard}>
                      <View style={{ position: 'relative' }}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.tripImage}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.tripTitle}>
                          {item.tripLocation || 'Trip'}
                        </Text>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text style={styles.tripLocation}>
                            {`${formatDate(item.startDate)} - ${formatDate(
                              item.endDate,
                            )}` || ''}
                          </Text>
                          <Text style={styles.tripRating}>
                            {item.rating || ''}
                          </Text>
                        </View>
                        <Text style={styles.tripPrice}>
                          Budget: {item.budget ? `$${item.budget}` : ''}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.tripGoBtn}
                        onPress={() => handleEditTrip(item)}
                      >
                        <NavigateIcon style={{ alignSelf: 'center' }} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            ) : search ? (
              renderNoResults()
            ) : null}
          </ScrollView>
        ) : (
          <View style={styles.centered}>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => handleAddTrip()}
            >
              <AddIcon />
              <Text style={styles.createBtnText}>Create a New Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {trips.length > 0 && (
          <TouchableOpacity
            style={styles.floatingBtn}
            onPress={() => {
              navigation.navigate('CreateTrip');
            }}
          >
            <AddIcon />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  hiText: { color: '#A1A1A1', fontSize: 13, fontWeight: '500' },
  locationText: {
    color: '#222',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '600',
  },
  langBtn: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 12,
    marginLeft: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#E3E6EB',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 15,
    color: '#222',
  },
  filterBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E6EB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginLeft: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  categoryBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#989FA6',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#B9EC63',
    borderWidth: 0,
  },
  categoryText: {
    color: '#A1A1A1',
    fontWeight: '500',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#85CC16',
    borderRadius: 16,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  lastSearchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
  },
  lastSearchLabel: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  clearAll: {
    color: '#85CC16',
    fontWeight: '500',
    fontSize: 13,
  },
  lastSearchChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  lastSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#E2EAED',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  lastSearchChipText: {
    color: '#A1A1A1',
    fontSize: 13,
  },
  recentViewedLabel: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingEnd: 10,
  },
  tripImage: {
    width: 116,
    height: 109,
    borderRadius: 12,
  },
  initialsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#85CC16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  tripTitle: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  tripLocation: {
    color: '#A1A1A1',
    fontSize: 13,
    marginLeft: 2,
  },
  tripRating: {
    color: '#A1A1A1',
    fontSize: 13,
    marginLeft: 2,
  },
  tripPrice: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 4,
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#85CC16',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  tripGoBtn: {
    backgroundColor: '#85CC16',
    borderRadius: 30,
    alignContent: 'center',
    height: 50,
    width: 50,
    paddingTop: 17,
    marginLeft: 8,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#A1A1A1',
    textAlign: 'center',
  },
});
