const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLikeAlbumByid({ userId, albumId }) {
    const id = `like-${nanoid(16)}`;

    const checkQuery = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const checkLikes = await this._pool.query(checkQuery);

    if (checkLikes.rowCount) {
      throw new InvariantError('Pengguna sudah menyukai album ini sebelumnya');
    }

    const insertQuery = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(insertQuery);

    if (!result.rowCount) {
      throw new InvariantError('Like album gagal ditambahkan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async getLikeAlbumById(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);

      const likeCount = JSON.parse(result);

      return { likeCount, dataSource: 'cache' };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Like album tidak ditemukan');
      }

      const likeCount = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`likes:${albumId}`, likeCount);
      return { likeCount };
    }
  }

  async deleteLikeAlbumById(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like album tidak ditemukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async verifyAlbumId(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = LikesService;
