export interface Trip {
  id: string;
  userId: string;
  createdBy: string;
  imageUrl: string | null;
  publicId: string | null;
  startDate: string;
  endDate: string;
  location: string;
  budget: string; 
  totalCost: string;
  createdAt: string;
  updatedAt: string;
  days: Day[];
}

export interface Day {
  [key: string]: any;
}