import { createApi } from '@reduxjs/toolkit/query/react';
import { setRtmGuidelines } from '../reducers/patientUseFullResourcesSlice';
import { toast } from 'react-toastify';
import baseQueryWithReauth from '../../utils/customBaseQuery';

export const RTMguidelinesSlice = createApi({
  reducerPath: 'RTMguidelines',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RTMGuidelines'],
  endpoints: (builder) => ({
    getAllRTMGuidelines: builder.query({
      query: ({page, rowsPerPage,actorId, actorType}) => `/admin/rtmguidelineslist?page=${page}&limit=${rowsPerPage}&actorId=${actorId}&actorType=${actorType}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if(data){
            dispatch(setRtmGuidelines(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
      providesTags: ['RTMGuidelines'],
    }),
    postRtmGuideLines: builder.mutation({
      query: (data) => ({
          url: '/admin/addrtmguidelines',
          method: 'POST',
          body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if(data){
            toast.success("RTM guideline added successfully!");
            }
          } catch (err) {
            toast.error(err?.error?.data?.message);
          }
      },
      invalidatesTags: ['RTMGuidelines']
    }),
    updateGuideLines: builder.mutation({
      query: ({ payload, id }) => ({  // Removed flag from here
        url: `/admin/editrtmguidelines/${id}`,
        method: 'PUT',
        body: payload,
      }),
      async onQueryStarted({ flag }, { queryFulfilled }) { // flag is used here
        try {
          const { data } = await queryFulfilled;
    
          if (flag === "Edit") {            
            toast.success("RTM Guideline Updated Successfully!"); 
          } else if (flag === "status") {
            if (data.data.status === "active") {           
              toast.success("RTM guideline Activated Successfully!"); 
            } else { 
              toast.success("RTM guideline De-Activated Successfully!"); 
            }
          }
        } catch (err) {
          toast.error(err?.error?.data?.message || "Something went wrong!");
        }
      },
      invalidatesTags: ['RTMGuidelines'],
    }),
    
    deleteRTMGuideLines: builder.mutation({
      query: ({id,actorId, actorType}) => ({
        url: `/admin/deletertmguidelines/${id}?actorId=${actorId}&actorType=${actorType}`,
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        
        try {
          const { data } = await queryFulfilled;
          if(data){
            toast.success("RTM guideline deleted successfully!");
            }
          } catch (err) {
            toast.error(err?.error?.data?.message);
          }
      },
      invalidatesTags: ['RTMGuidelines']
    })
  }),
});

export const { useGetAllRTMGuidelinesQuery, usePostRtmGuideLinesMutation, useUpdateGuideLinesMutation, useDeleteRTMGuideLinesMutation } = RTMguidelinesSlice;
