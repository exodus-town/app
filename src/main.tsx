import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { store } from "./store";
import { router } from "./router";
import { queryClient, wagmiConfig, walletConnectProjectId } from "./wagmi";

import "decentraland-ui/lib/styles.css";
import "decentraland-ui/lib/dark-theme.css";
import "./theme.css";

createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </WagmiProvider>
    </Provider>
  </React.StrictMode>
);
