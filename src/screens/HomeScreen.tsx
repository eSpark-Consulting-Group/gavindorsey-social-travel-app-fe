import React, { useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import {
  NavigateIcon,
  SortIcon,
  FilterIcon,
  SearchIcon,
  AddIcon,
} from '../assets';
import { RootStackNavigationProp } from 'src/navigation/navigation';
import { RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAllTrips } from '../services/tripsService';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp<'CreateTrip'>>();
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState('User');
  const [profilePic, setProfilePic] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const { trips, loading, error } = useSelector(
    (state: RootState) => state.trips,
  );
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ];
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAllTrips() as any);
      fetchUserInfo();
      loadSelectedCurrency();
    }, []),
  );

  const loadSelectedCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      if (savedCurrency) {
        setSelectedCurrency(savedCurrency);
      } else {
        setSelectedCurrency('USD');
        await AsyncStorage.setItem('selectedCurrency', 'USD');
      }
    } catch (error) {
      console.log('Error loading currency:', error);
      setSelectedCurrency('USD');
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userStr = await AsyncStorage.getItem('userDetails');
      console.log('User Details:', userStr);
      if (!userStr) return;
      const user = JSON.parse(userStr);
      if (user.profile != null) {
        setProfilePic(user.profile || user.photo || '');
      }
      setUserName(user.firstName + ' ' + user.lastName || 'User');
    } catch (e) {
      setUserName('User');
    }
  };

  const filteredTrips = trips.filter(
    trip =>
      trip &&
      typeof trip.location === 'string' &&
      trip.location.toLowerCase().includes(search.toLowerCase()),
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

  const handleCurrencyChange = () => {
    const isOpen = showCurrencyDropdown;
    setShowCurrencyDropdown(!isOpen);

    Animated.timing(dropdownHeight, {
      toValue: isOpen ? 0 : 120, // Height for 2 currency options
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const convertCurrency = (
    from: string,
    to: string,
    amount: number,
  ): number => {
    if (from === to) return amount;

    const rates: Record<string, Record<string, number>> = {
      EUR: { USD: 1 },
      USD: { EUR: 0.86 },
    };

    const rate = rates[from]?.[to] ?? 1;
    console.log('Currency Rate ', rate);
    return parseFloat((amount * rate).toFixed(2));
  };

  const saveCurrency = async (currencyCode: string) => {
    try {
      await AsyncStorage.setItem('selectedCurrency', currencyCode);
      setSelectedCurrency(currencyCode);

      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setShowCurrencyDropdown(false);
      });

      console.log('Currency saved:', currencyCode);
    } catch (error) {
      console.log('Error saving currency:', error);
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || '$';
  };

  const formatPrice = (amount: number | string) => {
    if (!amount) return '';
    const symbol = getCurrencySymbol(selectedCurrency);
    return `${symbol}${amount}`;
  };

  const renderNoResults = () => (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>No trips found for "{search}"</Text>
      <Text style={styles.noResultsSubtext}>
        Try searching with a different location name
      </Text>
    </View>
  );

  const renderCurrencyDropdown = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.currencyButton,
          showCurrencyDropdown && styles.currencyButtonActive,
        ]}
        onPress={handleCurrencyChange}
      >
        <Text style={styles.currencyButtonText}>{selectedCurrency}</Text>
        <Text
          style={[
            styles.dropdownArrow,
            showCurrencyDropdown && styles.dropdownArrowUp,
          ]}
        >
          ▼
        </Text>
      </TouchableOpacity>

      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <View style={styles.dropdownContent}>
          {currencies.map(currency => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.dropdownOption,
                selectedCurrency === currency.code &&
                  styles.selectedDropdownOption,
              ]}
              onPress={() => saveCurrency(currency.code)}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  selectedCurrency === currency.code &&
                    styles.selectedDropdownOptionText,
                ]}
              >
                {currency.code}
              </Text>
              {selectedCurrency === currency.code && (
                <Text style={styles.dropdownArrow}>▲</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
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
          {renderCurrencyDropdown()}
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
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : trips && trips.length > 0 ? (
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
                  <TouchableOpacity>
                    <View style={styles.tripCard}>
                      <View style={{ position: 'relative' }}>
                        <Image
                          source={{ uri: item.imageUrl || '' }}
                          style={styles.tripImage}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.tripTitle}>
                          {item.location || 'Trip'}
                        </Text>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text style={styles.tripLocation}>
                            {`${formatDate(item.startDate)} - ${formatDate(
                              item.endDate,
                            )}` || ''}
                          </Text>
                        </View>
                        <Text style={styles.tripPrice}>
                          Budget:{' '}
                          {item.budget
                            ? formatPrice(
                                convertCurrency(
                                  selectedCurrency == 'USD' ? 'EUR' : 'USD',
                                  selectedCurrency,
                                  isNaN(parseFloat(item.budget)) ? 0 : parseFloat(item.budget),
                                ),
                              )
                            : ''}
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
            <TouchableOpacity style={styles.createBtn} onPress={handleAddTrip}>
              <AddIcon />
              <Text style={styles.createBtnText}>Create a New Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {trips && trips.length > 0 && (
          <TouchableOpacity
            style={styles.floatingBtn}
            onPress={() => navigation.navigate('CreateTrip')}
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
  currencyName: {
    fontSize: 12,
    color: '#A1A1A1',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#85CC16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedCurrencyOption: {
    backgroundColor: '#F0F8FF',
    borderColor: '#85CC16',
    borderWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  currencyButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 70,
  },
  currencyButtonActive: {
    backgroundColor: '#E8F4FD',
    borderColor: '#85CC16',
    borderWidth: 1,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginRight: 8,
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
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },
  dropdownArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 1001,
  },
  dropdownContent: {
    paddingVertical: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDropdownOption: {
    backgroundColor: '#F0F8FF',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  selectedDropdownOptionText: {
    color: '#85CC16',
    fontWeight: '600',
  },

  noResultsSubtext: {
    fontSize: 14,
    color: '#A1A1A1',
    textAlign: 'center',
  },
});
