import { defineConfig } from '@rsbuild/core';
import { existsSync }   from 'fs';

export default defineConfig({

  html: {
    template({ entryName }) {
      if (entryName === 'index')    return './src/index.html';
      if (entryName === 'thumbail-gen') return './src/tools/thumbnail-gen/index.html';
      return `./src/${entryName}/index.html`;
    },
    title: 'Thinh Pham',
  },
  source: {
    entry: {
      "index": './src/index.js',
      "thumbail-gen": './src/tools/thumbnail-gen/index.js',
    },
  },
  output: {
    minify: false,
    distPath: {
      root: 'public',
    },
    copy: [
      ...(existsSync('./public/thumbnails')
        ? [{ from: 'public/thumbnails', to: 'thumbnails' }]
        : []),
      { from: 'src/projects.json', to: 'projects.json' },
    ],
  },
  server: {
    publicDir: [{ name: './src' }],
    historyApiFallback: false,
  },
});

