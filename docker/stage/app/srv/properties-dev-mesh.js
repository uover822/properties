let Seneca = require('seneca')

Seneca({tag: 'properties', timeout: 5000})
  //.test()
  //.test('print')
  //.use('monitor')
  .use('entity')
  .use('jsonfile-store', {folder: __dirname+'/../../data'})
  .use('../properties.js')
  .listen(9045)
  .client({pin:'role:reason', port:9055})
  .use('mesh')