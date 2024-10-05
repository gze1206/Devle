import { Hono } from 'hono'
import { renderToString } from 'react-dom/server'

import UserApi from './api/user'

const app = new Hono()

app.route('/api', UserApi)

app.get('/', (c) => {
  const isProd = process.env.NODE_ENV === "production" || import.meta.env.PROD

  return c.html(
    renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <link rel="stylesheet" href="/static/simple.min.css" />
          {isProd ? (
              <script type="module" src="/static/client.js"></script>
          ) : (
              <script type="module" src="/src/client.tsx"></script>
          )}
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    )
  )
})

export default app
