const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

async function main(names) {
  const root = path.resolve(__dirname, '../public');
  const icons = path.join(root, 'icons');
  const output = path.join(root, 'holograms');
  const { window } = new JSDOM();
  global.DOMParser = window.DOMParser;
  global.XMLSerializer = window.XMLSerializer;
  const { compileLogo } = await import('../src/lib/compileLogo.js');
  const files = names.length ? names.map(name => name + '.svg') : fs.readdirSync(icons).filter(name => name.endsWith('.svg'));
  fs.mkdirSync(output, { recursive: true });
  for (const file of files) {
    if (path.basename(file) !== file) throw new Error('Expected an icon name: ' + file);
    const positions = Float32Array.from(compileLogo(fs.readFileSync(path.join(icons, file), 'utf8')));
    if (!positions.length || positions.length % 6 || !positions.every(Number.isFinite)) throw new Error('Invalid geometry: ' + file);
    fs.writeFileSync(path.join(output, path.basename(file, '.svg') + '.bin'), Buffer.from(positions.buffer));
    console.log(file, positions.length / 6, 'segments');
  }
  window.close();
}
main(process.argv.slice(2)).catch(error => { console.error(error); process.exitCode = 1; });
