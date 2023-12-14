Package.describe({
  name: 'kolyasya:oplog-keep-awake',
  version: '0.0.5',
  summary: 'Upserts a new entry into keepAwake collection to keep an oplog tailable',
  git: 'https://github.com/kolyasya/meteor-oplog-keep-awake',
  documentation: '../../../README.md',
});

Npm.depends({});

Package.onUse(function (api) {
  api.versionsFrom('2.3.5');
  api.use(['ecmascript', 'littledata:synced-cron@1.3.2']);

  api.mainModule('server.js', 'server');
});
