

export const extractYoutubeId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);

    // Handle `watch?v=xyz`
    if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.pathname === '/watch') {
      return parsedUrl.searchParams.get('v');
    }

    // Handle `/embed/{id}` or `/shorts/{id}`
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    if (['embed', 'shorts'].includes(pathSegments[0]) && pathSegments[1]) {
      return pathSegments[1];
    }

    // Handle `youtu.be/{id}`
    if (parsedUrl.hostname === 'youtu.be' && pathSegments[0]) {
      return pathSegments[0];
    }

    return null;
  } catch (error) {
    return null;
  }
};