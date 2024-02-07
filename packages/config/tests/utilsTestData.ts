import { IConfigSource } from 'config';
import path from 'path';

export const sampleConfigSources: IConfigSource[] = [
  {
    name: path.join('./config', 'default.json'),
    original:
      '{\r\n  "apiType": "explorer",\r\n  "servers": {\r\n    "url": "something.org"\r\n  },\r\n  "apis": {\r\n    "explorer": {\r\n      "url": "example.com",\r\n      "port": 443\r\n    }\r\n  }\r\n}\r\n',
    parsed: {
      apiType: 'explorer',
      servers: { url: 'something.org' },
      apis: { explorer: { url: 'example.com', port: 443 } },
    },
  },
  {
    name: path.join('./config', 'local.json'),
    original: '{\r\n  "servers": {\r\n    "url": "example.org"\r\n  }\r\n}\r\n',
    parsed: { servers: { url: 'example.org' } },
  },
  {
    name: path.join('./config', 'custom-environment-variables.json'),
    original:
      '{\r\n  "servers": {\r\n    "port": "SERVER_PORT"\r\n  }\r\n}\r\n',
    parsed: { servers: { port: 'SERVER_PORT' } },
  },
];
