// Public-domain / Open Access artwork catalog.
// Images are downloaded during development and bundled.
// The running app never calls museum APIs.

import catalog from "./catalog.json";

export const ARTWORK_CATALOG = catalog;

export const ARTWORK_BY_ID = ARTWORK_CATALOG.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export function artworkMetadata(id) {
  const item = ARTWORK_BY_ID[id];
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    displayTitle: item.displayTitle || item.title,
    artist: item.artist,
    year: item.year,
    museum: item.museum,
    museumObjectId: item.museumObjectId,
    source: item.source,
    rights: item.rights,
    isPublicDomain: item.isPublicDomain === true,
  };
}
