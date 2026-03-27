import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'

export default defineConfig({
  root: '.',
  input: { path: './openapi.json' },
  output: { path: './src/gen', clean: true },
  plugins: [
    pluginOas(),
    pluginTs({
      output: { path: 'models' },
    }),
    pluginClient({
      output: { path: 'client.ts' },
      baseURL: 'http://localhost:3001',
    }),
    pluginReactQuery({
      output: { path: 'hooks' },
      query: { methods: ['get'] },
      mutation: { methods: ['post', 'put', 'delete', 'patch'] },
    }),
  ],
})
