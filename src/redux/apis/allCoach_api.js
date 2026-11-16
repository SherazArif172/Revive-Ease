import { createApi } from "@reduxjs/toolkit/query/react";
import { setCoachs, setUser } from "../reducers/coachReducer";
import baseQueryWithReauth from "../../utils/customBaseQuery";

// Define a service using a base URL and expected endpoints
export const coachSlice = createApi({
  reducerPath: "Coach",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["user"],
  endpoints: (builder) => ({
    getAllCoach: builder.query({
      query: () => `/coach/coachlisting`,
      transformResponse: (response) => {
        return response.data;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setCoachs(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
    }),
    getAllUser: builder.query({
      query: ({ searchText, filter, id, page, rowsPerPage, sortBy, sortOrder }) =>
        `/coachproviderlisting?searchtext=${searchText ? searchText : ""}` +
        `&datefrom=${filter?.startDate ? filter?.startDate : ""}` +
        `&dateto=${filter?.endDate ? filter?.endDate : ""}` +
        `&status=${filter?.status ? filter?.status : ""}` +
        `&userobjectId=${id ? id : ""}` +
        `&userType=${filter?.userType ? filter?.userType : ""}` +
        `&page=${page ? page : 1}` +
        `&limit=${rowsPerPage ? rowsPerPage : 10}` +
        `&sortBy=${sortBy ? sortBy : ""}` +
        `&sortOrder=${sortOrder ? sortOrder : ""}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setUser(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
      providesTags: ["user"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetAllCoachQuery, useGetAllUserQuery } = coachSlice;
