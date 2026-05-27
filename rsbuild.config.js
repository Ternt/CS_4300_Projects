import { defineConfig } from '@rsbuild/core';

const website = {
  html: {
    template({ entryName }) {
      if (entryName === 'index') return './src/index.html';
      return `./src/${entryName}/index.html`;
    },
    title: 'Thinh Pham',
  },
  source: {
    entry: {
      index: './src/index.js',
      proj1: './src/proj1/index.js',
      proj2: './src/proj2/index.js',
      proj3: './src/proj3/index.js',
      proj4: './src/proj4/index.js',
      proj5: './src/proj5/index.js',
      projFinal: './src/projFinal/index.js',
    },
  },
};

const thumbgen = {
  html: {
    template: './src/tools/thumbnail-gen/index.html',
    title: 'Thumbnail Generator',
  },
  source: {
    entry: {
      'thumbnail-gen': './src/tools/thumbnail-gen/index.js',
    },
  },
};

const PROGRAMS = { website, thumbgen };
const active   = PROGRAMS[process.env.PROGRAM ?? 'website'];

export default defineConfig({
  ...active,
  output: {
    minify: false,
    distPath: {
      root: 'dist',
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
