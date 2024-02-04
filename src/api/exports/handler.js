const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, playlistService, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;

    autoBind(this);
  }

  async postExportSongHandler(request, h) {
    this._validator.validateExportSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export:song', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
