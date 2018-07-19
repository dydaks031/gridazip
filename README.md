# Gridazip user site

### Overall

- Node.js v8.9.3 (ES6)
- Less
- With browser-sync

### Installaztion

```bash
  $ git clone http://gitlab.gridazip.co.kr/gridazip/gridazip.co.kr.git
  $ npm install
  $ npm start
```

### Deploy

> You must install eb CLI and set your IAM Account Before deploy to server. See the link below for more detail
https://docs.aws.amazon.com/ko_kr/elasticbeanstalk/latest/dg/eb-cli3-configuration.html

```bash
  $ git checkout *your-branch-name*
  $ eb use
  $ eb deploy
```

### History

**2017-02-09**
Update Node.js version 7.6.0 to 8.9.3