export const DevClashRule = [
    'DOMAIN-KEYWORD,qq,全局选择',
    'DOMAIN-KEYWORD,weixin,全局选择',
    'DOMAIN-KEYWORD,bilibili,全局选择',
    'DOMAIN-KEYWORD,aliyundrive,全局选择',
    'DOMAIN-KEYWORD,baidu,全局选择',
    'DOMAIN-KEYWORD,weibo,全局选择',
    'DOMAIN-KEYWORD,qlogo,全局选择',
    'DOMAIN-KEYWORD,qpic,全局选择',
    'DOMAIN-KEYWORD,hdslb,全局选择',
    'DOMAIN-KEYWORD,360.cn,全局选择'
]

export const DefaultClashYml = `
  mixed-port: 7890
  allow-lan: false
  mode: rule
  log-level: info
  external-controller: 127.0.0.1:9090
  
  dns:
    enable: true
    ipv6: true
    prefer-h3: true
    default-nameserver:
      - 223.5.5.5
      - 180.76.76.76
      - 119.29.29.29
      - 117.50.11.11
      - 117.50.10.10
      - 114.114.114.114
    nameserver:
      - https://dns.cooluc.com/dns-query
      - https://doh.pub/dns-query
      - https://dns.twnic.tw/dns-query
    fallback:
      - https://dns.cloudflare.com/dns-query
      - https://dns.alidns.com/dns-query
    fallback-filter:
      geoip: true
      geoip-code: CN
      ipcidr:
        - 240.0.0.0/4
  proxy-providers: {}
  
  proxy-groups: []
  
  rule-providers:
    reject:
      type: http
      behavior: domain
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt"
      path: ./ruleset/reject.yaml
      interval: 86400
    
    direct:
      type: http
      behavior: domain
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt"
      path: ./ruleset/direct.yaml
      interval: 86400
    
    cncidr:
      type: http
      behavior: ipcidr
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt"
      path: ./ruleset/cncidr.yaml
      interval: 86400
    
    lancidr:
      type: http
      behavior: ipcidr
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt"
      path: ./ruleset/lancidr.yaml
      interval: 86400
  
  rules:
    - RULE-SET,reject,REJECT
    - RULE-SET,direct,DIRECT
    - RULE-SET,lancidr,DIRECT
    - RULE-SET,cncidr,DIRECT
    - GEOIP,LAN,DIRECT
    - GEOIP,CN,DIRECT
    - MATCH,全局选择
    `