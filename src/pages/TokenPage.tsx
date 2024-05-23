import { memo, useState } from "react";
import { useParams } from "react-router";
import { Topbar } from "../components/Topbar";
import { Inspector } from "../components/Inspector";
import { ResetModal } from "../components/ResetModal";
import { useToken } from "../modules/token";
import { useAuth } from "../modules/auth";
import { SIGN_MESSAGE } from "../lib/auth";
import "./TokenPage.css";

export const TokenPage = memo(() => {
  const { tokenId } = useParams();
  const { isOwner } = useToken(tokenId);
  const { signedMessage, isSigningMessage, signMessage } = useAuth();
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <div className="TokenPage">
      <Topbar
        hasSignedMessage={!!signedMessage}
        isSigningMessage={isSigningMessage}
        onSignMessage={() => signMessage({ message: SIGN_MESSAGE })}
      />
      <Inspector
        tokenId={tokenId}
        isOwner={isOwner}
        signedMessage={signedMessage}
        onLoad={(_iframe, data) => {
          setShowResetModal(data.isCLI);
        }}
      />
      {showResetModal && (
        <ResetModal
          tokenId={tokenId}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
});
