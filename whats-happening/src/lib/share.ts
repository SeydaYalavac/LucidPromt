export async function shareUrl(title: string, url: string) {
  if (navigator.share) {
    await navigator.share({ title, url });
    return "shared" as const;
  }
  await navigator.clipboard.writeText(url);
  return "copied" as const;
}
