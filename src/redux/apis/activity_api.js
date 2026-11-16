// src/redux/api/activitySlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { setActivity } from "../reducers/patientUseFullResourcesSlice";
import { toast } from "react-toastify";
import baseQueryWithReauth from "../../utils/customBaseQuery";

export const activitySlice = createApi({
  reducerPath: "activity",
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Activity'],
  endpoints: (builder) => ({
    getAllActivity: builder.query({
      query: ({ page, rowsPerPage ,actorId, actorType}) => `/admin/activitylist?page=${page}&limit=${rowsPerPage}&actorId=${actorId}&actorType=${actorType}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setActivity(data));
          }
        } catch (error) {
          console.error("Error fetching activity data:", error);
        }
      },
      providesTags: ["Activity"],
    }),
    deleteActivity: builder.mutation({
      query: ({id,actorId, actorType}) => ({
        url: `/admin/deleteactivity/${id}?actorId=${actorId}&actorType=${actorType}`,
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Activity deleted successfully!");
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to delete activity."}`);
        }
      },
      invalidatesTags: ["Activity"],
    }),
    addActivity: builder.mutation({
      query: (activity) => ({
        url: `/admin/addactivity`,
        method: 'POST',
        body: activity,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Activity added successfully!");
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to add activity."}`);
        }
      },
      invalidatesTags: ["Activity"],
    }),
    updateActivity: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/editactivity/${id}`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ status }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (status === "Edit") {
            toast.success("Activity Updated Successfully!");
          } else if (status === "status") {
            if (data?.data?.status === "active") {
              toast.success("Activity Activated Successfully!");
            } else {
              toast.success("Activity De-Activated Successfully!");
            }
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to update activity."}`);
        }
      },
      invalidatesTags: ["Activity"],
    })
  }),
});

export const {
  useGetAllActivityQuery,
  useDeleteActivityMutation,
  useAddActivityMutation,
  useUpdateActivityMutation,
} = activitySlice;
