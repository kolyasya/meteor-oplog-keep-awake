import initOplogKeepAwake from 'meteor/kolyasya:oplog-keep-awake';

Meteor.startup(() => {
  initOplogKeepAwake();

  SyncedCron.start();
});
