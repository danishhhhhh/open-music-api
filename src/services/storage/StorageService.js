const fs = require('fs');
const { Pool } = require('pg');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    this._pool = new Pool();

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  async writeFile(file, meta, id) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    const fileName = await new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });

    const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${fileName}`;

    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2',
      values: [fileUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error(`Album with ID ${id} not found`);
    }
  }
}

module.exports = StorageService;
