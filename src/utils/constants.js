export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_TMDB_BASE_URL,
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  IMAGE_BASE_URL: import.meta.env.VITE_TMDB_IMAGE_URL,
};

export const ENDPOINTS = {
  TRENDING: '/trending/movie/day',
  POPULAR: '/movie/popular',
  SEARCH: '/search/movie',
  MOVIE_DETAILS: '/movie',
  GENRES: '/genre/movie/list',
};
