import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import prepareProperSchedule from './utils/prepareProperSchedule';

const defaultSettings = {
  keepAwakeCollectionName: 'keepAwake',
  keepAwakeUpsertIntervalSeconds: 120,
};

const packageSettings = {
  ...defaultSettings,
  ...(Meteor.settings?.packages?.['kolyasya:oplog-keep-awake'] || {}),
};

let instance;

class OplogKeepAwake {
  constructor() {
    if (packageSettings?.keepAwakeCollectionName?.length < 2) {
      throw new Meteor.Error(
        'kolyasya:oplog-keep-awake | You need to specify a proper Mongo collection name for keepAwake collection'
      );
    }

    if (packageSettings.keepAwakeUpsertIntervalSeconds < 1) {
      throw new Meteor.Error(
        'kolyasya:oplog-keep-awake | Please specify keepAwake keepAwakeUpsertIntervalSeconds > 1000'
      );
    }

    console.log(
      `kolyasya:oplog-keep-awake | Establishing connection to ${packageSettings?.keepAwakeCollectionName} Mongo DB Collection...`
    );

    try {
      const keepAwakeCollection = new Mongo.Collection(
        packageSettings?.keepAwakeCollectionName
      );
      const cronHistoryCollection = SyncedCron._collection;

      const cronOperationName = `kolyasya:oplog-keep-awake | Upsert new entry to "${packageSettings?.keepAwakeCollectionName}" Mongo DB Collection each ${packageSettings?.keepAwakeUpsertIntervalSeconds} seconds`;
      SyncedCron.add({
        name: cronOperationName,
        schedule(parser) {
          return prepareProperSchedule({
            intervalSeconds: packageSettings.keepAwakeUpsertIntervalSeconds,
            parser,
          });
        },
        job() {
          cronHistoryCollection.remove({ 
            name: cronOperationName, 
            finishedAt: { $lte: new Date(new Date() - packageSettings?.keepAwakeUpsertIntervalSeconds * 1000) } // Delete old package logs from cron history(from current time we subtract cron interval in ms)
          })

          keepAwakeCollection.upsert(
            { _id: 'keepAwake' },
            { $set: { updatedAt: new Date() } }
          );
        },
        log: false,
      });
    } catch (error) {
      console.error(
        `kolyasya:oplog-keep-awake | Something went wrong during kolyasya:oplog-keep-awake initiation`,
        error
      );
    }
  }
}

const initOplogKeepAwake = () => {
  if (!instance) {
    instance = new OplogKeepAwake();
  } else {
    console.warn(
      `kolyasya:oplog-keep-awake | Seems like you are trying to init package for a second time. You don't need to do this. Check related functions`
    );
  }

  return instance;
};

export default initOplogKeepAwake;
