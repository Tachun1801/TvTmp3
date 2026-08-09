import { getGenres } from '@/api/genreApi';

export const genreService = {
  async getGenres() {
    return getGenres();
  }
};
