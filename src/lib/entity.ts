export type Entity = {
  id: string;
  type: string;
  pointers: string[];
  timestamp: number;
  content: { hash: string; file: string }[];
  metadata?: unknown;
};
