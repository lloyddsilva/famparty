// Feature flags. Family albums are hidden from launch: no new albums, no
// album-linked rooms, no saving. The code stays behind this flag.
export const ALBUMS_ENABLED = process.env.FAMPARTY_ALBUMS === "1";
