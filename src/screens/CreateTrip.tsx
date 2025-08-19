import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

import {
  AddBackgroundIcon,
  ArrowBack,
  CalendarIcon,
  CameraIcon,
} from '../assets';
import { useNavigation, useRoute } from '@react-navigation/native';

import { RootStackNavigationProp } from '../navigation/navigation';
import { createTrip, updateTrip } from '../services/tripsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapLocationSelector from '../components/MapLocationSelector';

interface Note {
  id: number;
  text: string;
  cost: number;
}

interface DayButtonProps {
  day: number;
  isSelected: boolean;
  onPress: () => void;
}

export const CreateTrip: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp<'Signup'>>();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [budget, setBudget] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [notes, setNotes] = useState<Note[]>([{ id: 1, text: '', cost: 0 }]);
  const [totalDays, setTotalDays] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [locationCoordinates, setLocationCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const route = useRoute();
  const editTrip = route.params && (route.params as any).trip;

  useEffect(() => {
    console.log('EditTrip:', editTrip);
    if (editTrip) {
      setLocationName(editTrip.location || '');
      setSelectedImage(editTrip.imageUrl || '');
      setStartDate(
        editTrip.startDate ? new Date(editTrip.startDate) : undefined,
      );
      setEndDate(editTrip.endDate ? new Date(editTrip.endDate) : undefined);
      setBudget(editTrip.budget || '');

      if (editTrip.days && editTrip.days.length > 0) {
        const formattedNotes = editTrip.days.map(
          (note: any, index: number) => ({
            id: note.dayNumber,
            text: note.notes || '',
            cost: parseFloat(note.cost) || 0,
          }),
        );
        setTotalDays(editTrip.days.length || 1);
        setNotes(formattedNotes);
      } else {
        setNotes([{ id: 1, text: '', cost: 0 }]);
        setTotalDays(1);
      }
      setSelectedDay(1);
    } else {
      setLocationName('');
      setSelectedImage('');
      setStartDate(undefined);
      setEndDate(undefined);
      setBudget('');
      setNotes([{ id: 1, text: '', cost: 0 }]);
      setTotalDays(1);
      setSelectedDay(1);
    }
  }, [editTrip]);

  useEffect(() => {
    applyConversion();
  }, [selectedCurrency]);

  useEffect(() => {
    if (totalDays > notes.length) {
      const newNotes = [...notes];
      for (let i = notes.length; i < totalDays; i++) {
        newNotes.push({ id: i + 1, text: '', cost: 0 });
      }
      setNotes(newNotes);
    }
  }, [totalDays, notes.length]);

  useEffect(() => {
    loadSelectedCurrency();
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ];

  const applyConversion = async () => {
    const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
    console.log('Idha aya hai');
    if (savedCurrency && savedCurrency !== selectedCurrency) {
      setBudget(prev => {
        const num = parseFloat(prev) || 0;
        return convertCurrency(savedCurrency, selectedCurrency, num).toString();
      });

      setNotes(prevNotes =>
        prevNotes.map(note => ({
          ...note,
          cost: convertCurrency(savedCurrency, selectedCurrency, note.cost),
        })),
      );

      await AsyncStorage.setItem('selectedCurrency', selectedCurrency);
    }
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

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const getTotalCost = (): number => {
    return notes.reduce((sum, note) => sum + (note.cost || 0), 0);
  };

  const getRemainingBudget = (): number => {
    const budgetNum = parseFloat(budget) || 0;
    return budgetNum - getTotalCost();
  };

  const handleImagePicker = (): void => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri || '');
      }
    });
  };

  const handleStartDateConfirm = (date: Date): void => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (date: Date): void => {
    if (!startDate) {
      Alert.alert('Invalid Date', 'Please select a start date first');
      return;
    }
    if (date < startDate) {
      Alert.alert('Invalid Date', 'End date cannot be before start date');
      return;
    }
    setEndDate(date);
    setShowEndDatePicker(false);
  };

  const addDay = (): void => {
    setTotalDays(prev => prev + 1);
  };

  const renderDayButtons = (): React.ReactNode => {
    const buttons: React.ReactNode[] = [];

    for (let i = 1; i <= totalDays; i++) {
      buttons.push(
        <DayButton
          key={i}
          day={i}
          isSelected={selectedDay === i}
          onPress={() => setSelectedDay(i)}
        />,
      );
    }
    return buttons;
  };

  const DayButton = ({ day, isSelected, onPress }: DayButtonProps) => (
    <TouchableOpacity
      style={[isSelected ? styles.dayButtonSelected : styles.dayButton]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.dayButtonText,
          isSelected && styles.dayButtonTextSelected,
        ]}
      >
        Day {day}
      </Text>
    </TouchableOpacity>
  );

  const loadSelectedCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
      if (savedCurrency) {
        setSelectedCurrency(savedCurrency);
      } else {
        // Default to USD
        setSelectedCurrency('USD');
      }
    } catch (error) {
      console.log('Error loading currency:', error);
      setSelectedCurrency('USD');
    }
  };

  const handleNoteTextChange = (text: string) => {
    const updated = [...notes];
    while (updated.length < selectedDay) {
      updated.push({ id: updated.length + 1, text: '', cost: 0 });
    }
    updated[selectedDay - 1] = { ...updated[selectedDay - 1], text };
    setNotes(updated);
  };

  const handleCostChange = (value: string) => {
    const updated = [...notes];
    while (updated.length < selectedDay) {
      updated.push({ id: updated.length + 1, text: '', cost: 0 });
    }
    updated[selectedDay - 1] = {
      ...updated[selectedDay - 1],
      cost: parseFloat(value) || 0,
    };
    setNotes(updated);
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || '$';
  };

  const saveTrip = async () => {
    if (!selectedImage) {
      Alert.alert('Missing Info', 'Please select a trip image.');
      return;
    }

    if (!startDate) {
      Alert.alert('Missing Info', 'Please select a start date.');
      return;
    }

    if (!endDate) {
      Alert.alert('Missing Info', 'Please select an end date.');
      return;
    }
    if (!locationName.trim()) {
      Alert.alert('Missing Info', 'Please enter a trip location.');
      return;
    }

    if (!budget || parseFloat(budget) <= 0) {
      Alert.alert('Missing Info', 'Please enter a valid budget.');
      return;
    }
    if (notes.some(note => !note.text.trim())) {
      Alert.alert('Missing Info', 'Please enter notes for each day.');
      return;
    }
    try {
      setLoading(true);
      console.log('Saving trip with data:');
      const payload: any = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        location: locationName,
        budget: parseFloat(budget),
        total_cost: getTotalCost(),
        days: notes.map((note, index) => ({
          day_number: note.id,
          notes: note.text,
          cost: note.cost,
        })),
      };
      payload.image = {
        uri: selectedImage,
        name: `trip_${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      console.log('selectedImage', selectedImage);
      let res;
      if (editTrip) {
        console.log('Edit new trip with payload:', payload);
        res = await updateTrip({ ...payload, trip_id: editTrip.id });
      } else {
        console.log('Creating new trip with payload:', payload);
        res = await createTrip(payload);
      }
      setLoading(false);
      if (res.success && res.data) {
        ToastAndroid.show(
          editTrip
            ? 'Trip updated successfully!'
            : 'Trip created successfully!',
          ToastAndroid.SHORT,
        );
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          res.error || 'Failed to save trip. Please try again.',
        );
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save trip. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
        >
          <ArrowBack />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editTrip ? 'Edit Trip' : 'Create Trip'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImagePicker}
        >
          <View>
            {!selectedImage ? (
              <View style={styles.placeHolder}>
                <CameraIcon />
              </View>
            ) : (
              <Image
                source={{ uri: selectedImage }}
                style={styles.tripImage}
                resizeMode="cover"
              />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.dateSection}>
          <TouchableOpacity
            style={styles.dateItem}
            onPress={() => setShowStartDatePicker(true)}
          >
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>
                {startDate
                  ? `From ${formatDate(startDate)}`
                  : 'Select Start Date'}
              </Text>
              <CalendarIcon />
            </View>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}> -</Text>

          <TouchableOpacity
            style={styles.dateItem}
            onPress={() => setShowEndDatePicker(true)}
          >
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>
                {endDate ? `End at ${formatDate(endDate)}` : 'Select End Date'}
              </Text>
              <CalendarIcon />
            </View>
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          open={showStartDatePicker}
          date={startDate ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          onConfirm={handleStartDateConfirm}
          onCancel={() => setShowStartDatePicker(false)}
        />

        <DatePicker
          modal
          open={showEndDatePicker}
          date={startDate ?? new Date()}
          mode="date"
          minimumDate={startDate}
          onConfirm={handleEndDateConfirm}
          onCancel={() => setShowEndDatePicker(false)}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trip Location</Text>
          <View style={styles.mapSectionContainer}>
            <MapLocationSelector
              onLocationSelect={(location, coordinates) => {
                setLocationName(location);
                setLocationCoordinates(coordinates || null);
                console.log('Selected location:', location, coordinates);
              }}
              initialValue={locationName}
            />
          </View>
        </View>
        <View></View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trip Budget</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>
              {getCurrencySymbol(selectedCurrency)}
            </Text>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Days</Text>
          <View style={styles.blueContainer}>
            <View style={styles.daysContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.daysScrollView}
              >
                {renderDayButtons()}
              </ScrollView>
              <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
                <AddBackgroundIcon />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Add Notes"
              value={notes[selectedDay - 1]?.text || ''}
              onChangeText={handleNoteTextChange}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today Cost</Text>
          <View style={styles.costInputContainer}>
            <Text style={styles.dollarSignGreen}>
              {getCurrencySymbol(selectedCurrency)}
            </Text>
            <TextInput
              style={styles.input}
              value={(notes[selectedDay - 1]?.cost || 0).toString()}
              onChangeText={handleCostChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.remainingBudgetContainer}>
          <View style={styles.remainingBudgetRow}>
            <Text style={styles.remainingBudgetLabel}>Remaining Budget : </Text>
            <Text style={styles.remainingBudgetAmount}>
              {getCurrencySymbol(selectedCurrency)}
              {getRemainingBudget().toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#4A90E2" />
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={saveTrip}>
              <Text style={styles.primaryButtonText}>
                {editTrip ? 'Edit Trip' : 'Save Trip'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  bar: {
    width: 3,
    backgroundColor: '#000000',
    borderRadius: 0.5,
  },
  bar1: { height: 3 },
  bar2: { height: 5 },
  bar3: { height: 7 },
  bar4: { height: 4, backgroundColor: '#D1D5DB' },
  wifiIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  battery: {
    width: 22,
    height: 12,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 2,
    marginLeft: 2,
    position: 'relative',
  },
  batteryFill: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 16,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginEnd: 40,
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    marginBottom: 16,
  },
  tripImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  dateSection: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dateItem: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    color: '#797777',
    marginEnd: 10,
    fontWeight: '400',
  },
  dateSeparator: {
    fontSize: 16,
    color: '#6B7280',
    marginHorizontal: 28,
    fontWeight: '400',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    height: 48,
  },
  dollarSign: {
    fontSize: 18,
    color: '#6B7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#6C9F1C',
    fontWeight: '600',
  },
  blueContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  daysScrollView: {
    flex: 1,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: '#989FA6',
    borderWidth: 1,
    marginRight: 8,
  },
  dayButtonSelected: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#B9EC63',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  dayButtonTextSelected: {
    color: '#000000',
  },
  addDayButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesInBlueContainer: {
    gap: 8,
  },
  noteTextInBlue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
  },
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
  },
  dollarSignGreen: {
    fontSize: 18,
    color: '#10B981',
    marginRight: 8,
  },
  mapSectionContainer: {
    height: 130,
  },
  costValue: {
    fontSize: 18,
    color: '#6C9F1C',
    fontWeight: '600',
  },
  remainingBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingBudgetLabel: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },

  remainingBudgetContainer: {
    alignItems: 'flex-end', // aligns content to the right
    marginRight: 16,
  },

  remainingBudgetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C9F1C',
  },
  placeHolder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteInput: {
    fontSize: 14,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#6C9F1C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
