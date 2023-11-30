Package.describe({
  name: 'kolyasya:oplog-keep-awake',
  version: '0.0.4',
  summary: 'Upserts new entry in keepAwake collection to keep oplog tailable',
  git: 'https://github.com/kolyasya/meteor-oplog-keep-awake',
  documentation: '../../../README.md',
});

Npm.depends({});

Package.onUse(function (api) {
  api.versionsFrom('2.3.5');
  api.use(['ecmascript', 'littledata:synced-cron@1.3.2']);

  api.mainModule('server.js', 'server');
});
