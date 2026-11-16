import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { base_url } from "../../global/global";
import { toast } from "react-toastify";

export const loginSlice = createApi({
  reducerPath: 'login',
  tagTypes: ['login'],
  baseQuery: fetchBaseQuery({
    baseUrl: base_url,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    login: builder.mutation({
      providesTags: ['login'],
      query: (payload) => ({
        url: 'login',
        method: 'POST',
        body: payload
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const user = data?.data?.user;

          if (user) {
            const name =
              user.userType === "clinic admin"
                ? user.userName
                : `${user.first_name} ${user.middle_name|| ""} ${user.last_name}`;
            toast.success(`Welcome ${name}`);
          }
        } catch (err) {
          const errorMsg = err?.error?.data?.message;
          const status = err?.error?.status;
          if (status === 401) {
            if (errorMsg === "User does not exist!" || errorMsg === "Invalid password") {
              toast.error(errorMsg);
              return;
            }
          } else if (status === 400 && errorMsg === "Invalid email address") {
            toast.error(errorMsg);
            return;
          }
          
          else if (status === 403 || errorMsg === "Patients are not allowed to log in on the web.") {
            toast.error(errorMsg);
            return;
          } else {
            toast.error("Network Error");
          }
        }
      },
    }),
    resetPassword: builder.mutation({
      query: (payload) => ({
        url: 'sendotp',
        method: 'POST',
        body: payload
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success(data?.message);
          }
        } catch (err) {
          console.log(err?.error?.data?.message);
        }
      },
    }),
    changePassword: builder.mutation({
      query: ({ payload, id }) => ({
        url: `change-password/${id}`,
        method: 'POST',
        body: payload
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success(data?.message);
          }
        } catch (err) {
          toast.error(`Error: ${err?.message}`);
        }
      },
    }),
    sendNotification: builder.mutation({
      query: (payload) => ({
        url: 'send-notification',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
         await queryFulfilled;
        } catch (err) {
          console.error("Error sending notification:", err);
        }
      },
    }),
    
  })
});

export const { useLoginMutation, useResetPasswordMutation, useChangePasswordMutation , useSendNotificationMutation} = loginSlice;