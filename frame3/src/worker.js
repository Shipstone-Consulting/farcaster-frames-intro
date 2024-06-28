/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    try {
      // Add logic to decide whether to serve an asset or run your original Worker code
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      const url = new URL(request.url);
      const origin = url.origin;
      const isPost = request.method === "POST";
      if (url.pathname !== "/") {
        return;
      }
      return new Response(
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="fc:frame:post_url"
      content="${origin}"
    />
    <meta property="fc:frame" content="vNext" />
    <meta
      property="fc:frame:image"
      content="${origin}/${
          ["fortune-teller.png", "happy-emoji.png", "good-emoji.png"][
            isPost ? Math.floor(Math.random() * 2) + 1 : 0
          ]
        }"
    />
    <meta property="fc:frame:button:1" content="Get the Code" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta
      property="fc:frame:button:1:target"
      content="https://github.com/shipstone-labs/farcaster-frames-intro"
    />
    <meta property="fc:frame:button:2" content="Tell me how I'm feeling!" />
    <meta property="fc:frame:button:2:action" content="post" />

    <title>Farcaster Frame - Response Frame Example</title>
  </head>
  <body>
    <script>
            window.addEventListener('message', function(event) {
              if (event.data && event.data.action === 'image_display') {
                document.body.innerHTML = '<img src="https://shipstone-labs.github.io/farcaster-frames-intro/frame2/happy.png"
      " alt="Image" />';
              }
            });
    </script>
  </body>
</html>
`,
        { headers: { "Content-Type": "text/html; charset=UTF-8" } }
      );
    }
  },
};
