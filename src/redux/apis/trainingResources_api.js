import { createApi } from '@reduxjs/toolkit/query/react';
import { setTrainingResources } from '../reducers/patientUseFullResourcesSlice';
import { toast } from 'react-toastify';
import baseQueryWithReauth from '../../utils/customBaseQuery';

export const trainingResourcesSlice = createApi({
  reducerPath: 'trainingResources',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['trainingResources'],
  endpoints: (builder) => ({
    getAllTrainingResources: builder.query({
      query: ({page, rowsPerPage,actorId, actorType}) => `/admin/trainingresourcelist?page=${page}&limit=${rowsPerPage}&actorId=${actorId}&actorType=${actorType}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if(data){
            dispatch(setTrainingResources(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
      providesTags: ['trainingResources'],
    }),
    addTrainingResources: builder.mutation({
        query: (payload) => ({
            url: '/admin/addtrainingresource',
            method: 'POST',
            body: payload,
        }),
        async onQueryStarted(arg, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if(data){
            toast.success("Training resource added successfully!");
            }
          } catch (err) {
            toast.error(err?.error?.data?.message);
          }
        },       
        invalidatesTags: ["trainingResources"],
    }),
    updateTrainingResources: builder.mutation({
        query: ({payload, id}) => ({
            url: `/admin/edittrainingresource/${id}`,
            method: 'PUT',
            body: payload,
        }),
        async onQueryStarted({flag}, { queryFulfilled }) {
          
          try {
            const { data } = await queryFulfilled;
            if (flag === "Edit") {            
              toast.success("Training Resource Updated Successfully!"); 
            } else if (flag === "status") {
              if (data.data.status === "active") {           
                toast.success("Training Resource Activated Successfully!"); 
              } else { 
                toast.success("Training Resource De-Activated Successfully!"); 
              }
            }
            } catch (err) {
              toast.error(err?.error?.data?.message);
            }
          },      
        invalidatesTags: ["trainingResources"],
    }),
    deleteTrainingResources: builder.mutation({
        query: ({id,actorId, actorType}) => ({
            url: `/admin/deletetrainingresource/${id}?actorId=${actorId}&actorType=${actorType}`,
            method: 'PATCH',
        }),
        async onQueryStarted(arg, { queryFulfilled }) {
          
          try {
            const { data } = await queryFulfilled;
            if(data){
              toast.success("Training resource deleted successfully!");
              }
            } catch (err) {
              toast.error(err?.error?.data?.message);
            }
          },   
        invalidatesTags: ["trainingResources"],
    }),
  }),
});

export const { useGetAllTrainingResourcesQuery, useAddTrainingResourcesMutation, useDeleteTrainingResourcesMutation, useUpdateTrainingResourcesMutation } = trainingResourcesSlice;
