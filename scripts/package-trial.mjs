import { gzipSync } from "node:zlib";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const releaseDir = join(root, "release");
const packageName = `erp-cocina-modo-prueba-${new Date().toISOString().slice(0, 10)}`;
const stagingDir = join(releaseDir, packageName);
const outputFile = join(releaseDir, `${packageName}.tar.gz`);

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function copyPublicBuild(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    const to = join(dest, entry);
    const info = statSync(from);
    if (info.isDirectory()) {
      copyPublicBuild(from, to);
    } else if (info.isFile()) {
      writeFileSync(to, readFileSync(from));
    }
  }
}

function tarHeader(name, size, mode = 0o644) {
  const header = Buffer.alloc(512, 0);
  const write = (value, offset, length) => header.write(String(value).slice(0, length), offset, length, "ascii");
  write(name, 0, 100);
  write(mode.toString(8).padStart(7, "0") + "\0", 100, 8);
  write("0000000\0", 108, 8);
  write("0000000\0", 116, 8);
  write(size.toString(8).padStart(11, "0") + "\0", 124, 12);
  write(Math.floor(Date.now() / 1000).toString(8).padStart(11, "0") + "\0", 136, 12);
  header.fill(" ", 148, 156);
  write("0", 156, 1);
  write("ustar", 257, 6);
  write("00", 263, 2);
  let sum = 0;
  for (const byte of header) sum += byte;
  write(sum.toString(8).padStart(6, "0") + "\0 ", 148, 8);
  return header;
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const info = statSync(path);
    return info.isDirectory() ? listFiles(path) : [path];
  });
}

function createTarGz(sourceDir, output) {
  const chunks = [];
  for (const file of listFiles(sourceDir)) {
    const data = readFileSync(file);
    const name = relative(sourceDir, file).split(sep).join("/");
    chunks.push(tarHeader(name, data.length), data);
    const padding = (512 - (data.length % 512)) % 512;
    if (padding) chunks.push(Buffer.alloc(padding, 0));
  }
  chunks.push(Buffer.alloc(1024, 0));
  writeFileSync(output, gzipSync(Buffer.concat(chunks)));
}

if (!exists(distDir)) {
  console.error("No existe dist/. Ejecuta npm run build antes de crear el paquete.");
  process.exit(1);
}

mkdirSync(releaseDir, { recursive: true });
if (exists(stagingDir)) rmSync(stagingDir, { recursive: true, force: true });
copyPublicBuild(distDir, stagingDir);
writeFileSync(join(stagingDir, "LEEME_MODO_PRUEBA.txt"), [
  "ERP Cocina Institucional - modo prueba",
  "",
  "Este paquete contiene solo la version compilada del ERP.",
  "No incluye la carpeta src, repositorio Git ni codigo fuente editable.",
  "",
  "Uso recomendado:",
  "1. Publicar esta carpeta en Netlify, Vercel o cualquier hosting estatico.",
  "2. Compartir un usuario limitado desde el panel Admin del ERP.",
  "3. Cargar un archivo modo-prueba-erp-AAAA-MM-DD.json si quieres iniciar sin datos reales.",
  "",
  "Nota: al ser una PWA estatica, los datos diligenciados en modo prueba quedan en el navegador del interesado hasta conectar una base multiusuario.",
].join("\n"));
createTarGz(stagingDir, outputFile);
console.log(`Paquete creado: ${outputFile}`);
