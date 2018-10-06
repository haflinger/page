'use strictuse str '

const path = require('path');
const cluster = require('cluster');
const { as } = require('@cuties/cutie');
const { If, Else } = require('@cuties/if-else');
const { IsMaster, ClusterWithForkedWorkers } = require('@cuties/cluster');
const { ReadDataByPath } = require('@cuties/fs');
const { ParsedJSON, Value } = require('@cuties/json');
const { ExecutedScripts } = require('@cuties/scripts');
const { Backend, RestApi, ServingFiles, CachedServingFiles } = require('@cuties/rest');
const { WatcherWithEventTypeAndFilenameListener } = require('@cuties/fs');
const CustomNotFoundMethod = require('./CustomNotFoundMethod');
const OnStaticGeneratorsChangeEvent = require('./OnStaticGeneratorsChangeEvent');
const OnTemplatesChangeEvent = require('./OnTemplatesChangeEvent');

const numCPUs = require('os').cpus().length;
const notFoundMethod = new CustomNotFoundMethod(new RegExp(/\/not-found/));
const mapper = (url) => {
  return url.split('/').filter(path => path !== '').join(...paths);
}

const launchedBackend = new Backend(
  new Value(as('config'), 'port'),
  new Value(as('config'), 'host'),
  new RestApi(
    new CachedServingFiles(new RegExp(/\/static/), mapper, notFoundMethod),
    notFoundMethod
  )
);

new ParsedJSON(
  new ReadDataByPath('./config.json')
).as('config').after(
  new If(
    new IsMaster(cluster),
    new ExecutedScripts(
      new Value(as('config'), 'staticGeneratorsDirectory')
    ).after(
      new WatcherWithEventTypeAndFilenameListener(
        new Value(as('config'), 'staticGeneratorsDirectory'),
        { persistent: true, recursive: true, encoding: 'utf8' },
        new OnStaticGeneratorsChangeEvent()
      ).after(
        new WatcherWithEventTypeAndFilenameListener(
          new Value(as('config'), 'templatesDirectory'),
          { persistent: true, recursive: true, encoding: 'utf8' },
          new OnTemplatesChangeEvent()
        )
      )
    )
  ).after(
    new If(
      new Value(as('config'), 'clusterMode'),
      new If(
        new IsMaster(cluster),
        new ClusterWithForkedWorkers(
          cluster, numCPUs
        ),
        new Else(
          launchedBackend
        )
      ),
      new Else(
        launchedBackend
      )
    )
  )
).call();
