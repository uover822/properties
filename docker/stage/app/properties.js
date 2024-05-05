const Promise = require('bluebird')
const client = require('prom-client')
const ip = require('ip')

const registry = new client.Registry()

module.exports = function properties(options) {

  let Seneca = this
  let senact = Promise.promisify(Seneca.act, {context: Seneca})

  client.collectDefaultMetrics({registry})

  let gauges = {}

  function pack (begin_ts, end_ts) {
    // pack begin_ts with 1/ e_tm
    let pe_tm = 1 / (end_ts - begin_ts)
    return begin_ts + pe_tm
  }

  Seneca.add({role:'properties',cmd:'metrics.collect'}, async (msg, reply) => {
    try {
      let Seneca = this
      // Enable the collection of default metrics

      let r = (await registry.metrics())

      return reply(null,{result:r})
    } catch(e) {
      console.log(e)
    }
  })

  Seneca.add({role:'properties', cmd:'upd'}, async (msg,reply) => {

    let begin_ts = Date.now()

    if (!gauges['properties.upd.ts'])
      gauges['properties.upd.ts'] = new client.Gauge({
        name: 'perf_properties_upd_ts',
        help: 'ts when upding a properties',
        labelNames: ['event','return_code','service','cluster','app','user','ip','cid'],
        registers: [registry]
      })

    try {
      let p = (await senact('role:store,cmd:updProperties',
                            {id:msg.id,properties:msg.properties,cid:msg.cid}).then ((o) => {
                              return o
                            }))
      gauges['properties.upd.ts'].set({event:'properties.upd', return_code:'200', service:'properties', cluster:process.env.cluster, app:process.env.app, user:process.env.user, ip:ip.address(), cid:msg.cid}, pack(begin_ts, Date.now()))

      return reply(null,p)
    } catch(e) {
      console.log(e)
      gauges['properties.upd.ts'].set({event:'properties.upd', return_code:'500', service:'properties', cluster:process.env.cluster, app:process.env.app, user:process.env.user, ip:ip.address(), cid:{}}, pack(begin_ts, Date.now()))
    }
  })
}
