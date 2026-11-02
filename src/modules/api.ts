import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Owner } from "../types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getOwners: builder.query<Owner[], void>({
      query: () => `/owners`,
      transformResponse: (response: { owners: Owner[] }) => response.owners,
    }),
  }),
});

export const { useGetOwnersQuery } = api;
