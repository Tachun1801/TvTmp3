/**
 * Mock data — Favorites (bài hát yêu thích của user)
 *
 * Lưu dưới dạng Set<userId, Set<songId>> để dễ add/remove/check.
 * Backend thật: bảng favorite_songs (song_id, user_id).
 *
 * Hiện tại mock user id=1 (Admin) đã like các bài: 1, 4, 7, 10, 14, 20
 */

import { mockSongs } from './songs';

// songIds được user yêu thích (key = userId)
const favoriteMap = new Map([
  [1, new Set([1, 4, 7, 10, 14, 20])],
  [2, new Set([2, 5, 11])],
  [3, new Set([8, 15, 19, 20])],
]);

function getFavoritesForUser(userId) {
  return favoriteMap.get(userId) || new Set();
}

export function mockGetFavorites(userId) {
  const ids = getFavoritesForUser(userId);
  return mockSongs.filter((s) => ids.has(s.id));
}

export function mockAddFavorite(userId, songId) {
  if (!favoriteMap.has(userId)) favoriteMap.set(userId, new Set());
  favoriteMap.get(userId).add(songId);
  return { success: true };
}

export function mockRemoveFavorite(userId, songId) {
  const ids = getFavoritesForUser(userId);
  ids.delete(songId);
  return { success: true };
}
