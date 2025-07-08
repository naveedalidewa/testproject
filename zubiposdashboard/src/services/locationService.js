import { BASE_URL, isAPI as useAPI } from "./authService";

// Dummy location by ID data for testing
const DUMMY_LOCATION_BY_ID_RESPONSE = {
  status: "success",
  message: "location get successfully",
  data: {
    id: "e4184523-4f25-47cc-a40a-16fe9a472792",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    subscriptionId: "f1c42733-0faa-43b8-978f-df6b2a5704b8",
    subscriptionStatus: true,
    subscriptionName: "Advance",
    logo: null,
    email: "7-eleven@gmail.com",
    phone: "1234567890",
    password: "U2FsdGVkX1+Sh9lst1o5xiUjxTLuQNpHrB02Rqq0eW4=",
    businessType: "Convenience store",
    businessDescription:
      "7-Eleven, Inc. is an American convenience store chain, headquartered in Irving, Texas. It is a wholly owned subsidiary of Seven-Eleven Japan, which in turn is owned by the retail holdings company Seven & I Holdings.",
    name: "7-Eleven NY 10018",
    startDate: "2025-06-30T08:40:20.000Z",
    endDate: "2025-07-30T08:40:20.000Z",
    location: null,
    address: "535 8th Ave, New York, NY 10018, United States",
    paymentMethod: false,
    paymentType: null,
    amount: null,
    isActive: true,
    isDeleted: false,
    createdAt: "2025-05-30T16:29:16.000Z",
    updatedAt: "2025-07-05T03:23:07.000Z",
  },
};

// Dummy location data for testing
const DUMMY_LOCATIONS_RESPONSE = {
  status: "success",
  message: "location get successfully",
  data: [
    {
      id: "e4184523-4f25-47cc-a40a-16fe9a472792",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      subscriptionId: "f1c42733-0faa-43b8-978f-df6b2a5704b8",
      subscriptionStatus: true,
      logo: null,
      email: "7-eleven@gmail.com",
      phone: "1234567890",
      password: "U2FsdGVkX1+Sh9lst1o5xiUjxTLuQNpHrB02Rqq0eW4=",
      businessType: "Convenience store",
      businessDescription:
        "7-Eleven, Inc. is an American convenience store chain, headquartered in Irving, Texas. It is a wholly owned subsidiary of Seven-Eleven Japan, which in turn is owned by the retail holdings company Seven & I Holdings.",
      name: "7-Eleven NY 10018",
      startDate: "2025-06-30T08:40:20.000Z",
      endDate: "2025-07-30T08:40:20.000Z",
      location: null,
      address: "535 8th Ave, New York, NY 10018, United States",
      paymentMethod: false,
      paymentType: null,
      amount: null,
      isActive: true,
      isDeleted: false,
      createdAt: "2025-05-30T16:29:16.000Z",
      updatedAt: "2025-06-30T08:40:20.000Z",
      subscription: {
        id: "f1c42733-0faa-43b8-978f-df6b2a5704b8",
        type: 2,
      },
    },
    // {
    //   id: "9eddfce3-7d85-436b-8253-d03b3e390c4a",
    //   franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    //   subscriptionId: "f1c42733-0faa-43b8-978f-df6b2a5704b8",
    //   subscriptionStatus: true,
    //   logo: null,
    //   email: "MyTest@gmail.com",
    //   phone: "1234567890",
    //   password: "U2FsdGVkX1+Sh9lst1o5xiUjxTLuQNpHrB02Rqq0eW4=",
    //   businessType: "Convenience store",
    //   businessDescription:
    //     "7-Eleven, Inc. is an American convenience store chain, headquartered in Irving, Texas. It is a wholly owned subsidiary of Seven-Eleven Japan, which in turn is owned by the retail holdings company Seven & I Holdings.",
    //   name: "7MyEleven NY 10018",
    //   startDate: "2025-06-30T08:40:20.000Z",
    //   endDate: "2025-07-30T08:40:20.000Z",
    //   location: null,
    //   address: "Houston Texas, United States",
    //   paymentMethod: false,
    //   paymentType: null,
    //   amount: null,
    //   isActive: true,
    //   isDeleted: false,
    //   createdAt: "2025-05-30T16:29:16.000Z",
    //   updatedAt: "2025-06-30T08:40:20.000Z",
    //   subscription: {
    //     id: "f1c42733-0faa-43b8-978f-df6b2a5704b8",
    //     type: 2,
    //   },
    // },
  ],
};

export const locationService = {
  async getLocations(token) {
    if (!useAPI) {
      // Return dummy data
      return DUMMY_LOCATIONS_RESPONSE;
    }

    // Real API call
    try {
      const response = await fetch(`${BASE_URL}/getLocationV1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      console.log("getLocationV1", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch locations");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async getLocationById(locationId, token) {
    if (!useAPI) {
      // Return dummy data
      return DUMMY_LOCATION_BY_ID_RESPONSE;
    }

    // Real API call
    try {
      const response = await fetch(`${BASE_URL}/getLocationById`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locationId }),
      });

      const data = await response.json();
      console.log("getLocationById", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch location details");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};
