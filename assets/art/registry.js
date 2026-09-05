import { artworkMetadata } from "./catalog";
import { ART_ASCII } from "./ascii";
import { ART_IMAGES } from "./images";

export function getArtVisual(artworkId) {
  if (!artworkId) {
    return { meta: null, image: null, ascii: "" };
  }

  const meta = artworkMetadata(artworkId);
  const image = ART_IMAGES[artworkId] || null;
  const ascii = ART_ASCII[artworkId] || "";

  return { meta, image, ascii };
}

export function hasArtVisual(artworkId) {
  const visual = getArtVisual(artworkId);
  return !!(visual.image || visual.ascii);
}
