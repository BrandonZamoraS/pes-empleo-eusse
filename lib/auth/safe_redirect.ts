export function getSafeInternalPath(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  return path;
}
