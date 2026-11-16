import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../../utils/customBaseQuery";
import { setAllReportListing, setCptSummaryList } from "../reducers/reportAnalyticsReducer";

export const reportAnalyticsSlice = createApi({
  reducerPath: "reportAnalyticsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ReportAnalytics"],
  endpoints: (builder) => ({
    getReportAnalytics: builder.query({
      query: ({ clinicPage, clinicLimit, coachPage, coachLimit, clinic_id, coachName, diagnosis ,actorId, actorType} = {}) => ({
        url: "patients/reportnanalytics",
        params: {
          clinicPage,
          clinicLimit,
          coachPage,
          coachLimit,
          actorId,
          actorType,
          ...(clinic_id && { clinic_id }),
          ...(coachName && { coachName }),
          ...(diagnosis && { diagnosis }),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAllReportListing(data?.data));
        } catch (error) {
          console.error("Failed to fetch report analytics:", error);
        }
      }
    }),
    getCptSummary: builder.query({
      query: ({ month, clinic_id, coachName, diagnosis , actorId,  actorType,}) => ({
        url: "/billing/cpt-code-summary",
        params: {
          month,
          actorId,
          actorType,
          ...(clinic_id && { clinic_id }),
          ...(coachName && { coachName }),
          ...(diagnosis && { diagnosis }),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCptSummaryList(data));
        } catch (error) {
          console.error("Failed to fetch report analytics:", error);
        }
      }
    }),
  }),
});

export const { useGetReportAnalyticsQuery , useGetCptSummaryQuery } = reportAnalyticsSlice;
