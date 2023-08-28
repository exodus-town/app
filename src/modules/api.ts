import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Auction } from "../types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getAuction: builder.query<Auction, void>({
      query: () => `/auction`,
    }),
  }),
});

export const { useGetAuctionQuery: useAuction } = api;
