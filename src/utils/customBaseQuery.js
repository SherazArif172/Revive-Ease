import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { base_url, unAuthorizedUser } from "../global/global";
import { MOCK_ENABLED, mockBaseQuery } from "../mocks";

const realBaseQuery = fetchBaseQuery({
  baseUrl: base_url,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQuery = MOCK_ENABLED ? mockBaseQuery : realBaseQuery;

const baseQueryWithReauth = async (args, api, extraOptions) => {

  const result = await baseQuery(args, api, extraOptions);

  // ✅ Handle errors and show custom message if present
  if (result?.error) {
    const status = result.error.status;
    const errorMessage =
      result.error.data?.message ||
      result.error.data?.error ||
      "An unexpected error occurred";

    if (status === 401 || status === 403) {
      unAuthorizedUser();
    }

    // 🛑 Attach readable message for UI to consume
    result.error.customMessage = errorMessage;
  }
  
  return result;
};

export default baseQueryWithReauth;