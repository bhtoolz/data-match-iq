export type ECardCode =
  | 'BLS'
  | 'HSFA CPR AED'
  | 'HS CPR AED'
  | 'HSFA'
  | 'HS Pediatric FA CPR AED'
  | 'HS K-12'
  | 'BBP';

export interface ECardDefinition {
  code: ECardCode;
  title: string;
  category: 'Healthcare' | 'Heartsaver' | 'Specialty';
  description: string;
  unitPrice: number;
}

export interface InstructorRecord {
  name: string;
  status: 'Active' | 'Inactive' | string;
  authorizedCards: Record<ECardCode, boolean>;
}

export type TaxExemptChoice = 'yes' | 'no' | null;

export interface PersonalDetailsData {
  fullName: string;
  email: string;
  phone: string;
  fullAddress: string;
  city: string;
  country: string;
  state: string;
  zipCode: string;
}

export interface ECardCartItem {
  code: ECardCode;
  quantity: number;
}
