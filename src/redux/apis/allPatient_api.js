import { createApi } from '@reduxjs/toolkit/query/react';
import { setAllPatientsGraph, setPatients, setSignOffPatients, setAllAuditLogs , setCloseWatchList } from '../reducers/patientReducer';
import { setPatientsById } from '../reducers/patientReducer';
import baseQueryWithReauth from '../../utils/customBaseQuery';

export const patientSlice = createApi({
  reducerPath: 'patient',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Patients'],
  endpoints: (builder) => ({
    getAllPatient: builder.query({
      query: ({ filterText, filter, coachId, providerId, clinic_id, page, rowsPerPage, currentTab, sortField, sortDirection }) => {
        const params = new URLSearchParams();
        if (filterText) params.append('searchtext', filterText);
        if (filter?.userId) params.append('patientId', filter?.userId);
        if (filter?.userName) params.append('patientName', filter?.userName);
        if (filter?.registrationDateFrom) params.append('registerDateFrom', filter?.registrationDateFrom);
        if (filter?.registrationDateTo) params.append('registerDateTo', filter?.registrationDateTo);
        if (filter?.coachName) params.append("coachName", filter?.coachName);
        if (filter?.provider) params.append("providerName", filter?.provider);
        if (filter?.diagnosis) params.append("diagnosis", filter?.diagnosis);
        if (filter?.insurance) params.append("insurance", filter?.insurance);
        if (coachId) params.append('coachObjectId', coachId);
        if (providerId) params.append('providerObjectId', providerId);
        if (clinic_id) params.append('clinic_id', clinic_id);

        // Add sorting parameters
        if (sortField) params.append('sortField', sortField);
        if (sortDirection) params.append('sortDirection', sortDirection);

        if (page) {
          if (currentTab === "Approved") {
            params.append('page', page);
          } else if (currentTab === "Pending Approval") {
            params.append('pendingPage', page);
          } else if (currentTab === "Deleted") {
            params.append('deletedPage', page);
          }
        }

        if (rowsPerPage) {
          if (currentTab === "Approved") {
            params.append('limit', rowsPerPage);
          } else if (currentTab === "Pending Approval") {
            params.append('pendingLimit', rowsPerPage);
          } else if (currentTab === "Deleted") {
            params.append('deletedLimit', rowsPerPage);
          }
        }

        if (filter?.coachNotAssigned) params.append('coachAssigned', filter?.coachNotAssigned == true ? false : true);

        return `/allpatient?${params.toString()}`;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setPatients(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
      providesTags: ['Patients'],
    }),
    assignCoachProviderToPatient: builder.mutation({
      query: ({ payload, patientId }) => ({
        url: `/updateroleuser/${patientId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Patients'],
    }),
    activatePatient: builder.mutation({
      query: ({ payload, patientId }) => ({
        url: `/updateroleuser/${patientId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Patients'],
    }),
    approvePendingPatient: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/updateroleuser/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['Patients'],
    }),

    getPatientById: builder.query({
      query: ({ id, page, rowsPerPage, currentTab, month, year, graphType, startDate, endDate, actorId, actorType, patientInfoTab }) => {
        const params = new URLSearchParams();
        console.log(graphType);
        if (page) {
          if (currentTab === "Approved") {
            params.append("assignedTaskPage", page);
          } else if (currentTab === "MD Notes") {
            params.append("mdnotesPage", page);
          } else if (currentTab === "coach_report") {
            params.append("coachToMdreport", page);
          } else if (currentTab === "Current Journey" || currentTab === "Journey") {
            params.append("assignedTaskJourneyPage", page);
          } else {
            params.append("coachToMdreportPage", page);
          }
        }
        if (rowsPerPage) {
          if (currentTab === "Approved") {
            params.append("assignedTaskLimit", rowsPerPage);
          } else if (currentTab === "MD Notes") {
            params.append("mdnotesLimit", rowsPerPage);
          } else if (currentTab === "coach_report") {
            params.append("coachToMdreportLimit", rowsPerPage);
          } else if (currentTab === "Current Journey" || currentTab === "Journey") {
            params.append("assignedTaskJourneyLimit", rowsPerPage);
          } else {
            params.append("coachToMdreportLimit", rowsPerPage);
          }
        }
        if (month) params.append("month", month);
        if (year) params.append("year", year);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (actorId) params.append("actorId", actorId);
        if (actorType) params.append("actorType", actorType);
        if (patientInfoTab) params.append("patientInfoTab", patientInfoTab);
        // Construct the URL for fetching patient details
        return `/getpateintdetails/${id}?${params.toString()}`;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            if (arg?.graphType === "onmount") {
              dispatch(setPatientsById(data));
              dispatch(setAllPatientsGraph(data));
            }
            else if (arg?.graphType === "Time_spent_on_time") {
              dispatch(setAllPatientsGraph(data));
            }
            else if (arg?.graphType === "Login_data") {
              dispatch(setPatientsById(data));
            }
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
      providesTags: ['PatientById'],
    }),

    updatePatientSignOff: builder.mutation({
      query: (payload) => ({
        url: `/patients/bulk-comments`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PatientSignOff'],
    }),


    getSignOffPatients: builder.query({
      query: ({ provider_id, clinic_id, provider_name, month, status, page, rowsPerPage, include_notifications }) => {
        const params = new URLSearchParams();

        // Add all parameters that have values
        if (provider_id) params.append('provider_id', provider_id);
        if (clinic_id) params.append('clinic_id', clinic_id);
        if (month) params.append('month', month);
        if (provider_name) params.append('provider_name', provider_name);
        if (status) params.append('status', status);
        params.append('page', page);
        params.append('limit', rowsPerPage);
        if (include_notifications) params.append('include_notifications', 'true');

        return `/patients/signoff-by-provider-or-clinic?${params.toString()}`;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setSignOffPatients(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
      providesTags: ['PatientSignOff'],
    }),

    getAuditLogs: builder.query({
      query: ({
        page,
        limit,
        sortField,
        sortOrder = 'asc',
        filters = {},
      } = {}) => {
        const {
          actorId,
          actorType,
          action,
          module,
          targetId,
          targetType,
          startDate,
          endDate,
        } = filters;

        const params = new URLSearchParams();

        if (actorId) params.append('actorId', actorId);
        if (actorType) params.append('actorType', actorType);

        if (action) {
          if (Array.isArray(action)) {
            action.forEach(a => params.append('action', a));
          } else {
            params.append('action', action);
          }
        }

        if (module) params.append('module', module);
        if (targetId) params.append('targetId', targetId);

        if (targetType) {
          if (Array.isArray(targetType)) {
            targetType.forEach(t => params.append('targetType', t));
          } else {
            params.append('targetType', targetType);
          }
        }

        if (sortField) params.append('sortField', sortField);
        if (sortOrder) params.append('sortOrder', sortOrder);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        return `/logs/audit-logs?${params.toString()}`;
      },

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setAllAuditLogs(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
    }),

    exportAuditLogsCSV: builder.query({
      query: (filters = {}) => {
        const {
          actorId,
          actorType,
          action,
          module,
          targetId,
          targetType,
          startDate,
          endDate,
          sortField = 'timestamp',
          sortOrder = 'asc',
        } = filters;

        const params = new URLSearchParams();

        if (actorId) params.append('actorId', actorId);
        if (actorType) params.append('actorType', actorType);

        if (action) {
          (Array.isArray(action) ? action : [action]).forEach(a => params.append('action', a));
        }

        if (targetType) {
          (Array.isArray(targetType) ? targetType : [targetType]).forEach(t => params.append('targetType', t));
        }

        if (module) params.append('module', module);
        if (targetId) params.append('targetId', targetId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sortField) params.append('sortField', sortField);
        if (sortOrder) params.append('sortOrder', sortOrder);
        // DO NOT pass pagination or sort to export
        return {
          url: `/audit-logs/export/csv?${params.toString()}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    getWatchListedPatients: builder.query({
      query: ({ id } = {}) => id
        ? `/provider/patients/watchlistedpatients/${id}`
        : `/provider/patients/watchlistedpatients`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setCloseWatchList(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
      providesTags: ['WatchListedPatient'],
    }),

  }),
});

export const { useGetAllPatientQuery, useAssignCoachProviderToPatientMutation, useApprovePendingPatientMutation, useGetPatientByIdQuery, useActivatePatientMutation, useGetSignOffPatientsQuery, useUpdatePatientSignOffMutation, useGetAuditLogsQuery, useLazyExportAuditLogsCSVQuery , useGetWatchListedPatientsQuery } = patientSlice;
