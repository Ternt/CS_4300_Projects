import { defineConfig } from '@rsbuild/core';

export default defineConfig({

  html: {
    template({ entryName }) {
      if (entryName === 'index')        return './src/index.html';
      if (entryName === 'thumbail-gen') return './src/tools/thumbnail-gen/index.html';
      return `./src/${entryName}/index.html`;
    },
    title: 'Thinh Pham',
  },
  source: {
    entry: {
      "index":        './src/index.js',
      "thumbail-gen": './src/tools/thumbnail-gen/index.js',
    },
  },
  output: {
    minify: false,
    distPath: {
      root: 'public',
    },
    copy: [
      { from: 'public/thumbnails', to: 'thumbnails', noErrorOnMissing: true },
      { from: 'src/projects.json', to: 'projects.json' },
    ],
  },
  server: {
    publicDir: [{ name: './src' }],
    historyApiFallback: false,
  },
});
