import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

// Types

export type Auction = {
  tokenId: string;
  amount: number;
  reserve: number;
  startTime: number;
  endTime: number;
  bidder: string;
  settled: boolean;
};

// Thunks

export const fetchAuction = createAsyncThunk(
  "auction/fetchAuction",
  async () => {
    const auction: Auction = {
      tokenId: "1",
      amount: 200,
      reserve: 100,
      bidder: "0x",
      endTime: 0,
      startTime: 0,
      settled: false,
    };
    return auction;
  }
);

// State

interface AuctionState {
  data: Auction | null;
  loading: boolean;
  error: SerializedError | null;
}

const initialState: AuctionState = {
  data: null,
  loading: false,
  error: null,
};

// Slice

const slice = createSlice({
  name: "auction",
  reducers: {},
  initialState,
  extraReducers: (builder) => {
    // Fetch Auction
    builder.addCase(fetchAuction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAuction.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchAuction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
  },
});

// Reducer

export default slice.reducer;
