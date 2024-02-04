require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongService');
const SongsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UserService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlist
const playlist = require('./api/playlist');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlists');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationService');
const CollaborationsValidator = require('./validator/collaborations');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// storage
const StorageService = require('./services/storage/StorageService');

const init = async () => {
  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/images'));
  const albumsService = new AlbumsService(storageService);
  const songsService = new SongsService(albumsService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistService = new PlaylistService(collaborationsService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
