import api from './api';
import {
  setTrips,
  setTripsLoading,
  setTripsError,
} from '../redux/slices/tripSlice';
import { AppDispatch } from '../redux/store';
import { Trip } from '../types';

export const fetchAllTrips = () => async (dispatch: AppDispatch) => {
  let allTrips: Trip[] = [];
  let page = 1;
  let hasNextPage = true;

  dispatch(setTripsLoading(true));
  try {
    while (hasNextPage) {
      const response = await api.get(`/trips?page=${page}&limit=10`);
      
      const trips = response.data.data.trips; // trips is an array
      const pagination = response.data.data.pagination;

      console.log('Fetched page trips:', trips);

      allTrips = allTrips.concat(trips);
      hasNextPage = pagination.currentPage < pagination.totalPages;
      console.log('Has next page:', hasNextPage);
      page++;
    }

    console.log('All fetched trips:', allTrips);
    dispatch(setTrips({ trips: allTrips }));
  } catch (error: any) {
    console.log(error?.message || 'Failed to fetch trips');
    dispatch(setTripsError(error?.message || 'Failed to fetch trips'));
  }
};

export const createTrip = async (tripData: any) => {
  try {
    console.log('Creating trip with data:', tripData);
    const formData = new FormData();
    if (tripData.image) {
      formData.append('image', {
        uri: tripData.image.uri,
        name: tripData.image.name,
        type: tripData.image.type,
      } as any);
    }

    formData.append('start_date', tripData.start_date);
    formData.append('end_date', tripData.end_date);
    formData.append('location', tripData.location);
    formData.append('budget', tripData.budget.toString());

    if (tripData.total_cost !== undefined) {
      formData.append('total_cost', tripData.total_cost.toString());
    }

    if (tripData.days && tripData.days.length > 0) {
      formData.append('days', JSON.stringify(tripData.days));
    }

    const response = await api.post('/trips', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    console.log(
      'Failed to add/edit trips',
      error?.response?.data || error.message,
    );
    return { success: false, error: error?.response?.data || error.message };
  }
};

export const updateTrip = async (tripData: any) => {
  try {
    console.log('Creating trip with data:', tripData);
    const formData = new FormData();

      formData.append('image', {
        uri: tripData.image.uri,
        name: tripData.image.name,
        type: tripData.image.type,
      } as any);

    formData.append('start_date', tripData.start_date);
    formData.append('end_date', tripData.end_date);
    formData.append('location', tripData.location);
    formData.append('budget', tripData.budget.toString());

    if (tripData.total_cost !== undefined) {
      formData.append('total_cost', tripData.total_cost.toString());
    }

    if (tripData.days && tripData.days.length > 0) {
      formData.append('days', JSON.stringify(tripData.days));
    }

    const response = await api.put(`/trips/${tripData.trip_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    console.log(
      'Failed to add/edit trips',
      error?.response?.data || error.message,
    );
    return { success: false, error: error?.response?.message };
  }
};
