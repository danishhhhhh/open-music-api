/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat user baru.
  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('album-', '-', 0000)");
};

exports.down = (pgm) => {
  // delete user baru.
  pgm.sql("DELETE FROM albums WHERE id = 'album-'");
};
