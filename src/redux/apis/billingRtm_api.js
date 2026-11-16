import { createApi } from '@reduxjs/toolkit/query/react';
import { setBillingPolicies } from '../reducers/patientUseFullResourcesSlice';
import { toast } from 'react-toastify';
import baseQueryWithReauth from '../../utils/customBaseQuery';

export const billingPoliciesSlice = createApi({
  reducerPath: 'billingPolicies',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['billingPolicies'],
  endpoints: (builder) => ({
    getAllBillingPolicies: builder.query({
      query: ({ page, rowsPerPage,actorId, actorType}) => `/admin/billingpolicylist?page=${page}&limit=${rowsPerPage}&actorId=${actorId}&actorType=${actorType}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setBillingPolicies(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
      providesTags: ['billingPolicies'],
    }),
    downloadBillingPolicyFile: builder.mutation({
      query: ({  object_ID , type }) => ({
        url: `/admin/download/${type}/${object_ID}`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
      async onQueryStarted({ object_ID, fileName  }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
            
          // Create blob URL and trigger download
          const url = window.URL.createObjectURL(data);
          const link = document.createElement('a'); 
          link.href = url;
          link.download = fileName || `document_${object_ID}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          toast.success("File downloaded successfully!");
        } catch (err) {
          console.error('Download Error:', err);
          toast.error("Failed to download file");
        }
      },
    }),
    postBillingPolicies: builder.mutation({
      query: (formData) => {
        return {
          url: '/admin/addbillingpolicy',
          method: 'POST',
          body: formData,
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Billing policy added successfully!");
          }
        } catch (err) {
          toast.error(err?.error?.data?.message || "Failed to add billing policy");
        }
      },
      invalidatesTags: ['billingPolicies']
    }),
    updateBillingPolicies: builder.mutation({
      query: ({ payload, id }) => ({
        url: `/admin/editbillingpolicy/${id}`,
        method: 'PUT',
        body: payload,
      }),
      async onQueryStarted({ flag }, { queryFulfilled }) {

        try {
          const { data } = await queryFulfilled;
          if (flag === "Edit") {
            toast.success("Billing Updated Successfully!");
          } else if (flag === "status") {
            if (data.data.status === "active") {
              toast.success("Billing Activated Successfully!");
            } else {
              toast.success("Billing De-Activated Successfully!");
            }
          }
        } catch (err) {
          toast.error(err?.error?.data?.message);
        }
      },
      invalidatesTags: ['billingPolicies']
    }),
    deleteBillingPolicy: builder.mutation({
      query: ({id,actorId, actorType}) => ({
        url: `/admin/deletebillingpolicy/${id}?actorId=${actorId}&actorType=${actorType}`,
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {

        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Billing deleted successfully!");
          }
        } catch (err) {
          toast.error(err?.error?.data?.message);
        }
      },
      invalidatesTags: ['billingPolicies']
    })
  }),
});

export const { useGetAllBillingPoliciesQuery, usePostBillingPoliciesMutation, useUpdateBillingPoliciesMutation, useDeleteBillingPolicyMutation, useDownloadBillingPolicyFileMutation } = billingPoliciesSlice;
