const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylist(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }

  async postSongToPlaylistByIdHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.addSongToPlaylist({ playlistId: id, songId, userId: credentialId });

    const response = h.response({
      status: 'success',
      message: 'playlist berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getSongInPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._service.getSongInPlaylist(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongInPlaylistByIdHandler(request) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.deleteSongInPlaylistById({ id, songId, credentialId });

    return {
      status: 'success',
      message: 'Song dari Playlist berhasil dihapus',
    };
  }

  async getActivitiesInPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    const activities = await this._service.getActivities(id);
    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistHandler;
