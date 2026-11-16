import { createApi } from "@reduxjs/toolkit/query/react";
import { setAllClinics, setClinicsListing } from "../reducers/clinicReducer";
import { setClinicRecord } from "../reducers/clinicReducer";
import { toast } from "react-toastify";
import baseQueryWithReauth from "../../utils/customBaseQuery";

export const clinicSlice = createApi({
  reducerPath: "clinicApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Clinics", "Clinic", "updateClinic"],
  endpoints: (builder) => ({
    addClinic: builder.mutation({
      query: (clinicData) => ({
        url: "/addclinic",
        method: "POST",
        body: clinicData,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {

        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Clinic Added Successfully!");
          }
        } catch (err) {
          toast.error(err?.error?.data?.message);
        }
      },
      invalidatesTags: ["Clinics"],
    }),
    saveQRCode: builder.mutation({
      query: ({ clinicId, qrCode }) => {
        const formData = new FormData();
        formData.append('qrCode', qrCode); // qrCode should be a File object

        return {
          url: `/saveQRCode/${clinicId}`,
          method: "POST",
          body: formData, // Send as FormData
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) toast.success("QR Code saved successfully!");
        } catch (err) {
          toast.error(err?.error?.data?.message || "Failed to save QR code");
        }
      },
      invalidatesTags: ["Clinics"],
    }),

    downloadQRCode: builder.mutation({
      query: ({ clinicId, clinicCode }) => ({
        url: `/downloadQRCode/${clinicId}`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `clinic-${clinicCode}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          return { success: true };
        },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("QR Code downloaded successfully!");
        } catch (err) {
          toast.error(err?.error?.data?.message || "Failed to download QR code");
        }
      },
    }),
    getClinic: builder.query({
      query: ({ clinicData, filter, page, rowsPerPage, sortBy, sortOrder , revive_admin_id}) => ({
        url: `/getcliniclist?searchtext=${filter?.filterText || ''}&datefrom=${filter?.startDate || ""}&dateto=${filter?.endDate || ""}&status=${filter?.status || ""}&page=${page}&limit=${rowsPerPage}&sortBy=${sortBy || ""}&sortOrder=${sortOrder || ""}&revive_admin_id=${revive_admin_id}`,
        method: "GET",
        body: clinicData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setClinicsListing(data));
        } catch (err) {
          console.error("Query Error:", err);
        }
      },
      providesTags: ["Clinics"],
    }),
    getAllClinic: builder.query({
      query: ({ clinicData, filter, page, rowsPerPage, sortBy, sortOrder , revive_admin_id}) => ({
        url: `/getcliniclist?searchtext=${filter?.filterText || ''}&datefrom=${filter?.startDate || ""}&dateto=${filter?.endDate || ""}&status=${filter?.status || ""}&page=${page}&limit=${rowsPerPage}&sortBy=${sortBy || ""}&sortOrder=${sortOrder || ""}&revive_admin_id=${revive_admin_id}`,
        method: "GET",
        body: clinicData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAllClinics(data));
        } catch (err) {
          console.error("Query Error:", err);
        }
      },
      providesTags: ["Clinics"],
    }),

    getClinicRecord: builder.query({
      query: ({ id, filter, page, rowsPerPage, filterText }) => `/clinicrecord/${id}?searchtext=${filterText ? filterText : ''}&datefrom=${filter?.startDate ? filter?.startDate : ""}&dateto=${filter?.endDate ? filter?.endDate : ""}&status=${filter?.status ? filter?.status : ""}&userType=${filter?.userType ? filter?.userType : ""}&page=${page}&limit=${rowsPerPage}`,

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setClinicRecord(data));
        } catch (err) {
          console.error("Query Error:", err);
        }
      },
      providesTags: ["Clinic"]
    }),
    addClinicUser: builder.mutation({
      query: (userData) => ({
        url: '/addrolesuser',
        method: 'POST',
        body: userData,
      }),

      invalidatesTags: ["Clinic"]
    }),
    deleteClinicUser: builder.mutation({
      query: ({ id, reassigId, actorId, actorType }) => ({
        url: `/deleteuserrole/${id}?actorId=${actorId}&actorType=${actorType}`,
        method: 'PATCH',
        body:  reassigId
      }),
      invalidatesTags: ["Clinic"]
    }),
    updateClinicUser: builder.mutation({
      query: ({ userId, updateData }) => {
        return {
          url: `/updateroleuser/${userId}`,
          method: 'PUT',
          body: updateData
        };
      },
      invalidatesTags: ["Clinic"]
    }),
    updateClinic: builder.mutation({
      query: ({ id, payload }) => ({
        url: `updateclinic/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ["Clinic"]
    }),

    updateClinicPatient: builder.mutation({
      query: (data, id) => ({
        url: `/updateclinic/${id}`,
        method: 'PUT',
        body: data
      }),
      async onQueryStart(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Clinic De-Activated Successfully!");
          }
        } catch (err) {
          toast.error(err?.error?.data?.message);
        }
      },
      invalidatesTags: ["Clinic"]
    }),

    updateClinicStatus: builder.mutation({
      query: ({ clinicId, status, revive_admin_id }) => ({
        url: `/updateclinicstatus/${clinicId}`,
        method: 'PUT',
        body: { status, revive_admin_id },
      }),
      invalidatesTags: ["Clinic"] 
    }),

  }),
});

export const { useAddClinicMutation, useUpdateClinicMutation, useGetClinicQuery, useGetClinicRecordQuery, useAddClinicUserMutation, useUpdateClinicUserMutation, useDeleteClinicUserMutation, useUpdateClinicPatientMutation, useUpdateClinicStatusMutation, useSaveQRCodeMutation, useDownloadQRCodeMutation , useGetAllClinicQuery } = clinicSlice;

