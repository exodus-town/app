export type Owner = {
  /** The plot's owner in the archive's frozen snapshot (src/data/owners-snapshot.json). */
  owner: `0x${string}`;
  /** Whether the plot was returned to the DAO through the unwind. */
  returned: boolean;
};
