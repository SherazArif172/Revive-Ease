import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import bellLogo from "../assets/icons/default_bell.png";
// import bellLogo from "../assets/icons/bell_Icon.png";
import ReviveLogo from '../assets/brand/logo/revive_ease_logo.png';
import {
  CAvatar,
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CNavItem,
  CNavLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBadge
} from "@coreui/react";
import AppHeaderDropdown from "./header/AppHeaderDropdown";
import { useSelector } from "react-redux";
import { base_url } from "../global/global";
import { getUserAvatarUrl } from "../utils/avatar";
import SignOffButton from "../views/pages/provider/SignOffButton";
import { useNotifications } from "../Components/header/Notifications";
import { formatDate } from "../utils/dateUtils";
import { useLocation, useNavigate } from "react-router-dom";

const AppHeader = () => {
  const [avatarURL, setAvatarURL] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userType = useSelector((state) => state.user.userType);
  const userName = useSelector((state) => state?.user?.profileData);
  const { unreadMessages, unreadCount, unreadEscalations, escalationList, coachResponses, coachUnreadCount, systemNotifications, billingCancellations, markMessageChatAsRead, markEscalationAsRead, markCoachResponseAsRead, markBillingCancellationAsRead, markSystemNotificationAsRead, markAllSystemNotificationsAsRead, clearAllNotifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const url = getUserAvatarUrl({ baseUrl: base_url, profileImgPath: userName?.profile_img, userType: userType });
    setAvatarURL(url);
  }, [userName, userType]);

  useEffect(() => {
  }, [unreadCount, unreadMessages]);

  const signOffButtonRoutes = {
    "provider": ["/mypatients"],
    "clinic admin": ["/patients"]
  };

  const showSignOffButton = signOffButtonRoutes[userType]?.includes(location.pathname);

  const handleNavigateSignOff = () => {
    navigate("/sign-off");
  };

  const handleNotificationClick = (message) => {
    console.log('🔔 Notification clicked:', {
      message,
      chatId: message.chatId,
      patientId: message.chatRoom?.patientId,
      chatRoom: message.chatRoom,
      userType
    });

    markMessageChatAsRead(message.chatId);
    const patientId = message.chatRoom?.patientId;
    const senderProfileImage = `${base_url}${message.sender?.profile_img}`;
    if (userType === 'provider') {
      navigate('/messages', { state: { chatId: message.chatId, patientId: patientId, senderProfileImage } });
    } else if (userType === 'coach') {
      console.log('🚀 Navigating to coach patient detail with:', {
        openChat: true,
        chatId: message.chatId,
        patientId: patientId,
        senderProfileImage
      });
      navigate('/coachPatientDetail', {
        state: {
          openChat: true,
          chatId: message.chatId,
          patientId: patientId,
          senderProfileImage
        }
      });
    }
  };

  const handleBillingCancellationClick = async (notification) => {
    // Get patient ID from billingData.patient or patientId field
    const patientId = notification?.billingData?.patient?._id || notification?.patientId;
    // Get billing ID from notification._id (which is the billing_id) or billingData.billingId
    const billingId = notification?._id || notification?.billingData?.billingId;
    
    if (billingId) {
      try {
        // Mark notification as read using the billing ID
        await markBillingCancellationAsRead(billingId);
        
        // Navigate to edit-billing with patient_id and billing_id if patientId is available
        if (patientId) {
          navigate('/edit-billing', { 
            state: {
              billingId: billingId,
              patientId: patientId
            }
          });
        } else {
          // If no patientId, still navigate but let the component handle it
          navigate('/edit-billing', { 
            state: billingId
          });
        }
      } catch (error) {
        console.error('Failed to handle billing cancellation click:', error);
      }
    }
  };

  return (
    <div>
      <CHeader position="sticky" className="">
        <CContainer fluid>
          <CHeaderBrand className="mx-auto d-md-none" to="/"></CHeaderBrand>
          <CHeaderNav className="d-md-flex me-auto">
            {userType === "provider" && <img loading="lazy" src={ReviveLogo} alt="Revive Logo" width={100} height={50} />}
          </CHeaderNav>
          &nbsp;&nbsp;
          <CHeaderNav>
            {showSignOffButton && (
              <SignOffButton handleNavigateSignOff={handleNavigateSignOff} />
            )}
            <CNavItem>
              <CNavLink style={{ cursor: "pointer", display: "flex" }}>
                <CDropdown
                  alignment="end"
                  visible={dropdownOpen}
                  onShow={() => setDropdownOpen(true)}
                  onHide={() => setDropdownOpen(false)}
                >
                  <CDropdownToggle className="p-0" caret={false}>
                    <div className="headerbell px-4 position-relative">
                      <img loading="lazy" src={bellLogo} height="25" />
                      {unreadCount > 0 && (
                        <CBadge
                          color="danger"
                          position="top-end"
                          style={{
                            width: '16px',
                            height: '16px',
                            fontSize: '9px',
                            marginLeft: '-15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            top: '0',
                            right: '0',
                          }}
                          shape="rounded-circle"
                        >
                          {unreadCount}
                        </CBadge>
                      )}
                    </div>
                  </CDropdownToggle>
                  <CDropdownMenu className="pt-0" style={{ width: '380px', maxHeight: '450px', overflowY: 'auto', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                    <CDropdownItem header className="bg-light" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '15px 20px', borderBottom: '1px solid #e9ecef' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <strong style={{ fontSize: '16px', color: '#2c3e50' }}>Notifications</strong>
                        {unreadCount > 0 && (
                          <span
                            className="text-primary"
                            style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') {
                                await markAllSystemNotificationsAsRead();
                              } else {
                                clearAllNotifications();
                              }
                            }}
                          >
                            Mark all as read
                          </span>
                        )}
                      </div>
                    </CDropdownItem>
                    {(userType === 'provider' || userType === 'clinic admin') && (
                      <CDropdownItem
                        className="d-flex justify-content-between align-items-center"
                        onClick={() => navigate('/sign-off')}
                        style={{ padding: '12px 20px', cursor: 'pointer', backgroundColor: '#fffaf5' }}
                      >
                        <span style={{ fontSize: '14px', color: '#d35400', fontWeight: 600 }}>Review sign-offs</span>
                        {unreadEscalations > 0 && (
                          <CBadge color="danger" shape="rounded-pill">{unreadEscalations}</CBadge>
                        )}
                      </CDropdownItem>
                    )}
                    {userType === 'coach' && (
                      <CDropdownItem
                        className="d-flex justify-content-between align-items-center"
                        style={{ padding: '12px 20px', cursor: 'default', backgroundColor: '#f7fff8' }}
                      >
                        <span style={{ fontSize: '14px', color: '#2d7a2d', fontWeight: 600 }}>Provider responses</span>
                        {coachUnreadCount > 0 && (
                          <CBadge color="success" shape="rounded-pill">{coachUnreadCount}</CBadge>
                        )}
                      </CDropdownItem>
                    )}
                    {((userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') && systemNotifications.length === 0) ? (
                      <CDropdownItem className="text-center py-4" style={{ color: '#6c757d' }}>
                        <div style={{ fontSize: '14px' }}>No new notifications</div>
                      </CDropdownItem>
                    ) : (unreadMessages.length === 0 && unreadEscalations === 0 && (userType !== 'coach' || (coachUnreadCount === 0 && billingCancellations.length === 0)) && (userType !== 'admin' && userType !== 'clinic admin')) ? (
                      <CDropdownItem className="text-center py-4" style={{ color: '#6c757d' }}>
                        <div style={{ fontSize: '14px' }}>No new notifications  </div>
                      </CDropdownItem>
                    ) : (
                      <>
                        {/* Billing Cancellation Notifications for Coach */}
                        {userType === 'coach' && billingCancellations.map((notification) => (
                          <CDropdownItem
                            key={notification.id || notification._id}
                            className="notification-item"
                            onClick={() => handleBillingCancellationClick(notification)}
                            style={{
                              padding: '15px 20px',
                              borderBottom: '1px solid #f8f9fa',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              backgroundColor: '#fff5f5' // All billing cancellations in unreadMessages are unread
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe6e6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                          >
                            <div className="w-100">
                              <div className="d-flex align-items-start gap-3">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <strong style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '600', marginBottom: '0' }}>
                                      {'Bill Cancelled'}{notification.billingData?.patient?.name ? ` - (${notification.billingData.patient.name})` : notification.patient?.name ? ` - (${notification.patient.name})` : ''}
                                    </strong>
                                    <small style={{ color: '#6c757d', fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
                                      {notification.timestamp
                                        ? formatDate(notification.timestamp, 'MMM dd, hh:mm a')
                                        : ''}
                                    </small>
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#dc3545', whiteSpace: 'break-spaces' }}>
                                    {notification.text || notification.message || 'A bill has been cancelled'}
                                  </div>
                                  {notification.billingData?.cancellation_remark && (
                                    <div style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic', marginTop: '4px' }}>
                                      Reason: {notification.billingData.cancellation_remark}
                                    </div>
                                  )}
                                  {/* All notifications in unreadMessages are unread by definition */}
                                  <div className="d-flex align-items-center gap-2 mt-2">
                                    <div style={{
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      backgroundColor: '#dc3545',
                                      flexShrink: 0
                                    }}></div>
                                    <span style={{
                                      fontSize: '11px',
                                      color: '#dc3545',
                                      fontWeight: '500'
                                    }}>
                                      New
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CDropdownItem>
                        ))}
                        {/* System Notifications for Admin and Clinic Admin */}
                        {(userType === 'admin' || userType === 'sub admin' || userType === 'clinic admin') && systemNotifications.map((notification) => {
                          // Check if it's a billing notification
                          const isBillingNotification = notification.type === 'billing_created' || notification.type === 'billing_retried';
                          
                          return (
                          <CDropdownItem
                            key={notification._id}
                            className="notification-item"
                            onClick={async () => {
                              try {
                                await markSystemNotificationAsRead(notification._id);
                              } catch (err) {
                                console.error('Failed to mark system notification as read:', err);
                              }
                              // Navigate based on notification type or related entity
                              if (isBillingNotification && notification.relatedEntityId) {
                                // Navigate to billing status page with billing_id
                                navigate('/updateBilledStatus');
                              } else if (notification.type === 'patient_registered' && notification.relatedEntityId) {
                                if (userType === 'admin' || userType === 'sub admin') {
                                  navigate('/clinics');
                                } else if (userType === 'clinic admin') {
                                  navigate('/patients');
                                }
                              }
                            }}
                            style={{
                              padding: '15px 20px',
                              borderBottom: '1px solid #f8f9fa',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              backgroundColor: notification.isRead 
                                ? '#ffffff' 
                                : isBillingNotification 
                                  ? '#f0f8f0' 
                                  : '#f0f8ff'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isBillingNotification ? '#e6f3e6' : '#e6f3ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.isRead 
                              ? '#ffffff' 
                              : isBillingNotification 
                                ? '#f0f8f0' 
                                : '#f0f8ff'}
                          >
                            <div className="w-100">
                              <div className="d-flex align-items-start gap-3">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <strong style={{ 
                                      fontSize: '14px', 
                                      color: '#2c3e50', 
                                      fontWeight: '600', 
                                      marginBottom: '0' 
                                    }}>
                                      {notification.title || 'System Notification'}
                                    </strong>
                                    <small style={{ color: '#6c757d', fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
                                      {notification.createdAt
                                        ? formatDate(notification.createdAt, 'MMM dd, hh:mm a')
                                        : ''}
                                    </small>
                                  </div>
                                  <div style={{ 
                                    fontSize: '13px', 
                                    color: isBillingNotification ? '#28a745' : '#495057', 
                                    whiteSpace: 'break-spaces' 
                                  }}>
                                    {notification.message || notification.description || 'New notification'}
                                  </div>
                                  {!notification.isRead && (
                                    <div className="d-flex align-items-center gap-2 mt-2">
                                      <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: isBillingNotification ? '#28a745' : '#007bff',
                                        flexShrink: 0
                                      }}></div>
                                      <span style={{
                                        fontSize: '11px',
                                        color: isBillingNotification ? '#28a745' : '#007bff',
                                        fontWeight: '500'
                                      }}>
                                        New
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CDropdownItem>
                          );
                        })}
                        {userType === 'coach' && (coachResponses || []).map((n) => (
                          <CDropdownItem
                            key={n.id}
                            className="notification-item"
                            onClick={async () => {
                              try {
                                await markCoachResponseAsRead(n);
                              } catch (e) {
                                console.error('Failed to mark coach response as read', e);
                              }
                              // Navigate to patient detail or coach module view; adjust route if needed
                              navigate('/coachPatientDetail', {
                                state: {
                                  patientId: n?.patient?._id || n?.patient_id,
                                  openMDNotes: true 
                                }
                              });
                            }}
                            style={{
                              padding: '15px 20px',
                              borderBottom: '1px solid #f0f4f0',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              backgroundColor: '#f7fff8'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef8ef'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7fff8'}
                          >
                            <div className="w-100">
                              <div className="d-flex align-items-start gap-3">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <strong style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '600', marginBottom: '0' }}>
                                      {n?.patient?.name || 'Unknown Patient'}
                                    </strong>
                                    <small style={{ color: '#6c757d', fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
                                      {n?.createdAt ? formatDate(n.createdAt, 'MMM dd, hh:mm a') : ''}
                                    </small>
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#2d7a2d', whiteSpace: 'break-spaces' }}>
                                    Provider response: {n?.providerResponse || '—'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CDropdownItem>
                        ))}
                        {escalationList?.map((item) => (
                          <CDropdownItem
                            key={item.escalationId || item._id}
                            className="notification-item"
                            onClick={async () => {
                              try {
                                await markEscalationAsRead(item.escalationId);
                              } catch (err) {
                                console.error('Failed to mark escalation as read:', err);
                              }
                              navigate('/sign-off', { state: { focusPatientId: item.patientId } });
                            }}
                            style={{
                              padding: '15px 20px',
                              borderBottom: '1px solid #f8f9fa',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              backgroundColor: item.isAcknowledged ? '#fdfdfd' : '#fffaf5'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f0e6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = item.isAcknowledged ? '#fdfdfd' : '#fffaf5'}
                          >
                            <div className="w-100">
                              <div className="d-flex align-items-start gap-3">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <strong style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '600', marginBottom: '0' }}>
                                      {item.patientName || 'Unknown Patient'}
                                    </strong>
                                    <small style={{ color: '#6c757d', fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
                                      {item.createdAt
                                        ? formatDate(item.createdAt, 'MMM dd, hh:mm a')
                                        : ''}
                                    </small>
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#8e44ad', whiteSpace: 'break-spaces' }}>
                                    Coach summary: {item.comment || 'Review required'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CDropdownItem>
                        ))}
                        {unreadMessages.filter(msg => msg.type !== 'billing_cancelled').map((message) => (
                          <CDropdownItem
                            key={message._id}
                            className="notification-item"
                            onClick={() => handleNotificationClick(message)}
                            style={{
                              padding: '15px 20px',
                              borderBottom: '1px solid #f8f9fa',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              backgroundColor: message.isRead ? '#ffffff' : '#f8f9ff'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = message.isRead ? '#ffffff' : '#f8f9ff'}
                          >
                            <div className="w-100">
                              <div className="d-flex align-items-start gap-3">
                                {/* Sender Profile Image */}
                                <div style={{ flexShrink: 0 }}>
                                  <img
                                    src={`${base_url}${message.sender?.profile_img}`}
                                    alt="Sender"
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '2px solid #e9ecef'
                                    }}
                                  />
                                </div>

                                {/* Message Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <strong style={{
                                      fontSize: '14px',
                                      color: '#2c3e50',
                                      fontWeight: '600',
                                      marginBottom: '0'
                                    }}>
                                      {message.sender?.name || 'Unknown User'}
                                    </strong>
                                    <small style={{
                                      color: '#6c757d',
                                      fontSize: '12px',
                                      flexShrink: 0,
                                      marginLeft: '8px'
                                    }}>
                                      {formatDate(message.timestamp, 'MMM dd, hh:mm a')}
                                    </small>
                                  </div>

                                  <div style={{
                                    fontSize: '13px',
                                    color: '#495057',
                                    lineHeight: '1.4',
                                    marginBottom: '4px',
                                    height: "auto",
                                    whiteSpace: "break-spaces"
                                  }}>
                                    <ReactMarkdown>{message.text || ""}</ReactMarkdown>
                                  </div>

                                  {/* Unread Indicator */}
                                  {!message.isRead && (
                                    <div className="d-flex align-items-center gap-2">
                                      <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#007bff',
                                        flexShrink: 0
                                      }}></div>
                                      <span style={{
                                        fontSize: '11px',
                                        color: '#007bff',
                                        fontWeight: '500'
                                      }}>
                                        New message
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CDropdownItem>
                        ))}
                      </>
                    )}
                  </CDropdownMenu>
                </CDropdown>
              </CNavLink>
            </CNavItem>
          </CHeaderNav>

          <CAvatar src={avatarURL} size="md" />
          <div className="rv-info">
            <div className="col-md-12 col-sm-12">
              <strong className="rv-drp">
                {
                  userName?.userType === "clinic admin"
                    ? userName?.userName
                    : userName?.userType === "provider"
                      ? `${userName?.md_type ? userName.md_type + "." : ""} ${userName?.last_name || ""} ${userName?.middle_name?.charAt(0)?.toUpperCase() || ""} ${userName?.first_name || ""}`
                      : `${userName?.last_name || ""} ${userName?.middle_name?.charAt(0)?.toUpperCase() || ""} ${userName?.first_name || ""}`
                }
              </strong>
            </div>
            <div className="w-100 d-none d-md-block fs-5"></div>
            <div className="col-12 col-sm-12 rv-drp-us">
              {userName?.userType?.replace(/\b\w/g, (char) => char.toUpperCase())}
            </div>
          </div>
          <CHeaderNav className="ms-3">
            <AppHeaderDropdown setAvatarURL={setAvatarURL} avatarURL={avatarURL} />
          </CHeaderNav>
        </CContainer>
      </CHeader>
    </div >
  );
};

export default AppHeader;