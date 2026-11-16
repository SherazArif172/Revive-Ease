import { createApi } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { setCoachAlertLog, setTemplate } from "../reducers/coachReducer";
import baseQueryWithReauth from "../../utils/customBaseQuery";
import { setProfileData } from "../reducers/userReducer";

export const coachPatientSlice = createApi({
    reducerPath: "coachPatients",
    baseQuery: baseQueryWithReauth,
    tagTypes: ['patients'],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: ({ category, subCategory }) => `/getcategory/filters?category=${category ? category : ""}&hierarchy=${subCategory ? subCategory : ""}`,
            providesTags: ["patients"],
        }),
        getTemplateDetails: builder.query({
            query: (id) => `/template/${id}`
        }),
        assignTask: builder.mutation({
            query: ({ data, id }) => ({
                url: `/updateroleuser/${id}`,
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Task Assigned Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
            invalidatesTags: ["patients"],
        }),
        templateDetailsUpdate: builder.mutation({
            query: (data) => ({
                url: `/template/activities/update`,
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Details Updated Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
            invalidatesTags: ["patients"],
        }),
        templateUpdate: builder.mutation({
            query: ({ data, id }) => ({
                url: `/template/update/${id}`,
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Task Updated Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
            invalidatesTags: ["patients"],
        }),
        deleteTask: builder.mutation({
            query: ({ id, payload }) => {
                return {
                    url: `/deletetask/${id}`,
                    method: 'DELETE',
                    body: payload
                };
            },
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Task Deleted Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
        }),
        addCoachReports: builder.mutation({
            query: (report) => ({
                url: '/coach/addcoachreport',
                method: 'POST',
                body: report,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Report Added Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
        }),
        sendAlertMsg: builder.mutation({
            query: (data) => ({
                url: `/sendalertmsg`,
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Alert Message Sended Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
        }),
        addTemplate: builder.mutation({
            query: (data) => ({
                url: `/template/create-template`,
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Template Added Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
        }),
        cloneTemplate: builder.mutation({
            query: ({ templateId, actorId, actorType }) => ({
                url: `/template/clone-template/${templateId}/${actorId}/${actorType}`,
                method: "POST",
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Template cloned successfully!");
                    }
                } catch (err) {
                    toast.error("Failed to clone template");
                }
            },
        }),
        getAllTemplate: builder.query({
            query: ({ page, rowsPerPage, patient_id, actorId, actorType }) => `/get-template?page=${page}&limit=${rowsPerPage}&patient_id=${patient_id}&actorId=${actorId}&actorType=${actorType}`,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setTemplate(data));
                    }
                } catch (error) {
                    console.error("Error fetching coach data:", error);
                }
            },

        }),
        deleteTemplate: builder.mutation({
            query: ({ id, body }) => ({
                url: `/deletetemplate/${id}`,
                method: 'Delete',
                body: body,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        console.log(data);
                        toast.success(data?.message);
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
        }),
        deleteTemplateDetail: builder.mutation({
            query: ({ templateId, rowId }) => {
                return {
                    url: `/templates/${templateId}/row/${rowId}`,
                    method: 'Delete',
                };
            },
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Task Deleted Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
        }),
        getCoachAlerLog: builder.query({
            query: ({ coachId, providerId, patientId }) => {
                const params = new URLSearchParams();

                if (coachId) params.append('coach_id', coachId);
                if (providerId) params.append('provider_id', providerId);
                if (patientId) params.append('patient_id', patientId);

                return `/get/getalertlisting?${params.toString()}`;
            },
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setCoachAlertLog(data));
                    }
                } catch (error) {
                    console.error("Error fetching coach data:", error);
                }
            },
        }),
        sendEmail: builder.mutation({
            query: (data) => ({
                url: `/coach/sendemail`,
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        toast.success("Email Sent Successfully!");
                    }
                } catch (err) {
                    toast.error(err?.error?.data?.message);
                }
            },
        }),
        getProfileDetailsById: builder.query({
            query: (id) => `/getprofile/${id}`,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data) {
                        dispatch(setProfileData(data?.data?.user));
                    }
                } catch (error) {
                    console.error("Error fetching coach data:", error);
                }
            },
        }),
    }),
});

// Export hooks for usage in functional components
export const { useTemplateDetailsUpdateMutation, useDeleteTemplateDetailMutation, useGetTemplateDetailsQuery, useGetProfileDetailsByIdQuery, useTemplateUpdateMutation, useSendEmailMutation, useAssignTaskMutation, useGetCategoriesQuery, useSendAlertMsgMutation, useAddCoachReportsMutation, useDeleteTaskMutation, useGetAllTemplateQuery, useAddTemplateMutation, useCloneTemplateMutation, useDeleteTemplateMutation, useGetCoachAlertMessageQuery, useGetCoachAlerLogQuery } = coachPatientSlice;
