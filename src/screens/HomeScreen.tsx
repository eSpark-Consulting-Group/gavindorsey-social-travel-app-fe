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
import Icon from 'react-native-vector-icons/Ionicons';

import {
  CloseIcon,
  NavigateIcon,
  SortIcon,
  FilterIcon,
  SearchIcon,
  LocationIcon,
  NotFavoriteIcon,
} from '../assets';

const userAvatar = 'https://randomuser.me/api/portraits/men/1.jpg';
const tripImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';

const categories = ['Adventure', 'Beach', 'Mountain'];
const lastSearch = [
  'Mountain',
  'Sky View',
  'River Side',
  'Hotel',
  'Armandina Hotel',
];

const recentTrips = [
  {
    id: '1',
    title: 'Moraine Lake',
    location: 'Canada',
    price: '$83',
    rating: 4.5,
    image: tripImage,
  },
  {
    id: '2',
    title: 'Moraine Lake',
    location: 'Canada',
    price: '$83',
    rating: 4.5,
    image: tripImage,
  },
  {
    id: '3',
    title: 'Moraine Lake',
    location: 'Canada',
    price: '$83',
    rating: 4.5,
    image: tripImage,
  },
];

export const HomeScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Adventure');
  const [showList, setShowList] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.hiText}>Hi, James</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LocationIcon />
              <Text style={styles.locationText}>Chicago, New York</Text>
            </View>
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
              placeholder="Search"
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#A1A1A1"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <FilterIcon height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBtn,
                selectedCategory === cat && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!showList ? (
          <View style={styles.centered}>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setShowList(true)}
            >
              <Icon name="add" size={22} color="#fff" />
              <Text style={styles.createBtnText}>Create a New Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.lastSearchRow}>
              <Text style={styles.lastSearchLabel}>Last Search</Text>
              <TouchableOpacity>
                <Text style={styles.clearAll}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lastSearchChips}>
              {lastSearch.map(item => (
                <View key={item} style={styles.lastSearchChip}>
                  <Text style={styles.lastSearchChipText}>{item}</Text>
                  <CloseIcon width={10} style={{ marginLeft: 4 }} />
                </View>
              ))}
            </View>

            <Text style={styles.recentViewedLabel}>Recent Viewed</Text>
            <FlatList
              data={recentTrips}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.tripCard}>
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.tripImage}
                    />
                    <NotFavoriteIcon style={styles.favoriteIcon} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.tripTitle}>{item.title}</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Icon name="location-sharp" size={13} color="#A1A1A1" />
                      <Text style={styles.tripLocation}>{item.location}</Text>
                      <Icon
                        name="star"
                        size={13}
                        color="#FFD700"
                        style={{ marginLeft: 8 }}
                      />
                      <Text style={styles.tripRating}>{item.rating}</Text>
                    </View>
                    <Text style={styles.tripPrice}>
                      {item.price}
                      <Text style={{ color: '#A1A1A1', fontSize: 13 }}>
                        /Person
                      </Text>
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.tripGoBtn}>
                    <NavigateIcon style={{ alignSelf: 'center' }} />
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </ScrollView>
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
  tripGoBtn: {
    backgroundColor: '#85CC16',
    borderRadius: 30,
    alignContent: 'center',
    height: 50,
    width: 50,
    paddingTop: 17,
    marginLeft: 8,
  },
});
