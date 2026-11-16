import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../../utils/customBaseQuery';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getChatNotifications: builder.query({
            query: (userId) => `/chat-notifications/${userId}`,
            providesTags: ['Notifications'],
        }),
        markChatMessagesAsRead: builder.mutation({
            query: ({ userId, chatId, billingId, notificationType }) => ({
                url: `/chat-notifications/mark-read`,
                method: 'POST',
                body: { userId, chatId, billingId, notificationType },
            }),
            invalidatesTags: ['Notifications'],
        }),
        // Escalation notifications (sign-off)
        getEscalationNotificationsCount: builder.query({
            query: ({ provider_id, clinic_id }) => {
                const params = new URLSearchParams();
                if (provider_id) params.append('provider_id', provider_id);
                if (clinic_id) params.append('clinic_id', clinic_id);
                return `/patients/escalation-notifications-count?${params.toString()}`;
            },
            providesTags: ['EscalationNotifications'],
        }),
        markEscalationNotificationAsRead: builder.mutation({
            query: ({ escalation_id, provider_id, clinic_id }) => ({
                url: `/patients/mark-escalation-notification-read`,
                method: 'POST',
                body: { escalation_id, provider_id, clinic_id },
            }),
            invalidatesTags: ['EscalationNotifications'],
        }),
        // Coach-facing provider response notifications
        getCoachProviderResponseNotifications: builder.query({
            query: (coach_id) => {
                const params = new URLSearchParams();
                if (coach_id) params.append('coach_id', coach_id);
                return `/patients/provider-response-notifications?${params.toString()}`;
            },
            providesTags: ['CoachProviderResponses'],
        }),
        getCoachProviderResponseNotificationsCount: builder.query({
            query: (coach_id) => {
                const params = new URLSearchParams();
                if (coach_id) params.append('coach_id', coach_id);
                return `/patients/provider-response-notifications-count?${params.toString()}`;
            },
            providesTags: ['CoachProviderResponses'],
        }),
        markCoachProviderResponseNotificationAsRead: builder.mutation({
            query: ({ response_id, coach_id }) => ({
                url: `/patients/mark-provider-response-notification-read`,
                method: 'POST',
                body: { response_id, coach_id },
            }),
            invalidatesTags: ['CoachProviderResponses'],
        }),
        getLatestEscalation: builder.query({
            query: ({ provider_id, clinic_id }) => {
                const params = new URLSearchParams();
                if (provider_id) params.append('provider_id', provider_id);
                if (clinic_id) params.append('clinic_id', clinic_id);
                return `/patient/latest-escalations?${params.toString()}`;
            },
            providesTags: ['EscalationNotifications'],
        }),
        // System Notifications (for admin and clinic admin)
        getSystemNotifications: builder.query({
            query: ({ userId, userType, page = 1, limit = 20 }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page);
                if (limit) params.append('limit', limit);
                return `/notifications/${userId}/${userType}?${params.toString()}`;
            },
            providesTags: ['SystemNotifications'],
        }),
        markSystemNotificationAsRead: builder.mutation({
            query: ({ notificationId, userId, userType }) => ({
                url: `/notifications/${notificationId}/mark-read`,
                method: 'POST',
                body: { userId, userType },
            }),
            invalidatesTags: ['SystemNotifications'],
        }),
        markAllSystemNotificationsAsRead: builder.mutation({
            query: ({ userId, userType }) => ({
                url: `/notifications/mark-all-read`,
                method: 'POST',
                body: { userId, userType },
            }),
            invalidatesTags: ['SystemNotifications'],
        }),
        getSystemUnreadNotificationCount: builder.query({
            query: ({ userId, userType }) => `/notifications/${userId}/${userType}/unread-count`,
            providesTags: ['SystemNotifications'],
        }),
    }),
});

export const { 
    useGetChatNotificationsQuery, 
    useGetLatestEscalationQuery, 
    useMarkChatMessagesAsReadMutation, 
    useGetEscalationNotificationsCountQuery, 
    useMarkEscalationNotificationAsReadMutation, 
    useGetCoachProviderResponseNotificationsQuery, 
    useGetCoachProviderResponseNotificationsCountQuery, 
    useMarkCoachProviderResponseNotificationAsReadMutation,
    useGetSystemNotificationsQuery,
    useMarkSystemNotificationAsReadMutation,
    useMarkAllSystemNotificationsAsReadMutation,
    useGetSystemUnreadNotificationCountQuery
} = notificationApi; 