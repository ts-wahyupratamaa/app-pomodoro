export const ROUTES = {
  home: '/',
  content: '/content',
  photobooth: '/photobooth',
  pomodorotimer: '/pomodorotimer',
} as const;

export const ALLOWED_PATHS = [
  ROUTES.home,
  ROUTES.content,
  ROUTES.photobooth,
  ROUTES.pomodorotimer,
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
] as const;

export const GUARDED_PATHS = [
  ROUTES.content,
  ROUTES.photobooth,
  ROUTES.pomodorotimer,
] as const;
