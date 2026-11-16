import { createApi } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { setBillingSummary, setBillingStatus, setCptReports, setCreatedSession, setAllSession, setAllCallLogs, setBillingAgainData, setGetRTMBilling, setCreatedBillStatus } from "../reducers/billingReducer";
import baseQueryWithReauth from "../../utils/customBaseQuery";

export const billingApi = createApi({
    reducerPath: "billingApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Billing" , "AllCallLogs" , "RTMBilling"],
    endpoints: (builder) => ({

        addCallLog: builder.mutation({
            query: ({ billingId, payload }) => ({
                url: `/billing/add-call-log/${billingId}`,
                method: "POST",
                body: payload,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Call log added successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to add call log.");
                }
            },
            // This will automatically trigger getCallLogs to refetch since it provides "AllCallLogs" tag
            invalidatesTags: ["Billing", "AllCallLogs"],
           
        }),

        updateCallLog: builder.mutation({
            query: ({ coach_id, payload }) => ({
                url: `/billing/update-call-log/${coach_id}`,
                method: "PATCH",
                body: payload,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Call log updated successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to update call log.");
                }
            },
            invalidatesTags: ["Billing", "AllCallLogs"],
        }),

        getBillingSummaryByPatient: builder.query({
            query: ({ patient_id, month_Filter }) => {
                let queryParams = new URLSearchParams();

                if (patient_id) queryParams.append("patient_id", patient_id);

                if (month_Filter) queryParams.append("month_Filter", month_Filter);

                return `/billing/summary/${patient_id}?${queryParams.toString()}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setBillingSummary(data?.data));
                    }
                } catch (err) {
                    console.error("Error fetching billing summary:", err);
                }
            },
            providesTags: ["Billing"],
        }),
        getBillingReportStatus: builder.query({
            query: ({ clinic_id, billingPage, billingLimit, status, billingMonth }) => {
                let queryParams = new URLSearchParams();

                if (billingPage) queryParams.append("billingPage", billingPage);
                if (billingLimit) queryParams.append("billingLimit", billingLimit);
                if (status) queryParams.append("status", status);
                if (billingMonth) queryParams.append("billingMonth", billingMonth);
                return `/billing/clinic-patient/${clinic_id}?${queryParams.toString()}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setBillingStatus(data));
                    }
                } catch (err) {
                    console.error('Error fetching billing summary:', err);
                }
            },
            providesTags: ["BillingStatus"]
        }),
        // 🔹 Start Session
        startSession: builder.mutation({
            query: (data) => ({
                url: "/billing/start-session",
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Session started successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to start session.");
                }
            },
            invalidatesTags: ["Billing"],
        }),

        // 🔹 Pause Session
        pauseSession: builder.mutation({
            query: (data) => ({
                url: "/billing/pause-session",
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Session paused successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to pause session.");
                }
            },
            invalidatesTags: ["Billing"],
        }),

        // 🔹 Update Billing to "Ready to Bill"
        readyToBill: builder.mutation({
            query: (data) => ({
                url: "/billing/pending-status",
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Billing marked as Pending!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to update billing status.");
                }
            },
            invalidatesTags: ["Billing"],
        }),
        updateStatus: builder.mutation({
            query: (payload) => ({
                url: `/billing/update-status`,
                method: "PATCH",
                body: payload,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Status updated successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to update Session.");
                }
            },
            invalidatesTags: ["BillingStatus"],
        }),

        // 🔹 Get Billing Session (Admin)
        getCptReports: builder.query({

            query: ({ patient_id }) => {
                let queryParams = new URLSearchParams();
                return `/billing/get-cpt-reports/${patient_id}?${queryParams.toString()}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCptReports(data));
                } catch (err) {
                    console.error(err);
                }
            },
            providesTags: ["Billing"],
        }),

        // 🔹 Admin: Cancel Billing
        cancelBilling: builder.mutation({
            query: (data) => ({
                url: "/billing/cancel-billing",
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Billing session cancelled!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to cancel session.");
                }
            },
            invalidatesTags: ["Billing"],
        }),
        createSession: builder.mutation({
            query: (data) => ({
                url: "/create-session",
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setCreatedSession(data?.session));
                    }
                } catch (err) {
                    if (err?.error?.data?.message === "Session invalidated due to login from another device.") {
                        console.log(err?.error?.data?.message);
                    }
                    else {
                        toast.error(err?.error?.data?.message || "Failed to cancel session.");
                    }
                }
            },
        }),
        getAllSession: builder.query({
            query: ({ patient_id, sMonth }) =>
                sMonth ? `/session/${patient_id}?sMonth=${sMonth}` : `/session/${patient_id}`,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setAllSession(data));
                    }
                } catch (err) {
                    console.error('Query Error:', err);
                }
            },
            providesTags: ["allSession"]
        }),
        updateSession: builder.mutation({
            query: ({ patientId, data }) => ({
                url: `coach/update-session/${patientId}`,
                method: "PUT",
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Session updated successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to update Session.");
                }
            },
            invalidatesTags: ["allSession" , "RTMBilling"],
        }),
        createBilling: builder.mutation({
            query: ({ patient_id, data }) => ({
                url: `/billing/create-billing/${patient_id}`,
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Bill created successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to cancel session.");
                }
            },
        }),
        getCallLogs: builder.query({
            query: ({ searchText, page, limit, coach_id }) => {
                const params = new URLSearchParams();
                if (searchText) params.append("searchPatient", searchText);
                if (page) params.append("page", page);
                if (limit) params.append("limit", limit);
                return `/coach/get-call-logs/${coach_id}?${params.toString()}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setAllCallLogs(data));
                    }
                } catch (err) {
                    console.error('Query Error:', err);
                }
            },
            providesTags: ["AllCallLogs"],
        }),
        getBillingAssignedCpt: builder.query({
            query: ({ patient_id, coach_id, startDate, endDate }) => {
                let queryParams = new URLSearchParams();

                if (patient_id) queryParams.append("patient_id", patient_id);
                if (coach_id) queryParams.append("coach_id", coach_id);
                // Only add fromDate and toDate if BOTH are provided and valid (not default or undefined)
                if (startDate && endDate && startDate !== "1970-01-01" && endDate !== "1970-01-01") {
                    queryParams.append("fromDate", startDate);
                    queryParams.append("toDate", endDate);
                }
                return `/billing/get-billings?${queryParams.toString()}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setAllCallLogs(data));
                    }
                } catch (err) {
                    console.error('Query Error:', err);
                }
            },
        }),
        getRTMbilling: builder.query({
            query: ({ coach_id, searchText, sortOption, fromDate, toDate, Page = 1, Limit = 100 }) => {
                const queryParams = new URLSearchParams();

                const isValidDate = (dateStr) => {
                    const date = new Date(dateStr);
                    return (
                        date instanceof Date &&
                        !isNaN(date) &&
                        date.toISOString().slice(0, 10) !== "1970-01-01"
                    );
                };

                if (searchText) queryParams.append("searchQuery", searchText);
                if (Page) queryParams.append("Page", Page);
                if (Limit) queryParams.append("Limit", Limit);
                if (sortOption) queryParams.append("sortOption", sortOption);
                // Add fromDate and toDate only if both are valid
                if (isValidDate(fromDate) && isValidDate(toDate)) {
                    queryParams.append("fromDate", fromDate);
                    queryParams.append("toDate", toDate);
                }

                return `/billing/get-rtmbillings/${coach_id}?${queryParams.toString()}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setGetRTMBilling(data));
                    }
                } catch (err) {
                    console.error('Query Error:', err);
                }
            },
            providesTags: ["RTMBilling"],
        }),
        getCreatedBillStatus: builder.query({
            query: ({ patient_id, billing_id }) => ({
                url: `/patients/${patient_id}/billing/${billing_id}`,
                method: 'GET'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setCreatedBillStatus(data?.data));
                    }
                } catch (err) {
                    console.error('Error fetching billed session:', err);
                }
            },
        }),

        getBillingAgain: builder.query({
            query: ({ patient_id, billing_id }) => {
                // Support both formats: with billing_id or just patient_id
                if (billing_id) {
                    return `/billing/getretry/${patient_id}/${billing_id}`;
                }
                return `/billing/getretry/${patient_id}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setBillingAgainData(data));
                    }
                } catch (err) {
                    console.error('Query Error:', err);
                }
            },
        }),

        reUpdateSession: builder.mutation({
            query: ({ patientId, billing_id, data }) => ({
                url: `/billing/update-retry/${patientId}/${billing_id}`,
                method: "PATCH",
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Session updated successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to update Session.");
                }
            },
        }),
        updateSessionStatus: builder.mutation({
            query: (payload) => ({
                url: "/billing/update-session-status",
                method: "PATCH",
                body: {
                    sessionIds: payload?.sessionIds ?? [],
                    sessionStatus: payload?.sessionStatus ?? "Session Submitted",
                    actorId: payload?.actorId,
                    actorType: payload?.actorType,
                },
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Session status updated successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to update session status.");
                }
            },
            invalidatesTags: ["Billing", "BillingStatus"],
        }),
        reCreateBilling: builder.mutation({
            query: (arg) => ({
                url: `/billing/retry/${arg?.patient_id}/${arg?.billing_id}`,
                method: "PATCH",
                body: {
                    actorId: arg?.actorId,
                    actorType: arg?.actorType,
                    sessionIds: arg?.sessionIds ?? [],
                    sessionStatus: "Session Submitted",
                    ...(arg?.billing_comments != null && { billing_comments: arg.billing_comments }),
                },
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Bill re-created successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to cancel session.");
                }
            },
        }),
        updatePaymentStatus: builder.mutation({
            query: (payload) => ({
                url: `/billing/update-payment-details`,
                method: "PATCH",
                body: payload,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Payment details updated successfully!");
                } catch (err) {
                    toast.error(err?.error?.data?.message || "Failed to update payment details.");
                }
            },
            invalidatesTags: ["BillingStatus"],
        }),
    }),
});

export const {
    useGetBillingSummaryByPatientQuery,
    useStartSessionMutation,
    usePauseSessionMutation,
    useReadyToBillMutation,
    useCancelBillingMutation,
    useAddCallLogMutation,
    useUpdateCallLogMutation,
    useGetBillingReportStatusQuery,
    useUpdateStatusMutation,
    useGetCptReportsQuery,
    useCreateSessionMutation,
    useGetAllSessionQuery,
    useUpdateSessionMutation,
    useCreateBillingMutation,
    useGetCallLogsQuery,
    useGetBillingAssignedCptQuery,
    useGetBillingAgainQuery,
    useUpdateSessionStatusMutation,
    useReCreateBillingMutation,
    useReUpdateSessionMutation,
    useGetRTMbillingQuery,
    useGetCreatedBillStatusQuery,
    useUpdatePaymentStatusMutation
} = billingApi;
