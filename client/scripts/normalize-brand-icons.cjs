const fs = require('node:fs');
const zlib = require('node:zlib');

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const size = Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([size, name, data, checksum]);
}

function transformPng(filePath, mode) {
  const source = fs.readFileSync(filePath);
  if (!source.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error(`${filePath} is not a PNG`);

  const chunks = [];
  const compressed = [];
  let offset = 8;
  while (offset < source.length) {
    const length = source.readUInt32BE(offset);
    const type = source.toString('ascii', offset + 4, offset + 8);
    const data = source.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data: Buffer.from(data) });
    if (type === 'IDAT') compressed.push(data);
    offset += 12 + length;
    if (type === 'IEND') break;
  }

  const header = chunks.find(({ type }) => type === 'IHDR')?.data;
  if (!header) throw new Error(`Missing PNG header: ${filePath}`);
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  if (header[8] !== 8 || header[9] !== 6 || header[12] !== 0) {
    throw new Error(`Expected non-interlaced 8-bit RGBA PNG: ${filePath}`);
  }

  const rowSize = width * 4;
  const raw = zlib.inflateSync(Buffer.concat(compressed));
  const pixels = Buffer.alloc(height * rowSize);
  let rawOffset = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rawOffset++];
    const rowStart = y * rowSize;
    for (let x = 0; x < rowSize; x++) {
      const value = raw[rawOffset++];
      const left = x >= 4 ? pixels[rowStart + x - 4] : 0;
      const up = y > 0 ? pixels[rowStart + x - rowSize] : 0;
      const upperLeft = y > 0 && x >= 4 ? pixels[rowStart + x - rowSize - 4] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);
        predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft;
      } else if (filter !== 0) throw new Error(`Unsupported PNG filter ${filter}`);
      pixels[rowStart + x] = (value + predictor) & 0xff;
    }
  }

  const backgroundPixel = (index) => {
    const alpha = pixels[index + 3];
    return alpha > 0 && pixels[index] >= 240 && pixels[index + 1] >= 240 && pixels[index + 2] >= 240;
  };
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const add = (x, y) => {
    const position = y * width + x;
    if (visited[position] || !backgroundPixel(position * 4)) return;
    visited[position] = 1;
    queue[tail++] = position;
  };
  for (let x = 0; x < width; x++) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    add(0, y);
    add(width - 1, y);
  }

  while (head < tail) {
    const position = queue[head++];
    const x = position % width;
    const y = Math.floor(position / width);
    const pixelIndex = position * 4;
    if (mode === 'transparent') {
      pixels[pixelIndex + 3] = 0;
    } else {
      pixels[pixelIndex] = 15;
      pixels[pixelIndex + 1] = 23;
      pixels[pixelIndex + 2] = 42;
    }
    if (x > 0) add(x - 1, y);
    if (x + 1 < width) add(x + 1, y);
    if (y > 0) add(x, y - 1);
    if (y + 1 < height) add(x, y + 1);
  }

  const scanlines = Buffer.alloc(height * (rowSize + 1));
  for (let y = 0; y < height; y++) pixels.copy(scanlines, y * (rowSize + 1) + 1, y * rowSize, (y + 1) * rowSize);
  const idat = zlib.deflateSync(scanlines, { level: 9 });
  const output = [PNG_SIGNATURE];
  let wroteIdat = false;
  for (const chunk of chunks) {
    if (chunk.type === 'IDAT') {
      if (!wroteIdat) output.push(makeChunk('IDAT', idat));
      wroteIdat = true;
    } else {
      output.push(makeChunk(chunk.type, chunk.data));
    }
  }
  fs.writeFileSync(filePath, Buffer.concat(output));
  console.log(`${mode}: ${filePath}`);
}

transformPng('apple-touch-icon.png', 'transparent');
transformPng('public/apple-touch-icon.png', 'transparent');
transformPng('public/maskable.png', 'brand-background');
