import path from 'path';
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'configTestFiles');
process.env['SERVER_PORT'] = '777';
