import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      envDir: '.',
      build: {
        rollupOptions: {
          input: './src/client.tsx',
          output: {
            entryFileNames: 'static/client.js',
            chunkFileNames: 'static/[name].js',
            assetFileNames: 'static/[name].[ext]'
          }
        }
      }
    }
  } else {
    return {
      envDir: '.',
      ssr: {
        external: ['react', 'react-dom']
      },
      plugins: [
        devServer({
          entry: 'src/server.tsx'
        })
      ]
    }
  }
})
