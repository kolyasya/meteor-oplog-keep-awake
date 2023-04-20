import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

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

    const keepAwakeCollection = new Mongo.Collection(
      packageSettings?.keepAwakeCollectionName
    );

    SyncedCron.add({
      name: `kolyasya:oplog-keep-awake | Upsert new entry to "${packageSettings?.keepAwakeCollectionName}" Mongo DB Collection each ${defaultSettings?.keepAwakeUpsertIntervalSeconds} seconds`,
      schedule(parser) {
        return parser
          .recur()
          .every(packageSettings.keepAwakeUpsertIntervalSeconds)
          .second();
      },
      job() {
        keepAwakeCollection.upsert(
          { _id: 'keepAwake' },
          { $set: { updatedAt: new Date() } }
        );
      },
      log: false,
    });
  }
}

const initOplogKeepAwake = () => {
  if (!instance) {
    instance = new OplogKeepAwake();
  }

  return instance;
};

export default initOplogKeepAwake;
