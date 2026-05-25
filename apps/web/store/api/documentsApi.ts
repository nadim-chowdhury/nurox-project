import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/api-client';

export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  folderId: string | null;
  latestVersionNumber: number;
  accessControl: string;
  createdAt: string;
}

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Documents', 'Folders'],
  endpoints: (builder) => ({
    getFolders: builder.query<DocumentFolder[], string | void>({
      query: (parentId) => ({
        url: '/documents/folders',
        params: parentId ? { parentId } : undefined,
      }),
      providesTags: ['Folders'],
    }),
    createFolder: builder.mutation<DocumentFolder, { name: string; parentId?: string }>({
      query: (body) => ({
        url: '/documents/folders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Folders'],
    }),
    getDocuments: builder.query<Document[], string | void>({
      query: (folderId) => ({
        url: '/documents',
        params: folderId ? { folderId } : undefined,
      }),
      providesTags: ['Documents'],
    }),
    getUploadUrl: builder.mutation<{ uploadUrl: string; key: string }, { name: string; type?: string; folderId?: string }>({
      query: (body) => ({
        url: '/documents/upload-url',
        method: 'POST',
        body,
      }),
    }),
    createDocument: builder.mutation<Document, { name: string; type: string; folderId?: string; fileKey: string; fileSize: number; mimeType: string }>({
      query: (body) => ({
        url: '/documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Documents'],
    }),
    getDownloadUrl: builder.query<{ downloadUrl: string }, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/documents/${id}/download`,
        params: version ? { version } : undefined,
      }),
    }),
    signDocument: builder.mutation<{ success: boolean; version: any }, { id: string; signatureBase64: string; signerName: string; ipAddress: string }>({
      query: ({ id, ...body }) => ({
        url: `/documents/${id}/sign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Documents'],
    }),
    softDeleteDocument: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/documents/${id}/soft-delete`,
        method: 'POST',
      }),
      invalidatesTags: ['Documents'],
    }),
    getRecycleBin: builder.query<Document[], void>({
      query: () => '/documents/recycle-bin',
      providesTags: ['Documents'],
    }),
    restoreDocument: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/documents/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: ['Documents'],
    }),
  }),
});

export const {
  useGetFoldersQuery,
  useCreateFolderMutation,
  useGetDocumentsQuery,
  useGetUploadUrlMutation,
  useCreateDocumentMutation,
  useGetDownloadUrlQuery,
  useSignDocumentMutation,
  useSoftDeleteDocumentMutation,
  useGetRecycleBinQuery,
  useRestoreDocumentMutation,
} = documentsApi;
