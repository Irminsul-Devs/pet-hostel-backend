export interface IBooking {
  id?: number;
  bookingDate?: string;
  remarks?: string;
  petName: string;
  petType: string;
  bookingFrom: string;
  bookingTo: string;
  services: string[];
  petDob: string;
  petAge?: string;
  petFood: string;
  vaccinationCertificate?: string | null;
  petVaccinated: boolean;
  amount?: number;
  userId: number;
  customerId: number;
}

export interface IBookingWithCustomer extends IBooking {
  customer?: {
    name: string;
    email: string;
    mobile: string;
    dob: string;
    address: string;
  };
}
