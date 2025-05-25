// src/assets/orderDummyData.js

export const orderDummyData = [
  {
    id: "order1",
    items: [
      { product: { name: "Stethoscope" }, quantity: 1 },
      { product: { name: "Thermometer" }, quantity: 2 }
    ],
    address: {
      fullName: "John Doe",
      area: "Kampala Central",
      city: "Kampala",
      state: "Central Region",
      phoneNumber: "+256 700 123456"
    },
    amount: 250000,
    date: "2025-05-20T10:30:00Z"
  },
  {
    id: "order2",
    items: [
      { product: { name: "Surgical Mask" }, quantity: 5 },
      { product: { name: "Hand Sanitizer" }, quantity: 1 }
    ],
    address: {
      fullName: "Jane Smith",
      area: "Ntinda",
      city: "Kampala",
      state: "Central Region",
      phoneNumber: "+256 701 654321"
    },
    amount: 120000,
    date: "2025-05-18T15:45:00Z"
  }
];
