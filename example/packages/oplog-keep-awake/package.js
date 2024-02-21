Package.describe({
  name: 'kolyasya:oplog-keep-awake',
  version: '0.1.0-beta.0',
  summary:
    'Upserts a new entry into keepAwake collection to keep an oplog tailable',
  git: 'https://github.com/kolyasya/meteor-oplog-keep-awake',
  documentation: '../../../README.md',
});

Npm.depends({});

Package.onUse(function (api) {
  api.versionsFrom('2.8.0');
  api.use(['ecmascript@0.16.3', 'littledata:synced-cron@1.5.1']);

  api.mainModule('server.js', 'server');
});
