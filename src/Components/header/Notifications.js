import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetChatNotificationsQuery,
    useMarkChatMessagesAsReadMutation,
    useGetEscalationNotificationsCountQuery,
    useMarkEscalationNotificationAsReadMutation,
    useGetCoachProviderResponseNotificationsQuery,
    useGetCoachProviderResponseNotificationsCountQuery,
    useMarkCoachProviderResponseNotificationAsReadMutation,
    useGetLatestEscalationQuery,
    useGetSystemNotificationsQuery,
    useMarkSystemNotificationAsReadMutation,
    useMarkAllSystemNotificationsAsReadMutation,
    useGetSystemUnreadNotificationCountQuery
} from '../../redux/apis/notification_api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const userId = useSelector((state) => state?.user?.id);
    const userType = useSelector((state) => state?.user?.userType);
    const clinicId = useSelector((state) => state?.user?.profileData?.clinic_id);

    const { data, refetch, isLoading } = useGetChatNotificationsQuery(userId, { skip: !userId });
    const [markAsRead] = useMarkChatMessagesAsReadMutation();

    // Escalation (sign-off) notifications count
    const { data: escalationData, refetch: refetchEscalations } = useGetEscalationNotificationsCountQuery(
        {
            provider_id: userType === 'provider' ? userId : undefined,
            clinic_id: userType === 'clinic admin' ? clinicId : undefined,
        },
        { skip: !userId || !(userType === 'provider' || userType === 'clinic admin') }
    );

    // Latest escalation per provider/clinic
    const { data: latestEscalationData, refetch: refetchLatestEscalation } = useGetLatestEscalationQuery(
        {
            provider_id: userType === 'provider' ? userId : undefined,
            clinic_id: userType === 'clinic admin' ? clinicId : undefined,
        },
        { skip: !userId || !(userType === 'provider' || userType === 'clinic admin') }
    );

    // Extract the latest escalations and filter unread
    const allEscalations = latestEscalationData?.data || [];
    const escalationList = allEscalations
        .map(patient => {
            const escalation = patient.latestEscalation;
            if (!escalation) return null;

            return {
                patientId: patient._id,
                patientName: `${patient.last_name} ${patient.middle_name || ""} ${patient.first_name}`.trim(),
                patientEmail: patient.email,
                clinicId: patient.clinic_id,
                patientCode: patient.patient_id,
                escalationId: escalation._id,
                escalatedBy: escalation.escalatedBy,
                escalatedTo: escalation.escalatedTo,
                comment: escalation.comment_to_provider,
                status: escalation.status,
                isAcknowledged: escalation.isAcknowledged,
                acknowledgedBy: escalation.acknowledgedBy,
                acknowledgedByClinic: escalation.acknowledgedByClinic,
                createdAt: escalation.createdAt,
                resolvedAt: escalation.resolvedAt,
                providerResponse: escalation.providerResponse
            };
        })
        .filter(e => e !== null);
    const [markEscalationRead] = useMarkEscalationNotificationAsReadMutation();

    // Coach notifications
    const { data: coachResponseList, refetch: refetchCoachResponses } = useGetCoachProviderResponseNotificationsQuery(
        userType === 'coach' ? userId : undefined,
        { skip: userType !== 'coach' || !userId }
    );
    const { data: coachResponseCount, refetch: refetchCoachResponsesCount } = useGetCoachProviderResponseNotificationsCountQuery(
        userType === 'coach' ? userId : undefined,
        { skip: userType !== 'coach' || !userId }
    );
    const [markCoachResponseRead] = useMarkCoachProviderResponseNotificationAsReadMutation();

    // System Notifications (for admin and clinic admin)
    const { data: systemNotificationsData, refetch: refetchSystemNotifications } = useGetSystemNotificationsQuery(
        {
            userId: (userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') ? userId : undefined,
            userType: (userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') ? userType : undefined,
            page: 1,
            limit: 20
        },
        { skip: !userId || !(userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') }
    );
    const { data: systemUnreadCountData, refetch: refetchSystemUnreadCount } = useGetSystemUnreadNotificationCountQuery(
        {
            userId: (userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') ? userId : undefined,
            userType: (userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') ? userType : undefined
        },
        { skip: !userId || !(userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') }
    );
    const [markSystemNotificationAsRead] = useMarkSystemNotificationAsReadMutation();
    const [markAllSystemNotificationsAsRead] = useMarkAllSystemNotificationsAsReadMutation();

    // Unread counts
    const unreadMessages = data?.unreadMessages || [];
    const unreadChatCount = data?.unreadCount || 0;
    const unreadEscalations = escalationData?.data?.unreadEscalations || 0;
    const coachResponses = coachResponseList?.data?.notifications || [];
    const coachUnreadCount = coachResponseCount?.data?.unreadResponses || 0;
    const systemNotificationsRaw = systemNotificationsData?.notifications || [];
    const systemUnreadCount = systemUnreadCountData?.unreadCount || 0;

    // Clinic admin and sub admin: exclude bill created, cancelled, and retried notifications
    const BILL_NOTIFICATION_TYPES = ['billing_created', 'billing_cancelled', 'billing_retried'];
    const systemNotifications =
        userType === 'clinic admin' || userType === 'sub admin'
            ? systemNotificationsRaw.filter((n) => !BILL_NOTIFICATION_TYPES.includes(n?.type))
            : systemNotificationsRaw;
    const systemUnreadCountForUser =
        userType === 'clinic admin' || userType === 'sub admin'
            ? systemNotifications.filter((n) => !n?.isRead).length
            : systemUnreadCount;

    // Filter billing cancellation notifications from chat notifications API (unreadMessages)
    const billingCancellations = unreadMessages.filter(msg => msg.type === 'billing_cancelled');
    const chatMessages = unreadMessages.filter(msg => msg.type !== 'billing_cancelled');
    const providerResponses = coachResponses.filter(n => n?.type !== 'billing_cancelled');
    const providerResponsesUnread = providerResponses.filter(n => n?.isRead === false);

    const unreadCount = (userType === 'coach')
        ? (unreadChatCount + coachUnreadCount)
        : (userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin')
            ? systemUnreadCountForUser
            : (unreadChatCount + unreadEscalations);

    const clearAllNotifications = async () => {
        if (!userId || unreadMessages.length === 0) return;
        const chatIds = [...new Set(unreadMessages.map(msg => msg.chatId))];
        await Promise.all(chatIds.map(chatId => markAsRead({ userId, chatId })));
        refetch();
    };

    const markMessageChatAsRead = async (chatId) => {
        if (!userId || !chatId) return;
        await markAsRead({ userId, chatId });
        refetch();
    };

    // Mark billing cancellation notification as read
    const markBillingCancellationAsRead = async (billingId) => {
        if (!userId || !billingId) return;
        // Use the chat notifications mark-read endpoint with billingId and notificationType
        await markAsRead({ userId, billingId, notificationType: 'billing_cancelled' });
        refetch();
    };

    // Mark escalation as read
    const markEscalationAsRead = async (escalationId) => {
        if (!userId || !escalationId) return;

        const payload = { escalation_id: escalationId };

        if (userType === "provider") {
            payload.provider_id = userId;
        } else if (userType === "clinic admin") {
            payload.clinic_id = clinicId;
        } else {
            console.warn("Unsupported user type for escalation acknowledgment");
            return;
        }

        await markEscalationRead(payload);
        refetchEscalations();
        refetchLatestEscalation();
    };

    const markCoachResponseAsRead = async (notification) => {
        if (!userId || !notification?.id) return;
        await markCoachResponseRead({ response_id: notification.id, coach_id: userId });
        refetchCoachResponses();
        refetchCoachResponsesCount();
    };

    const refetchEscalationNotifications = () => {
        refetchEscalations();
        refetchLatestEscalation();
    };

    // Mark system notification as read
    const markSystemNotificationAsReadHandler = async (notificationId) => {
        if (!userId || !notificationId || !(userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin')) return;
        await markSystemNotificationAsRead({ notificationId, userId, userType });
        refetchSystemNotifications();
        refetchSystemUnreadCount();
    };

    // Mark all system notifications as read
    const markAllSystemNotificationsAsReadHandler = async () => {
        if (!userId || !(userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin')) return;
        await markAllSystemNotificationsAsRead({ userId, userType });
        refetchSystemNotifications();
        refetchSystemUnreadCount();
    };

    return (
        <NotificationContext.Provider
            value={{
                unreadMessages,
                unreadCount,
                unreadChatCount,
                unreadEscalations,
                escalationList,
                coachResponses: providerResponsesUnread,
                coachUnreadCount,
                systemNotifications,
                systemUnreadCount: systemUnreadCountForUser,
                billingCancellations,
                chatMessages,
                clearAllNotifications,
                markMessageChatAsRead,
                markEscalationAsRead,
                markCoachResponseAsRead,
                markBillingCancellationAsRead,
                markSystemNotificationAsRead: markSystemNotificationAsReadHandler,
                markAllSystemNotificationsAsRead: markAllSystemNotificationsAsReadHandler,
                isLoading,
                refetchNotifications: () => {
                    refetch();
                    refetchEscalations();
                    refetchLatestEscalation();
                    refetchCoachResponses();
                    refetchCoachResponsesCount();
                    if (userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') {
                        refetchSystemNotifications();
                        refetchSystemUnreadCount();
                    }
                },
                refetchEscalationNotifications,
                refetchChatNotifications: refetch,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
