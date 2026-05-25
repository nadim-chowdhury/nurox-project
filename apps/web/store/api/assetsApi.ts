import { baseQueryWithReauth } from '@/lib/api-client';
import { createApi } from '@reduxjs/toolkit/query/react';

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Asset', 'AssetCategory', 'AssetMaintenance'],
  endpoints: (builder) => ({
    getAssets: builder.query<any[], any>({
      query: (params) => ({
        url: '/assets',
        params,
      }),
      providesTags: ['Asset'],
    }),
    getAssetDetails: builder.query<any, string>({
      query: (id) => `/assets/${id}`,
      providesTags: (result, error, id) => [{ type: 'Asset', id }],
    }),
    createAsset: builder.mutation<any, any>({
      query: (data) => ({
        url: '/assets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Asset'],
    }),
    updateAsset: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/assets/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Asset', id },
        'Asset',
      ],
    }),
    assignAsset: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/assets/${id}/assign`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Asset', id },
        'Asset',
      ],
    }),
    logMaintenance: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/assets/${id}/maintenance`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Asset', id },
        'AssetMaintenance',
      ],
    }),
    generateQR: builder.mutation<{ qrCodeUrl: string }, string>({
      query: (id) => ({
        url: `/assets/${id}/qr`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Asset', id }],
    }),
    importAssets: builder.mutation<any, { fileData: string }>({
      query: (data) => ({
        url: `/assets/import`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Asset'],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetDetailsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useAssignAssetMutation,
  useLogMaintenanceMutation,
  useGenerateQRMutation,
  useImportAssetsMutation,
} = assetsApi;
