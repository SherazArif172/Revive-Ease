import { createApi } from '@reduxjs/toolkit/query/react';
import { setProvider, setFilteredProviderByClinics } from '../reducers/providerReducers';
import baseQueryWithReauth from '../../utils/customBaseQuery';

export const providerSlice = createApi({
  reducerPath: 'provider',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAllProvierList: builder.query({
      query: (id) => id ? `/providerlisting/${id}` : `/providerlisting`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Only set when we have a scoped clinic id or when explicitly requesting all
          // Avoid overwriting clinic-scoped list with all providers if arg is falsy

          dispatch(setFilteredProviderByClinics(data));
          if (arg) {
            dispatch(setProvider(data));
          }
        } catch (err) {
          console.error('Query Error:', err);
        }
      },
    }),    
  }),
});

export const { useGetAllProvierListQuery } = providerSlice;
