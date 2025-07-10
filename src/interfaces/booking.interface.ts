export interface IBooking {
  id?: number;
  bookingDate?: string;
  remarks?: string;
  ownerName: string;
  ownerMobile: string;
  ownerDob: string;
  ownerEmail: string;
  ownerAddress: string;
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
  userId?: number;
}
