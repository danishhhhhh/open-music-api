const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { SongPayloadSchema, PostSongToPlaylistPayloadSchema };
