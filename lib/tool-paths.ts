import toolPaths from "./tool-paths.json";

export function getPathForSlug(slug: string): string {
  return (toolPaths as Record<string, string>)[slug] || `/tools/${slug}`;
}
