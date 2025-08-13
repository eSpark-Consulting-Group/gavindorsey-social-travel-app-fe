import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Trip } from '../../types';

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  loading: false,
  error: null,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setTrips: (state, action: PayloadAction<{ trips: Trip[] }>) => {
      state.trips = action.payload.trips;
      state.loading = false;
      state.error = null;
    },
    setTripsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTripsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTrips: (state) => {
      state.trips = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setTrips, setTripsLoading, setTripsError, clearTrips } = tripsSlice.actions;
export default tripsSlice.reducer;
