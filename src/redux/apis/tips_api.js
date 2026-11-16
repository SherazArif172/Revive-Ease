import { createApi } from "@reduxjs/toolkit/query/react";
import { setTips } from "../reducers/patientUseFullResourcesSlice";
import { toast } from "react-toastify";
import baseQueryWithReauth from "../../utils/customBaseQuery";

// Define a service using a base URL and expected endpoints
export const tipsSlice = createApi({
  reducerPath: "tips",
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Tips'],
  endpoints: (builder) => ({
    getAllTips: builder.query({
      query: ({page, rowsPerPage,actorId, actorType}) => `/admin/tiplist?page=${page}&limit=${rowsPerPage}&actorId=${actorId}&actorType=${actorType}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setTips(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
      providesTags: ["Tips"],
    }),
    deleteTips: builder.mutation({
      query: ({id,actorId, actorType}) => ({
        url: `/admin/deletetip/${id}?actorId=${actorId}&actorType=${actorType}`,
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Tip deleted successfully!");
          }
        } catch (err) {
          toast.error(err?.error?.data?.message);
        }
      },
      invalidatesTags: ["Tips"],
    }),
    addTips: builder.mutation({
      query: (data) => ({
        url: `/admin/addtip`,
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Tip added successfully!");
          }
        } catch (err) {
          toast.error(err?.error?.data?.message);
        }
      },
      invalidatesTags: ["Tips"],
    }),
    updateTips: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/edittip/${id}`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({status}, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (status === "Edit") {            
            toast.success("Tip Updated Successfully!"); 
          } else if(status === "status") {
            if (data.data.status === "active") {           
              toast.success("Tip Activated Successfully!"); 
            } else { 
              toast.success("Tip De-Activated Successfully!"); 
            }
          }
        } catch (err) {
          toast.error(err?.error?.data?.message);
        }
      },
      invalidatesTags: ["Tips"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetAllTipsQuery, useDeleteTipsMutation, useAddTipsMutation, useUpdateTipsMutation } = tipsSlice;
