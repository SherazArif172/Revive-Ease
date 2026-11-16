import { createApi } from "@reduxjs/toolkit/query/react";
import { setLearn } from "../reducers/patientUseFullResourcesSlice";
import { toast } from "react-toastify";
import baseQueryWithReauth from "../../utils/customBaseQuery";

// Define a service using a base URL and expected endpoints
export const learnSlice = createApi({
  reducerPath: "learn",
  baseQuery: baseQueryWithReauth,
  tagTypes: ['learn'],
  endpoints: (builder) => ({
    getAllLearn: builder.query({
      query: ({page, rowsPerPage,actorId, actorType}) => `/admin/learnlist?page=${page}&limit=${rowsPerPage}&actorId=${actorId}&actorType=${actorType}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setLearn(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
      providesTags: ["learn"],
    }),
    deleteLearn: builder.mutation({
      query: ({id,actorId, actorType}) => ({
        url: `/admin/deletelearn/${id}?actorId=${actorId}&actorType=${actorType}`,
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Learn deleted successfully!");
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to delete learn."}`);
        }
      },
      invalidatesTags: ["learn"],
    }),
    addLearn: builder.mutation({
      query: (data) => ({
        url: `/admin/addlearn`,
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Learn added successfully!");
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to add learn."}`);
        }
      },
      invalidatesTags: ["learn"],
    }),
    updateLearn: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/editlearn/${id}`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({status}, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if (status === "Edit") {            
            toast.success("Learn Updated Successfully!"); 
          } else if(status === "status") {
            if (data.data.status === "active") {           
              toast.success("Learn Activated Successfully!"); 
            } else { 
              toast.success("Learn De-Activated Successfully!"); 
            }
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to update learn."}`);
        }
      },
      invalidatesTags: ["learn"],
    })
  }),
});

// Export hooks for usage in functional components
export const { useGetAllLearnQuery, useDeleteLearnMutation, useAddLearnMutation, useUpdateLearnMutation } = learnSlice;