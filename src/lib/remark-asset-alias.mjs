import { visit } from 'unist-util-visit';
import path from 'path';
import { fileURLToPath } from 'url';

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function convertPath(url, fileDir) {
  if (typeof url !== 'string' || !url.startsWith('~/')) return url;
  const abs = path.join(srcDir, url.slice(2));
  return path.relative(fileDir, abs).replace(/\\/g, '/');
}

export function remarkAssetAlias() {
  return (tree, file) => {
    if (!file.path) return;
    const fileDir = path.dirname(
      typeof file.path === 'string' && file.path.startsWith('file://')
        ? fileURLToPath(file.path)
        : file.path,
    );
    visit(tree, 'image', (node) => {
      node.url = convertPath(node.url, fileDir);
    });
    visit(tree, 'link', (node) => {
      node.url = convertPath(node.url, fileDir);
    });
  };
}
