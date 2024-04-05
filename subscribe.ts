import {DefaultClashYml, DevClashRule} from "./clash.ts";
import {parse, stringify} from "https://deno.land/std@0.175.0/encoding/yaml.ts";

import {parseVmess} from "./vmess.ts";

class Subscribe {

    private userAget = {'User-Agent': 'ClashMetaForAndroid/2.7.1.Meta-Alpha (Prefer ClashMeta Format)'}
    private testUrl = 'https://www.gstatic.com/generate_204'
    private providerTemplate = {
        'interval': 7200, 'url': '', 'type': 'http', 'path': '',
        'health-check': {'enable': true, 'interval': 7200, 'url': this.testUrl}
    }

    trim(str: string, char: string) {
        const reg = new RegExp(`^${char}+|${char}+$`, 'g');
        return str.replace(reg, '');
    }

    async get_subscribe(subscribes: [], domain: string, is_dev: boolean) {
        domain = this.trim(domain, '/')

        const yamlCode = parse(DefaultClashYml)

        yamlCode['proxy-providers'] = {}
        yamlCode['proxy-groups'] = [
            {'name': '全局选择', 'type': 'select', 'proxies': ['故障转移', '自动选择', '机场节点']},
            {'name': '机场节点', 'type': 'select', 'proxies': []},
            {'name': '故障转移', 'type': 'fallback', 'proxies': [], 'interval': 7200, 'url': this.testUrl},
            {'name': '自动选择', 'type': 'url-test', 'use': [], 'interval': 7200, 'url': this.testUrl},
        ]

        const proxiesNames: any[] = []

        let j = 2
        for (let i in subscribes) {
            const url = encodeURIComponent(subscribes[i])
            const provider = JSON.parse(JSON.stringify(this.providerTemplate))
            provider['url'] = `${domain}/convert?url=${url}&name=${i}`
            provider['path'] = `provider2/${i}.yaml`
            proxiesNames.push(i)

            yamlCode['proxy-providers'][i] = provider
            yamlCode['proxy-groups'].splice(j, 0, {'name': i, 'type': 'select', 'use': [i]})
            j += 1
        }

        const n = yamlCode['proxy-groups'].length
        yamlCode['proxy-groups'][1]['proxies'] = proxiesNames
        yamlCode['proxy-groups'][n - 2]['proxies'] = proxiesNames
        yamlCode['proxy-groups'][n - 1]['use'] = proxiesNames

        if (is_dev) {
            for (let rule in DevClashRule) {
                yamlCode['rules'].splice(0, 0, DevClashRule[rule])
            }
        }
        return stringify(yamlCode)
    }

    async update_subscribe_by_url(url: string) {
        try {
            const response = await fetch(url, {headers: this.userAget})
            const html = await response.text()
            if (html.includes('proxies')) {
                const data = parse(html)
                if (url.includes('share.cjy.me')) {
                    for (let i in data['proxies']) {
                        const name = data['proxies'][i]['name']
                        const a = name.split('@')[0].replace(/No\.\d+_/i, "")
                        const result = data['proxies'][i]['name'].match(/No\.\d+_/i)[0].replace('_', '')
                        data['proxies'][i]['name'] = `${a}@${result}`
                    }
                }
                return data['proxies']
            }
            if (!html.includes('html')) {
                return parseVmess(html)
            }
            console.log(html)
            return []
        } catch (error) {
            console.log(`update_subscribe_by_url: ${url}\n${error}`)
        }
        return []
    }

    async cron_update_subscribe(subscribes: []) {
        const data_list = {}
        for (const i in subscribes) {
            const url = subscribes[i]
            let data = []
            console.log(`Update subscribe: ${i}`)
            data = await this.update_subscribe_by_url(url)
            if (data && data.length) {
                data_list[i] = data
            }
            console.log(`[${i}] 节点数量: ${data.length}`)
        }
        return data_list
    }
}

export {Subscribe}