import { memo, useCallback, useState } from "react";
import { Button, Modal, ModalNavigation } from "decentraland-ui";
import "./ResetModal.css";
import { reset } from "../lib/storage";

type Props = {
  tokenId?: string;
  onClose: () => void;
};

export const ResetModal = memo<Props>(({ tokenId, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const onReset = useCallback(() => {
    if (tokenId) {
      setIsLoading(true);
      reset(tokenId).then(() => {
        setIsLoading(false);
        window.location.reload();
      });
    }
  }, [tokenId]);

  if (!tokenId) return null;

  return (
    <Modal open size="tiny" className="ResetModal" onClose={onClose}>
      <ModalNavigation title="This scene was deployed using the CLI" />
      <Modal.Content>
        <p>
          You can't edit this scene using the Web Editor because it was deployed
          using the CLI.
        </p>
        <p>
          If you want you can reset the contents of this scene so you can start
          editing with the Web Editor, but you will lose what is currently
          deployed there. <b>This is an irreversible operation.</b>
        </p>
        <p>Do you want to reset the contents of this scene?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button
          primary
          onClick={onReset}
          disabled={isLoading}
          loading={isLoading}
        >
          Erase All Contents and Reset
        </Button>
        <Button secondary onClick={onClose}>
          Dismiss
        </Button>
      </Modal.Actions>
    </Modal>
  );
});
