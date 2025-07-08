// Purchase Order Service
// This file contains functions to manage Purchase Order data

import { BASE_URL, isAPI as useAPI } from "./authService";

// API Configuration Flags
const isApi = useAPI; // Use the same config as other services

// Set this to true if your API handles filtering/pagination on server-side
// If false, filtering and pagination will be done on client-side (recommended for consistency)
const useServerSideFiltering = true;

// Utility functions for date formatting (similar to getCustomStart/getCustomEnd)
export const getCustomStart = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  // Set to start of day
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split("T")[0];
};

export const getCustomEnd = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  // Set to end of day
  date.setHours(23, 59, 59, 999);
  return date.toISOString().split("T")[0];
};

// Dummy data matching actual API response format
const DUMMY_PURCHASE_ORDERS = [
  {
    id: "9eddfce3-7d85-436b-8253-d03b3e390c4a",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "8bf2c0d6-8ff1-4590-ab39-c6103cd93138",
    paymentType: 1,
    invoiceNo: "NONVERIFYED",
    cost: "252.60",
    retail: "252.60",
    total: "252.60",
    margin: "0.00",
    date: "2025-07-01",
    status: true,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-07-01T20:06:49.000Z",
    updatedAt: "2025-07-01T22:42:28.000Z",
    payee: {
      id: "8bf2c0d6-8ff1-4590-ab39-c6103cd93138",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "GHRA",
      contactName: "",
      phoneNo: "9999999999",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-03T22:27:10.000Z",
      updatedAt: "2025-06-03T22:27:10.000Z",
    },
  },
  {
    id: "9feb2e46-64dd-4eda-9c8f-a209fe87e36c",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verifered ",
    cost: "85.20",
    retail: "149.70",
    total: "85.20",
    margin: "43.09",
    date: "2025-07-01",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-07-01T22:41:29.000Z",
    updatedAt: "2025-07-01T22:41:55.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },

  {
    id: "0bc4a124-617d-482d-a123-ed0d3b229161",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #004",
    cost: "64.50",
    retail: "109.65",
    total: "64.50",
    margin: "45.15",
    date: "2025-06-28",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-28T12:00:00.000Z",
    updatedAt: "2025-06-28T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "a3dbc177-6290-4bcb-876d-38a53bfbc780",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #005",
    cost: "66.00",
    retail: "112.20",
    total: "66.00",
    margin: "46.20",
    date: "2025-06-27",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-27T12:00:00.000Z",
    updatedAt: "2025-06-27T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "70cbdee6-5cc9-435c-8ecd-36eb853959fb",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #006",
    cost: "67.50",
    retail: "114.75",
    total: "67.50",
    margin: "47.25",
    date: "2025-06-26",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-26T12:00:00.000Z",
    updatedAt: "2025-06-26T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "289dea84-de36-4fa0-9b2f-cec90d9c8691",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #007",
    cost: "69.00",
    retail: "117.30",
    total: "69.00",
    margin: "48.30",
    date: "2025-06-25",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-25T12:00:00.000Z",
    updatedAt: "2025-06-25T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "b85bbc81-5b8e-4f55-a63a-cfb26984baf2",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #008",
    cost: "70.50",
    retail: "119.85",
    total: "70.50",
    margin: "49.35",
    date: "2025-06-24",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-24T12:00:00.000Z",
    updatedAt: "2025-06-24T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "3c368568-a884-44b8-bd4c-0d0ebcb90b85",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #009",
    cost: "72.00",
    retail: "122.40",
    total: "72.00",
    margin: "50.40",
    date: "2025-06-23",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-23T12:00:00.000Z",
    updatedAt: "2025-06-23T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "a3e57af0-051b-4bcd-959f-8b3bf687eaf5",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #010",
    cost: "73.50",
    retail: "124.95",
    total: "73.50",
    margin: "51.45",
    date: "2025-06-22",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-22T12:00:00.000Z",
    updatedAt: "2025-06-22T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "ef78f451-51e2-4aa9-a9b5-3eea305d23cd",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #011",
    cost: "75.00",
    retail: "127.50",
    total: "75.00",
    margin: "52.50",
    date: "2025-06-21",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-21T12:00:00.000Z",
    updatedAt: "2025-06-21T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "7f052f04-ea9c-4469-9e0f-534bbd752d31",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #012",
    cost: "76.50",
    retail: "130.05",
    total: "76.50",
    margin: "53.55",
    date: "2025-06-20",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-20T12:00:00.000Z",
    updatedAt: "2025-06-20T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "627507c4-7d31-4ba7-9e0a-00be3b6f6a85",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #013",
    cost: "78.00",
    retail: "132.60",
    total: "78.00",
    margin: "54.60",
    date: "2025-06-19",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-19T12:00:00.000Z",
    updatedAt: "2025-06-19T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "06235674-382a-4d8b-ba29-a8aaa4f37448",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #014",
    cost: "79.50",
    retail: "135.15",
    total: "79.50",
    margin: "55.65",
    date: "2025-06-18",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-18T12:00:00.000Z",
    updatedAt: "2025-06-18T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "4058f61e-3722-4651-9f74-32610304e0ca",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #015",
    cost: "81.00",
    retail: "137.70",
    total: "81.00",
    margin: "56.70",
    date: "2025-06-17",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-17T12:00:00.000Z",
    updatedAt: "2025-06-17T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "95b87347-46d3-46f3-bfca-933cd5d03390",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #016",
    cost: "82.50",
    retail: "140.25",
    total: "82.50",
    margin: "57.75",
    date: "2025-06-16",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-16T12:00:00.000Z",
    updatedAt: "2025-06-16T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "e9339762-ae6d-476c-93b7-7a7b0df585b4",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #017",
    cost: "84.00",
    retail: "142.80",
    total: "84.00",
    margin: "58.80",
    date: "2025-06-15",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-15T12:00:00.000Z",
    updatedAt: "2025-06-15T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "55f8a9e1-45e7-494e-a91e-c8fae3a7790c",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #018",
    cost: "85.50",
    retail: "145.35",
    total: "85.50",
    margin: "59.85",
    date: "2025-06-14",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-14T12:00:00.000Z",
    updatedAt: "2025-06-14T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "36e62d88-0893-437e-8212-b4582dee6668",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #019",
    cost: "87.00",
    retail: "147.90",
    total: "87.00",
    margin: "60.90",
    date: "2025-06-13",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-13T12:00:00.000Z",
    updatedAt: "2025-06-13T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "b251d090-c0d6-445b-a531-4cdb7573ae37",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #020",
    cost: "88.50",
    retail: "150.45",
    total: "88.50",
    margin: "61.95",
    date: "2025-06-12",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-12T12:00:00.000Z",
    updatedAt: "2025-06-12T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "5ce8d568-b1bd-408e-90cd-cb9b85bc90f0",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #021",
    cost: "90.00",
    retail: "153.00",
    total: "90.00",
    margin: "63.00",
    date: "2025-06-11",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-11T12:00:00.000Z",
    updatedAt: "2025-06-11T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "1e9500a1-708f-48b3-823a-ce7cbbfbbf27",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #022",
    cost: "91.50",
    retail: "155.55",
    total: "91.50",
    margin: "64.05",
    date: "2025-06-10",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-10T12:00:00.000Z",
    updatedAt: "2025-06-10T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "e8de633f-2f38-4795-954a-8ec333aa7d6e",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #023",
    cost: "93.00",
    retail: "158.10",
    total: "93.00",
    margin: "65.10",
    date: "2025-06-09",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-09T12:00:00.000Z",
    updatedAt: "2025-06-09T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "da366f34-e5c7-4646-9f8f-9eac004bf2fa",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #024",
    cost: "94.50",
    retail: "160.65",
    total: "94.50",
    margin: "66.15",
    date: "2025-06-08",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-08T12:00:00.000Z",
    updatedAt: "2025-06-08T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
  {
    id: "c08352a0-303a-4da7-8a00-cffc905d32fd",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    paymentType: 3,
    invoiceNo: "Verified #025",
    cost: "96.00",
    retail: "163.20",
    total: "96.00",
    margin: "67.20",
    date: "2025-06-07",
    status: false,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-07T12:00:00.000Z",
    updatedAt: "2025-06-07T12:00:00.000Z",
    payee: {
      id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: null,
      barcode: "",
      name: "TEXAS JESMIN",
      contactName: "",
      phoneNo: "1234567891",
      email: "",
      fax: "",
      state: "",
      city: "",
      zipCode: "",
      accountNo: "",
      paymentMethod: "",
      address1: "",
      address2: "",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-07-01T20:11:14.000Z",
      updatedAt: "2025-07-01T20:11:14.000Z",
    },
  },
];

/**
 * Fetches Purchase Orders based on body parameters
 * @param {Object} body - Filter parameters
 * @param {number} body.paymentType - Payment type ID filter
 * @param {number} body.postatus - Status ID filter
 * @param {string} body.startDate - Start date (YYYY-MM-DD format)
 * @param {string} body.endDate - End date (YYYY-MM-DD format)
 * @param {number} body.locationId - Location ID filter
 * @param {number} body.page - Page number (default: 1)
 * @param {number} body.limit - Items per page (default: 10)
 * @returns {Promise<Object>} Promise that resolves to paginated purchase orders
 */
export const getPurchaseOrders = async (token, body = {}) => {
  try {
    let allOrders;

    // Ensure page and limit are always set for API calls
    const normalizedBody = {
      page: 1,
      limit: 10,
      ...body,
    };

    console.log("getPurchaseOrders original body:", body);
    console.log("getPurchaseOrders normalized body:", normalizedBody);

    if (isApi === true) {
      // API Call - when your backend is ready
      console.log(
        "Using API call to fetch purchase orders with body:",
        normalizedBody,
      );

      const response = await fetch(`${BASE_URL}/getAllPurchaseEntry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(normalizedBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchase orders from API");
      }

      const res = await response.json();
      console.log("getPurchaseOrders", res);

      if (useServerSideFiltering) {
        // If your API handles filtering and pagination on server-side
        return {
          status: res.status,
          message: res.message,
          data: res.data,
          Total: res.Total,
          pagination: res.pagination,
        };
      } else {
        // Client-side filtering (recommended for consistency)
        // API should return ALL purchase orders, filtering will be done below

        allOrders = res.data;
        // console.log("allOrder", allOrders);
      }
    } else {
      // Dummy Data - for development
      console.log("Using dummy data for purchase orders");
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      allOrders = DUMMY_PURCHASE_ORDERS;
    }

    // APPLY FILTERS TO BOTH API AND DUMMY DATA
    const {
      paymentType,
      postatus,
      startDate,
      endDate,
      locationId,
      vendorId,
      page = 1,
      limit = 10,
    } = normalizedBody;
    let filteredOrders = [...allOrders];

    // Filter by date range using date field from JSON
    if (startDate) {
      const startDateOnly = startDate.split("T")[0]; // Extract date part only
      filteredOrders = filteredOrders.filter(
        (order) => order.date >= startDateOnly,
      );
    }

    if (endDate) {
      const endDateOnly = endDate.split("T")[0]; // Extract date part only
      filteredOrders = filteredOrders.filter(
        (order) => order.date <= endDateOnly,
      );
    }

    // Payment type filter removed - show all payment types

    // Filter by status (false=Close, true=Open)
    if (postatus !== undefined && !isNaN(postatus)) {
      // Convert numeric postatus to boolean status (0=Close/false, 1=Open/true)
      const statusBoolean = parseInt(postatus) === 1;
      filteredOrders = filteredOrders.filter(
        (order) => order.status === statusBoolean,
      );
    }

    // Filter by location ID (UUID string)
    if (locationId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.locationId === locationId,
      );
    }

    // Filter by vendor ID
    if (vendorId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.payeeId === vendorId,
      );
    }

    // Sort by date (most recent first)
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate pagination
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // Calculate totals like the API response
    const totalCost = filteredOrders.reduce(
      (sum, order) => sum + parseFloat(order.cost),
      0,
    );
    const totalRetail = filteredOrders.reduce(
      (sum, order) => sum + parseFloat(order.retail),
      0,
    );

    // Return consistent response format for both API and dummy data
    return {
      status: "success",
      message: isApi
        ? "Data fetched from API successfully"
        : "all purchase entry get successully",
      data: paginatedOrders,
      Total: {
        cost: totalCost.toFixed(2),
        retail: totalRetail.toFixed(2),
      },
      pagination: {
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, totalItems),
      },
    };
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return {
      success: false,
      data: [],
      total: 0,
      message: "Failed to retrieve purchase orders",
      error: error.message,
    };
  }
};

/**
 * Gets a single Purchase Order by ID
 * @param {number} id - Purchase Order ID
 * @returns {Promise<Object>} Promise that resolves to purchase order object
 */
export const getPurchaseOrderById = async (id) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const order = DUMMY_PURCHASE_ORDERS.find((po) => po.id === parseInt(id));

    if (!order) {
      return {
        success: false,
        data: null,
        message: "Purchase order not found",
      };
    }

    return {
      success: true,
      data: order,
      message: "Purchase order retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve purchase order",
      error: error.message,
    };
  }
};

/**
 * Creates a new Purchase Order
 * @param {Object} orderData - Purchase Order data
 * @returns {Promise<Object>} Promise that resolves to created purchase order
 */
export const createPurchaseOrder = async (orderData) => {
  try {
    if (isApi === true) {
      // API Call
      console.log("Using API call to create purchase order");
      let res = await Instance.post("/createPurchaseEntry", orderData);
      return {
        status: res.data.status,
        message: res.data.message,
        data: res.data.data,
      };
    } else {
      // DUMMY DATA IMPLEMENTATION
      console.log("Using dummy data to simulate create purchase order");
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const newOrder = {
      id: Math.max(...DUMMY_PURCHASE_ORDERS.map((po) => po.id)) + 1,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real API, this would be saved to the database
    DUMMY_PURCHASE_ORDERS.push(newOrder);

    return {
      success: true,
      data: newOrder,
      message: "Purchase order created successfully",
    };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return {
      success: false,
      data: null,
      message: "Failed to create purchase order",
      error: error.message,
    };
  }
};

/**
 * Updates Purchase Order status specifically
 * @param {string} id - Purchase Order ID
 * @param {number} postatus - New status (0 = Open, 1 = Close, 2 = Cancelled)
 * @returns {Promise<Object>} Promise that resolves to updated purchase order
 */
export const updatePurchaseOrderStatus = async (id, postatus) => {
  try {
    if (isApi === true) {
      // API Call
      console.log("Using API call to update purchase order status");
      let res = await Instance.patch(`/updatePurchaseOrderStatus/${id}`, {
        postatus: postatus,
        updatedAt: new Date().toISOString(),
      });
      return {
        success: true,
        data: res.data.data,
        message: "Purchase order status updated successfully",
      };
    } else {
      // DUMMY DATA IMPLEMENTATION
      console.log("Using dummy data to simulate status update");
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Find the order in dummy data
      const orderIndex = DUMMY_PURCHASE_ORDERS.findIndex(
        (order) => order.id === id,
      );

      if (orderIndex === -1) {
        throw new Error("Purchase order not found");
      }

      const updatedOrder = {
        ...DUMMY_PURCHASE_ORDERS[orderIndex],
        status: postatus, // postatus parameter is actually a boolean now
        updatedAt: new Date().toISOString(),
      };

      // Update the dummy data
      DUMMY_PURCHASE_ORDERS[orderIndex] = updatedOrder;

      return {
        success: true,
        data: updatedOrder,
        message: "Purchase order status updated successfully",
      };
    }
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    return {
      success: false,
      data: null,
      message: "Failed to update purchase order status",
      error: error.message,
    };
  }
};

/**
 * Updates an existing Purchase Order
 * @param {number} id - Purchase Order ID
 * @param {Object} orderData - Updated purchase order data
 * @returns {Promise<Object>} Promise that resolves to updated purchase order
 */
export const updatePurchaseOrder = async (id, orderData) => {
  try {
    if (isApi === true) {
      // API Call
      console.log("Using API call to update purchase order");
      let res = await Instance.put(`/updatePurchaseEntry/${id}`, orderData);
      return {
        status: res.data.status,
        message: res.data.message,
        data: res.data.data,
      };
    } else {
      // DUMMY DATA IMPLEMENTATION
      console.log("Using dummy data to simulate update purchase order");
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const orderIndex = DUMMY_PURCHASE_ORDERS.findIndex(
      (po) => po.id === parseInt(id),
    );

    if (orderIndex === -1) {
      return {
        success: false,
        data: null,
        message: "Purchase order not found",
      };
    }

    const updatedOrder = {
      ...DUMMY_PURCHASE_ORDERS[orderIndex],
      ...orderData,
      updatedAt: new Date().toISOString(),
    };

    // In a real API, this would be updated in the database
    DUMMY_PURCHASE_ORDERS[orderIndex] = updatedOrder;

    return {
      success: true,
      data: updatedOrder,
      message: "Purchase order updated successfully",
    };
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return {
      success: false,
      data: null,
      message: "Failed to update purchase order",
      error: error.message,
    };
  }
};

/**
 * Deletes a Purchase Order
 * @param {string} token - Authentication token
 * @param {Object} purchaseOrder - Purchase Order object to delete
 * @returns {Promise<Object>} Promise that resolves to deletion result
 */
export const deletePurchaseOrder = async (token, purchaseOrder) => {
  try {
    if (isApi === true) {
      // API Call - Use updatePurchaseEntry endpoint with type: 1 for deletion
      console.log("Using API call to delete purchase order");

      const requestBody = {
        ...purchaseOrder,
        id: purchaseOrder.id,
        purchaseOrderId: purchaseOrder.id,
        isActive:false,
        type: 1,
      };

      const response = await fetch(`${BASE_URL}/updatePurchaseEntry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.status === "success",
        status: result.status,
        message: result.message,
      };
    } else {
      // DUMMY DATA IMPLEMENTATION
      console.log("Using dummy data to simulate delete purchase order");
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const orderIndex = DUMMY_PURCHASE_ORDERS.findIndex(
        (po) => po.id === purchaseOrder.id,
      );

      if (orderIndex === -1) {
        return {
          success: false,
          message: "Purchase order not found",
        };
      }

      // In a real API, this would be deleted from the database
      DUMMY_PURCHASE_ORDERS.splice(orderIndex, 1);

      return {
        success: true,
        message: "Purchase order deleted successfully",
      };
    }
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return {
      success: false,
      message: "Failed to delete purchase order",
      error: error.message,
    };
  }
};

/**
 * Gets Purchase Order statistics
 * @returns {Promise<Object>} Promise that resolves to statistics object
 */
export const getPurchaseOrderStats = async () => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const stats = {
      total: DUMMY_PURCHASE_ORDERS.length,
      open: DUMMY_PURCHASE_ORDERS.filter((po) => po.status === true).length,
      closed: DUMMY_PURCHASE_ORDERS.filter((po) => po.status === false).length,
      pending: 0, // No pending status in new API format
      totalValue: DUMMY_PURCHASE_ORDERS.reduce(
        (sum, po) => sum + parseFloat(po.total),
        0,
      ),
      totalRetailValue: DUMMY_PURCHASE_ORDERS.reduce(
        (sum, po) => sum + parseFloat(po.retail),
        0,
      ),
    };

    return {
      success: true,
      data: stats,
      message: "Statistics retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve statistics",
      error: error.message,
    };
  }
};

/**
 * Get all products for a specific purchase order
 * @param {string} token - Authentication token
 * @param {Object} body - Request body containing locationId, page, limit, purchaseOrderId
 * @returns {Promise<Object>} Promise that resolves to purchase order products
 */
export const getAllPurchaseOrderProduct = async (token, body) => {
  try {
    console.log("getAllPurchaseOrderProduct", body, token);
    if (isApi) {
      const response = await fetch(`${BASE_URL}/getAllPurchaseOrderProduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchase order products from API");
      }

      const res = await response.json();
      return res;
    } else {
      // Return dummy data for development matching API response format
      return {
        status: "success",
        message: "purchase order product get successfully",
        data: [
          {
            id: "87bce174-ecbd-4d31-be35-bf881de77aac",
            purchaseOrderProductId: "573ed6de-295e-4866-a09a-06361f5f888c",
            productPriceId: "3c5d8406-893a-46e9-80b8-cbdd78b92053",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "ddd35b5c-6525-4a23-b47a-005e621ea3bd",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "872018111449",
            vendorItemCode: "22341",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: false,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "TEST",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "e0a95e41-9151-4755-9d74-d3a85a573d9d",
            purchaseOrderProductId: "68e3f82c-42d0-469e-b18d-ab3e4e19a54b",
            productPriceId: "645fd420-45e8-4fce-9b51-b12714c335dc",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "600108737510",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: "",
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BODY SPRAY GOLD 150ML",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e62d13b44967",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e62d13b44267",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e62d13b14967",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e63d13b44967",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e62d43b44967",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e65d13b44967",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e62d33b44967",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
          {
            id: "f30415ec-9edb-4b6c-bfde-e62d11b44967",
            purchaseOrderProductId: "c0741b55-7898-4e98-9689-8e59f793de87",
            productPriceId: "3ea3e52d-5026-4c0c-9c39-8b7269e65503",
            priceType: 0,
            qty: 10,
            priceGroupId: "",
            locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
            franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
            categoryId: null,
            departmentId: "57d5894b-3f80-4862-874a-9319db6a9d2b",
            departmentLocationId: "7024dfdc-2dba-4fe7-a4d9-7922bf64504c",
            departmentTaxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            payeeId: "aad259a8-0acc-4303-afb1-a8e25049eec0",
            productType: 0,
            barCode: "888646706575",
            vendorItemCode: "",
            quantity: 10,
            unitCase: 1,
            caseCost: "2.84",
            caseDiscount: "0.00",
            unitAfterDiscount: "2.84",
            extdCaseCost: "28.40",
            unitRetail: "4.99",
            extdUnitRetail: "49.90",
            margin: "43.09",
            marginAfterRebate: "43.09",
            unitOfMeasure: null,
            size: "0",
            allowEbt: true,
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
            taxName: "no tax",
            taxAmount: "0.00",
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            minAge: "no restriction",
            name: "AXE BDY SPRY LTHR COKIES",
            rebate_Details: [],
            isActive: true,
            isDeleted: false,
            createdAt: "2025-07-01T22:41:51.000Z",
            updatedAt: "2025-07-01T22:41:51.000Z",
            type: 0,
          },
        ],
        Total: {
          unitCase: 3,
          caseDiscount: "0.00",
          currentQty: 30,
        },
        pagination: {
          totalItems: 5,
          currentPage: 1,
          totalPages: 1,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching purchase order products:", error);
    return {
      status: "error",
      message: "Failed to fetch purchase order products",
      error: error.message,
    };
  }
};

/**
 * Update purchase order product
 * @param {string} token - Authentication token
 * @param {Object} body - Request body containing locationId and Data array
 * @returns {Promise<Object>} Promise that resolves to update response
 */
export const updatePurchaseOrderProduct = async (token, body) => {
  try {
    console.log("updatePurchaseOrderProduct", body, token);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/updatePurchaseOrderProduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update purchase order product");
      }

      const res = await response.json();
      return res;
    } else {
      // Return dummy success response for development
      return {
        status: "success",
        message: "product updated successfully",
      };
    }
  } catch (error) {
    console.error("Error updating purchase order product:", error);
    return {
      status: "error",
      message: "Failed to update purchase order product",
      error: error.message,
    };
  }
};

/**
 * Delete purchase order product
 * @param {string} token - Authentication token
 * @param {string} purchaseOrderProductId - Purchase order product ID to delete
 * @returns {Promise<Object>} Promise that resolves to delete response
 */
export const deletePurchaseOrderProduct = async (token, deleteData) => {
  try {
    console.log("deletePurchaseOrderProduct", deleteData, token);

    const body = {
      purchaseOrderProductId: deleteData.purchaseOrderProductId,
      productPriceId: deleteData.productPriceId,
      quantity: -1,
    };

    if (isApi) {
      const response = await fetch(`${BASE_URL}/deletePurchaseOrderProduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to delete purchase order product");
      }

      const res = await response.json();
      return res;
    } else {
      // Return dummy success response for development
      return {
        status: "success",
        message: "Product deleted successfully",
      };
    }
  } catch (error) {
    console.error("Error deleting purchase order product:", error);
    return {
      status: "error",
      message: "Failed to delete purchase order product",
      error: error.message,
    };
  }
};

/**
 * Updates a Purchase Order entry
 * @param {string} token - Auth token
 * @param {Object} data - Purchase order update data
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const updatePurchaseEntry = async (token, data) => {
  try {
    const response = await fetch(`${BASE_URL}/updatePurchaseEntry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating purchase entry:", error);
    return {
      status: "error",
      message: "Failed to update purchase entry",
      error: error.message,
    };
  }
};

/**
 * Gets Purchase Order entry by ID for summary data
 * @param {string} token - Auth token
 * @param {Object} data - Request data with purchaseOrderId and locationId
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const getPurchaseEntryById = async (token, data) => {
  try {
    console.log("getPurchaseEntryById", data);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/getPurchaseEntryById`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } else {
      // Return mock data for development
      return {
        status: "success",
        message: "Purchase entry retrieved successfully",
        data: {
          id: data.purchaseOrderId,
          detailScannerEntries: {
            quantity: 150,
            caseCost: "1250.00",
            unitRetail: "1875.00",
          },
          totalQuantity: 150,
          totalCost: 1250.0,
          totalRetail: 1875.0,
          totalProfit: 625.0,
        },
      };
    }
  } catch (error) {
    console.error("Error getting purchase entry by ID:", error);
    return {
      status: "error",
      message: "Failed to get purchase entry",
      error: error.message,
    };
  }
};

/**
 * Add a new purchase entry
 * @param {string} token - Authentication token
 * @param {Object} data - Purchase entry data
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const addPurchaseEntry = async (token, data) => {
  try {
    console.log("addPurchaseEntry", data);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/addPurchaseEntry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } else {
      // Return mock data for development
      return {
        status: "success",
        message: "purchase entry created successully",
        id: `mock-po-${Date.now()}`,
      };
    }
  } catch (error) {
    console.error("Error adding purchase entry:", error);
    return {
      status: "error",
      message: "Failed to add purchase entry",
      error: error.message,
    };
  }
};

/**
 * Add purchase order products from EDI import
 * @param {string} token - Authentication token
 * @param {Object} body - Request body containing purchaseOrderId, locationId, newProduct, oldProduct arrays
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const addPurchaseOrderProductEdi = async (token, body) => {
  try {
    console.log("addPurchaseOrderProductEdi", body, token);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/addPurchaseOrderProductEdi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add EDI products to purchase order");
      }

      const res = await response.json();
      return res;
    } else {
      // Return dummy success response for development
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
      return {
        status: "success",
        message: "product updated successfully",
      };
    }
  } catch (error) {
    console.error("Error adding EDI products to purchase order:", error);
    return {
      status: "error",
      message: "Failed to add EDI products to purchase order",
      error: error.message,
    };
  }
};

// Export dummy data for development/testing purposes
export { DUMMY_PURCHASE_ORDERS };
