import { createApi } from "@reduxjs/toolkit/query/react";
import {
  setCategoryData,
  setChill,
} from "../reducers/patientUseFullResourcesSlice";
import { toast } from "react-toastify";
import baseQueryWithReauth from "../../utils/customBaseQuery";

// Define a service using a base URL and expected endpoints
export const chillSlice = createApi({
  reducerPath: "chill",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Chill"],
  endpoints: (builder) => ({
    getAllChill: builder.query({
      query: ({ page, rowsPerPage ,actorId, actorType}) =>
        `/admin/chilllist?page=${page}&limit=${rowsPerPage}&actorId=${actorId}&actorType=${actorType}`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setChill(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
      providesTags: ["Chill"],
    }),
    addChill: builder.mutation({
      query: (data) => ({
        url: `/admin/addchill`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Chill added successfully!");
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to add chill."}`);
        }
      },
      invalidatesTags: ["Chill"],
    }),
    deleteChill: builder.mutation({
      query: ({id,actorId, actorType}) => ({
        url: `/admin/deletechill/${id}?actorId=${actorId}&actorType=${actorType}`,
        method: "PATCH",
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            toast.success("Chill deleted successfully!");
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to delete chill."}`);
        }
      },
      invalidatesTags: ["Chill"],
    }),
    updateChill: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/editchill/${id}`,
        method: "PUT",
        body: data,
      }),
      async onQueryStarted({ status }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (status === "Edit") {
            toast.success("Chill Updated Successfully!");
          } else if (status === "status") {
            if (data.data.status === "active") {
              toast.success("Chill Activated Successfully!");
            } else {
              toast.success("Chill De-Activated Successfully!");
            }
          }
        } catch (err) {
          toast.error(`Error: ${err?.message || "Failed to update chill."}`);
        }
      },
      invalidatesTags: ["Chill"],
    }),
    getCategoryVideo: builder.query({
      query: ({ category  , body_part}) => {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (body_part && Array.isArray(body_part)) {
          params.append("body_part", body_part.join(",")); 
        }
        return `/api/getvideodata?${params.toString()}`;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setCategoryData(data));
          }
        } catch (error) {
          console.error("Error fetching coach data:", error);
        }
      },
      providesTags: ["Chill"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAllChillQuery,
  useAddChillMutation,
  useDeleteChillMutation,
  useUpdateChillMutation,
  useGetCategoryVideoQuery,
} = chillSlice;
