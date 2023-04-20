# kolyasya:oplog-keep-awake — Keeps Mongo Oplog awake by upserting values on interval

## Depends on [meteor-synced-cron](https://github.com/percolatestudio/meteor-synced-cron)

To make it work properly you need to use `meteor-synced-cron` in your project

## Installation:

```
meteor add kolyasya:oplog-keep-awake
```

## Package settings:

```js
{
  // ...regular Meteor settings.json file...

  packages: {

    // ...other packages settings...,

    "kolyasya:oplog-keep-awake": {
      // Mongo collection name to store single entry
      keepAwakeCollectionName: 'keepAwake',

      // Interval in seconds when the entry will be updated
      keepAwakeUpsertIntervalSeconds: 120,
    }
  }
}
```

## Usage example:

Check `./example` directory

```js
import initOplogKeepAwake from 'meteor/kolyasya:oplog-keep-awake';

Meteor.startup(() => {
  initOplogKeepAwake();

  SyncedCron.start();
});
```
