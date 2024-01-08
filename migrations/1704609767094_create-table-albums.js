/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });

  // membuat user baru.
  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('album-', '-', 0000)");
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
  // delete user baru.
  pgm.sql("DELETE FROM albums WHERE id = 'album-'");
};
