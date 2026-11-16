import { createApi } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { setMDNotes } from "../reducers/providerReducers";
import baseQueryWithReauth from "../../utils/customBaseQuery";

// Define a service using a base URL and expected endpoints
export const mdNotesSlice = createApi({
  reducerPath: "mdNotes",
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MD'],
  endpoints: (builder) => ({
    getAllMdNotes: builder.query({
      query: (id) => `/getmdnotes/${id}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setMDNotes(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
      providesTags: ["MD"],
    }),
    postMdNotes: builder.mutation({
      query: (data) => ({
        url: `/createmdnotes`,
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("MD Notes Added Successfully!");
          }
        } catch (error) {
          toast.error(error?.error?.data?.message);
        }
      },
      invalidatesTags: ["MD"],
    }),
    updateMdNotes: builder.mutation({
      query: ({ data, id }) => ({
        url: `/updatemdnote/${id}`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("MD Notes Updated Successfully!");
          }
        } catch (error) {
          toast.error(error?.error?.data?.message);
        }
      },
      invalidatesTags: ["MD"],
    }),
    deleteMdNotes: builder.mutation({
      query: (id) => ({
        url: `/deletemdnote/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("MD Notes Deleted Successfully!");
          }
        } catch (error) {
          toast.error(error?.error?.data?.message);
        }
      },
      invalidatesTags: ["MD"],
    }),
    deleteMonitoringHistory: builder.mutation({
      query: (id) => ({
        url: `/coach/deletecoachreport/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("History Deleted Successfully!");
          }
        } catch (error) {
          toast.error(error?.error?.data?.message);
        }
      },
      invalidatesTags: ["MD"],
    }),
    getPatientSignoffEscalations: builder.query({
      query: ({ patient_id, page = 1, limit = 10, month, status }) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (month) params.append('month', month);
        if (status) params.append('status', status);
        return `/patients/getpatientsignoffescalations/${patient_id}`;
      },
      providesTags: ["MD"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetAllMdNotesQuery, usePostMdNotesMutation, useDeleteMdNotesMutation, useUpdateMdNotesMutation, useDeleteMonitoringHistoryMutation, useGetPatientSignoffEscalationsQuery } = mdNotesSlice;
