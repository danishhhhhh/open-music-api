const autoBind = require('auto-bind');

class LikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyAlbumId(id);
    await this._service.addLikeAlbumByid({ userId: credentialId, albumId: id });

    const response = h.response({
      status: 'success',
      message: 'Like album berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const result = await this._service.getLikeAlbumById(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: result.likeCount,
      },
    });

    if (result.dataSource === 'cache') {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteAlbumLikesByIdHandler(request) {
    const { id: albumsId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteLikeAlbumById(credentialId, albumsId);

    return {
      status: 'success',
      message: 'Like album berhasil dihapus',
    };
  }
}

module.exports = LikesHandler;
