import { memo } from "react";
import { Button, Modal, ModalNavigation } from "decentraland-ui";
import { toLayout } from "../lib/layout";
import "./CliModal.css";

type Props = {
  tokenId: string | null;
  onClose: () => void;
};

export const CliModal = memo<Props>(({ tokenId, onClose }) => {
  if (!tokenId) return null;

  const layout = toLayout(tokenId);
  return (
    <Modal open size="tiny" className="CliModal">
      <ModalNavigation title="Deploy using the CLI" onClose={onClose} />
      <Modal.Content>
        <p>
          To deploy content to this parcel, you will need to set your scene.json
          parcels to:
        </p>
        <p>
          <code>
            {layout.parcels
              .map((parcel) => `"${parcel.x},${parcel.y}"`)
              .join(" ")}
          </code>
        </p>
        <p>And then deploy using this command:</p>
        <p>
          <code>
            npx @dcl/sdk-commands deploy --skip-validations --target-content
            exodus.town
          </code>
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button primary onClick={onClose}>
          Ok
        </Button>
      </Modal.Actions>
    </Modal>
  );
});
