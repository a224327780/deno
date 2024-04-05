import {Hono} from "https://deno.land/x/hono@v3.4.1/mod.ts";
import {stringify} from "https://deno.land/std@0.175.0/encoding/yaml.ts";

import {Subscribe} from "./subscribe.ts";


const app = new Hono();
const kv = await Deno.openKv();
const kv_name = 'subscribe'


const subscribe = new Subscribe()

app.get("/", async (c) => {
    const isDev = c.req.query('dev')
    const kvResult = await kv.get([kv_name]);
    const subscribes = kvResult.value
    const result = await subscribe.get_subscribe(subscribes, c.req.url, isDev !== undefined)
    return c.text(result);
});

app.post("/save", async (c) => {
    const body = await c.req.parseBody()
    const result = await kv.set([kv_name], body);
    return c.json(result);
});

app.get("/convert", async (c) => {
    const {url, name, force} = c.req.query()
    const subscribeNodeKey = `${kv_name}_${name}`
    const kvResult = await kv.get([subscribeNodeKey])
    let nodeData = kvResult.value
    if (nodeData === null || force === '1') {
        nodeData = await subscribe.update_subscribe_by_url(url)
        if (nodeData && JSON.stringify(nodeData).length < 65533) {
            await kv.set([subscribeNodeKey], nodeData)
        }
    }
    console.log(`[${name}]->${nodeData.length}`)
    nodeData.sort((a, b) => a.name.localeCompare(b.name));
    return c.text(stringify({proxies: nodeData}));
});

Deno.cron("Update subscribe", "0 */6 * * *", async () => {
    const kvResult = await kv.get([kv_name]);
    const subscribes = kvResult.value
    const data_list = await subscribe.cron_update_subscribe(subscribes)
    for (const name in data_list) {
        const data = data_list[name]
        data.sort((a, b) => a.name.localeCompare(b.name));
        if (JSON.stringify(data).length < 65533) {
            const subscribeNodeKey = `${kv_name}_${name}`
            await kv.set([subscribeNodeKey], data)
        }
    }
});

Deno.serve(app.fetch);
