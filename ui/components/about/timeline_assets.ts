export const TIMELINE_PHOTOS = [
  "/nuestra_historia/Cuadro 1 - Grupo Eusse.webp",
  "/nuestra_historia/Cuadro 2 - Grupo Eusse.webp",
  "/nuestra_historia/Cuadro 3 - Grupo Eusse.webp",
  "/nuestra_historia/Cuadro 4 - Grupo Eusse.webp",
  "/nuestra_historia/Cuadro 5 - Grupo Eusse.webp",
  "/nuestra_historia/Cuadro 8 - Grupo Eusse.webp",
  "/nuestra_historia/Cuadro 9 - Grupo Eusse.webp",
] as const;

const queuedTimelinePhotos = new Set<string>();

export function getTimelinePhotosToPreload(photos: readonly string[]) {
  const pendingPhotos = photos.filter((photo) => !queuedTimelinePhotos.has(photo));

  for (const photo of pendingPhotos) {
    queuedTimelinePhotos.add(photo);
  }

  return pendingPhotos;
}

export function resetTimelinePhotoPreloadStateForTests() {
  queuedTimelinePhotos.clear();
}
