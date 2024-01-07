/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.alterColumn('users', 'username', {
    type: 'VARCHAR(50)',
    unique: true,
    notNull: true,
  });
};

exports.down = (pgm) => {
  pgm.alterColumn('users', 'username', {
    type: 'VARCHAR(50)',
    unique: false,
    notNull: true,
  });
};
