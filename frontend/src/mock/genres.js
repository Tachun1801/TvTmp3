/**
 * Mock data — Genres
 *
 * Shape khớp với database.md (bảng genres):
 *   genre_id   → genres.genre_id
 *   name       → genres.name
 *   description → genres.description
 *   img_url    → genres.img_url
 */

export const mockGenres = [
  { genre_id: 1,  name: 'Pop',      description: 'Nhạc pop Việt Nam và quốc tế',  img_url: 'https://picsum.photos/seed/genre-pop/400/400' },
  { genre_id: 2,  name: 'Ballad',   description: 'Nhạc ballad nhẹ nhàng, sâu lắng', img_url: 'https://picsum.photos/seed/genre-ballad/400/400' },
  { genre_id: 3,  name: 'Hip-hop',  description: 'Nhạc hip-hop, rap Việt',        img_url: 'https://picsum.photos/seed/genre-hiphop/400/400' },
  { genre_id: 4,  name: 'Rap',      description: 'Rap Việt Nam',                   img_url: 'https://picsum.photos/seed/genre-rap/400/400' },
  { genre_id: 5,  name: 'R&B',      description: 'Rhythm and Blues',               img_url: 'https://picsum.photos/seed/genre-rnb/400/400' },
  { genre_id: 6,  name: 'Indie',    description: 'Nhạc indie / underground',       img_url: 'https://picsum.photos/seed/genre-indie/400/400' },
  { genre_id: 7,  name: 'Acoustic', description: 'Nhạc acoustic mộc mạc',          img_url: 'https://picsum.photos/seed/genre-acoustic/400/400' },
  { genre_id: 8,  name: 'Dance',    description: 'Nhạc dance sôi động',            img_url: 'https://picsum.photos/seed/genre-dance/400/400' },
  { genre_id: 9,  name: 'EDM',      description: 'Electronic Dance Music',         img_url: 'https://picsum.photos/seed/genre-edm/400/400' },
  { genre_id: 10, name: 'Rock',     description: 'Nhạc rock Việt Nam',             img_url: 'https://picsum.photos/seed/genre-rock/400/400' },
];
