const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {mapDBAlbumsToModel} = require("../../utils");

class AlbumService {
  constructor(storageService) {
    this._pool = new Pool();
    this._storageService = storageService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const queryGetSong = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const song = await this._pool.query(queryGetSong);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    result.rows[0].songs = song.rows;
    return result.rows.map(mapDBAlbumsToModel)[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumCoverById(file, meta, albumId) {
    this._storageService.writeFile(file, meta, albumId);
  }

  async addDefaultAlbum() {
    const checkQuery = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: ['album-'],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      return;
    }

    const insertQuery = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: ['album-', 'album-', 2007],
    };

    const result = await this._pool.query(insertQuery);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
  }
}

module.exports = AlbumService;
