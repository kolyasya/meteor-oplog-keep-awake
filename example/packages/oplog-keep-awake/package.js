Package.describe({
  name: 'kolyasya:oplog-keep-awake',
  version: '0.1.0-beta.1',
  summary:
    'Upserts a new entry into keepAwake collection to keep an oplog tailable',
  git: 'https://github.com/kolyasya/meteor-oplog-keep-awake',
  documentation: '../../../README.md',
});

Npm.depends({});

Package.onUse(function (api) {
  api.versionsFrom('3.0-rc.1');
  api.use(['ecmascript@0.16.3', 'quave:synced-cron@2.0.3']);

  api.mainModule('server.js', 'server');
});
