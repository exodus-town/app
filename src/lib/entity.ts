import { About } from "./about";
import { getContentPath } from "./path";

export type Entity = {
  id: string;
  type: string;
  pointers: string[];
  timestamp: number;
  content: { hash: string; file: string }[];
  metadata?: unknown;
};

export async function getEntity(tokenId: string) {
  const aboutResponse = await fetch(`/${tokenId}/about`);
  const about: About = await aboutResponse.json();
  const urn = about.configurations.scenesUrn[0];
  const entityId = urn.split("?")[0].split(":").pop()!;
  const entityResponse = await fetch(getContentPath(entityId));
  const entity: Entity = await entityResponse.json();
  return entity;
}
