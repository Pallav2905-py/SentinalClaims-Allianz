/**
 * Demo Policy Data for Hackathon
 */

export const demoPolicies = [
  // Motor Insurance
  {
    policyNumber: 'MTR-2024-89234',
    provider: 'Allianz Insurance',
    insuranceType: 'motor',
    policyHolder: 'Demo User',
    status: 'active',
    startDate: '2024-01-15',
    expiryDate: '2025-01-14',
    premium: 15000,
    coverageAmount: 500000,
    specificFields: {
      vehicleNumber: 'MH-02-AB-1234',
      make: 'Honda',
      model: 'City',
      year: 2022,
      idv: 450000,
      engineNumber: 'HC22E1234567',
      chassisNumber: 'MALA0V1234567890',
      policyType: 'comprehensive',
      ncb: 20, // No Claim Bonus percentage
    },
  },
  
  // Health Insurance
  {
    policyNumber: 'HLT-2024-45678',
    provider: 'Allianz Health',
    insuranceType: 'health',
    policyHolder: 'Demo User',
    status: 'active',
    startDate: '2024-04-01',
    expiryDate: '2025-03-31',
    premium: 25000,
    coverageAmount: 1000000,
    specificFields: {
      memberId: 'HLT-MEM-001',
      insuredPerson: 'Demo User',
      dob: '1990-05-15',
      hospitalizationCover: 1000000,
      dailyHospitalCash: 2000,
      ambulanceCover: 5000,
      preExistingWaitingPeriod: 24, // months
      roomRent: 'Single AC',
    },
  },
  
  // Travel Insurance
  {
    policyNumber: 'TRV-2026-12345',
    provider: 'Allianz Travel',
    insuranceType: 'travel',
    policyHolder: 'Demo User',
    status: 'active',
    startDate: '2026-10-01',
    expiryDate: '2026-10-31',
    premium: 3500,
    coverageAmount: 100000,
    specificFields: {
      destination: 'Europe (Schengen)',
      travelDates: { from: '2026-10-15', to: '2026-10-30' },
      travellers: 1,
      passportNumber: 'P1234567',
      medicalCover: 50000,
      baggageLoss: 25000,
      flightDelay: 10000,
      tripCancellation: 15000,
    },
  },
  
  // Home Insurance
  {
    policyNumber: 'HOM-2024-67890',
    provider: 'Allianz Property',
    insuranceType: 'home',
    policyHolder: 'Demo User',
    status: 'active',
    startDate: '2024-06-01',
    expiryDate: '2025-05-31',
    premium: 12000,
    coverageAmount: 2500000,
    specificFields: {
      propertyAddress: 'Flat 402, Green Park Apartments, Mumbai - 400001',
      propertyType: 'Apartment',
      propertyValue: 2500000,
      structureCover: 2000000,
      contentsCover: 500000,
      earthquakeCover: true,
      floodCover: true,
      theftCover: true,
    },
  },
];

/**
 * Get insurance type metadata
 */
export function getInsuranceTypeInfo() {
  return {
    motor: {
      label: 'Motor Insurance',
      icon: '🚗',
      color: 'blue',
      description: 'Vehicle insurance coverage',
    },
    health: {
      label: 'Health Insurance',
      icon: '🏥',
      color: 'red',
      description: 'Medical and hospitalization coverage',
    },
    travel: {
      label: 'Travel Insurance',
      icon: '✈️',
      color: 'purple',
      description: 'Travel and trip protection',
    },
    home: {
      label: 'Home Insurance',
      icon: '🏠',
      color: 'green',
      description: 'Property and contents protection',
    },
  };
}

/**
 * Get required documents for claim types
 */
export function getRequiredDocuments(insuranceType, claimContext = {}) {
  const documents = {
    motor: [
      { id: 'policy', name: 'Insurance Policy', required: true },
      { id: 'rc', name: 'Registration Certificate (RC)', required: true },
      { id: 'dl', name: 'Driving License', required: true },
      { id: 'photos', name: 'Accident Photos', required: true },
      { id: 'estimate', name: 'Repair Estimate', required: false },
      { id: 'fir', name: 'FIR/Police Report', required: claimContext.policereport || false },
    ],
    
    health: [
      { id: 'policy', name: 'Insurance Policy', required: true },
      { id: 'bills', name: 'Hospital Bills', required: true },
      { id: 'discharge', name: 'Discharge Summary', required: true },
      { id: 'prescriptions', name: 'Prescriptions', required: true },
      { id: 'reports', name: 'Medical Reports/Tests', required: false },
      { id: 'id', name: 'ID Proof', required: true },
    ],
    
    travel: [
      { id: 'policy', name: 'Travel Insurance Policy', required: true },
      { id: 'tickets', name: 'Flight/Travel Tickets', required: true },
      { id: 'passport', name: 'Passport Copy', required: true },
      { id: 'receipts', name: 'Receipts/Bills', required: true },
      { id: 'fir', name: 'FIR (if theft/loss)', required: claimContext.theft || false },
      { id: 'medical', name: 'Medical Reports (if medical)', required: claimContext.medical || false },
    ],
    
    home: [
      { id: 'policy', name: 'Home Insurance Policy', required: true },
      { id: 'photos', name: 'Damage Photos', required: true },
      { id: 'ownership', name: 'Property Ownership Proof', required: true },
      { id: 'estimate', name: 'Repair/Replacement Estimate', required: false },
      { id: 'fir', name: 'FIR/Police Report', required: claimContext.theft || claimContext.vandalism || false },
      { id: 'bills', name: 'Purchase Bills (for contents)', required: false },
    ],
  };

  return documents[insuranceType] || [];
}
