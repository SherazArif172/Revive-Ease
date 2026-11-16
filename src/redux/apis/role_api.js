import { createApi } from '@reduxjs/toolkit/query/react';
import { setMyCoachingNotes } from '../reducers/coachReducer';
import baseQueryWithReauth from '../../utils/customBaseQuery';
import { toast } from 'react-toastify';

export const roleSlice = createApi({
  reducerPath: 'role',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    updateRole: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/updateroleuser/${id}`,
        method: 'PUT',
        body: payload,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.message === "Coaching note added successfully") {
            toast.success("Note Added Successfully!");
          }
          else if (data?.message === "Coaching note deleted successfully") {
            toast.success("Note Deleted Successfully!");
          }
          else if (data?.message === "Outcome Deleted Successfully!") {
            toast.success(data?.message);
          }
          else if (data?.message !== "Questionnaire updated successfully.") {
            toast.success("Profile Update Successfully!");
          }
        
        } catch (error) {
          toast.error("Error:", error);
        }
      },
    }),
    getMyCoachingNotes: builder.query({
      query: ({ patientId, page, limit }) => {
        const params = new URLSearchParams();

        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        // Construct the URL for fetching patient details
        return `/coach/mycoachingnotes/${patientId}?${params.toString()}`;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setMyCoachingNotes(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
    }),
  }),
});

export const { useUpdateRoleMutation, useGetMyCoachingNotesQuery } = roleSlice;
