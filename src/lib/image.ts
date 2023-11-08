import { getEntity } from "./entity";
import { Path, getContentPath } from "./path";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as unknown as string);
    reader.readAsDataURL(blob);
  });
}

export async function getImage(tokenId: string) {
  const entity = await getEntity(tokenId);
  const thumbnail = entity.content.find(
    (content) => content.file === Path.THUMBNAIL
  );
  if (thumbnail) {
    const image = await fetch(getContentPath(thumbnail.hash));
    if (image.ok) {
      const blob = await image.blob();
      const base64 = await blobToBase64(blob);
      return base64;
    }
  }
  return null;
}
