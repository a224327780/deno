const toClash = (item: { [Key: string]: any }) => {
    const network = item['net']
    let name = item['ps']
    if (name.includes('@')) {
        const a = name.split('@')[0].replace(/No\.\d+_/i, "")
        const result = name.match(/No\.\d+_/i)[0].replace('_', '')
        name = `${a}@${result}`
    }

    const data: { [Key: string]: any } = {
        "name": name,
        "server": item['add'],
        "port": item['port'],
        "type": "vmess",
        "uuid": item['id'],
        "alterId": item['aid'],
        "cipher": "auto",
        "tls": item['tls'] !== undefined && item['tls'] !== 'none',
        "skip-cert-verify": true,
    }
    if (network === 'ws') {
        let host = item['host']
        if (!host || host === 'none') {
            host = item['add']
        }
        data['network'] = network
        data['ws-opts'] = {
            "path": item['path'],
            "headers": {
                "Host": host
            }
        }
    }
    return data
}

export const parseVmess = (str: string) => {
    const decodedString = atob(str);
    const clashData = []
    const items = decodedString.split("\n")
    for (let i in items) {
        const item = items[i]
        if (!item.includes('vmess')) {
            continue
        }
        const node_item = item.replace('vmess://', '')
        try {
            const vmess = atob(node_item)
            const vmess_node = toClash(JSON.parse(vmess))
            clashData.push(vmess_node)
        } catch (error) {
            console.log(`${node_item}\n${error}`)
        }
    }
    return clashData
}