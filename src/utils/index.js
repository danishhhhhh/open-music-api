/* eslint-disable camelcase */
const mapDBSongsToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBAlbumsToModel = ({
  id,
  name,
  year,
  cover_url,
  songs,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
  songs,
});

module.exports = { mapDBSongsToModel, mapDBAlbumsToModel };
