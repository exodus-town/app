import { memo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Authenticator } from "@dcl/crypto";
import { Button, Container } from "decentraland-ui";
import { Navbar } from "../components/Navbar";
import "./AuthPage.css";

// How long the explorer may act for the wallet before it asks to sign in again, as on
// decentraland.org.
const IDENTITY_MINUTES = 30 * 24 * 60;

/**
 * Sign-in for the web explorer at /play. On Decentraland's domains the explorer sends users to the
 * auth site at /auth/login on its own origin, which leaves a signed identity in that origin's
 * localStorage under `single-sign-on-<address>` (as @dcl/single-sign-on-client does) and returns.
 * This page does the same for this site: the wallet signs a short-lived key the explorer then
 * uses for the session.
 */
export const AuthPage = memo(() => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string>();

  const redirectTo = getRedirect();

  const signIn = async () => {
    if (!address) return;
    setIsSigning(true);
    setError(undefined);
    try {
      const key = generatePrivateKey();
      const account = privateKeyToAccount(key);
      const identity = await Authenticator.initializeAuthChain(
        address,
        { privateKey: key, publicKey: account.publicKey, address: account.address },
        IDENTITY_MINUTES,
        (message) => signMessageAsync({ message })
      );
      localStorage.setItem(
        `single-sign-on-${address.toLowerCase()}`,
        JSON.stringify(identity)
      );
      window.location.assign(redirectTo);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!/denied|rejected/i.test(message)) setError(message);
      setIsSigning(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="AuthPage dcl page">
        <Container>
          <div className="card">
            <h1>Sign in to Exodus Town</h1>
            <p>
              Connect your wallet and sign a message to enter the town with your
              Decentraland profile. The signature lets this browser act for your
              wallet in the explorer for the next 30 days. It doesn't move any
              funds.
            </p>
            {isConnected && address ? (
              <Button primary loading={isSigning} disabled={isSigning} onClick={signIn}>
                Sign in as {address.slice(0, 6)}…{address.slice(-4)}
              </Button>
            ) : (
              <Button primary onClick={() => open()}>
                Connect wallet
              </Button>
            )}
            {error ? <div className="error">{error}</div> : null}
            <p className="back">
              <a href={redirectTo}>Back without signing in</a>
            </p>
          </div>
        </Container>
      </div>
    </>
  );
});

/** Where to return after signing in: `redirectTo`, if it is on this site. */
function getRedirect() {
  const raw = new URLSearchParams(window.location.search).get("redirectTo");
  try {
    const url = new URL(raw ?? "/play/", window.location.origin);
    return url.origin === window.location.origin ? url.href : "/play/";
  } catch {
    return "/play/";
  }
}
