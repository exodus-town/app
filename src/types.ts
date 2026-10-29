export type Owner = {
  /** The owner of record: the holder, or for a plot returned to the DAO, who returned it. */
  owner: `0x${string}`;
  /** Whether the plot was returned to the DAO through the unwind. */
  returned: boolean;
};
