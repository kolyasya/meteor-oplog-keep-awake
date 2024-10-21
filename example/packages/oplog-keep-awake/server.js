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
  constructor(config = {}) {
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
      SyncedCron.config(config);

      const keepAwakeCollection = new Mongo.Collection(
        packageSettings?.keepAwakeCollectionName
      );

      SyncedCron.add({
        name: `kolyasya:oplog-keep-awake | Upsert new entry to "${packageSettings?.keepAwakeCollectionName}" Mongo DB Collection each ${packageSettings?.keepAwakeUpsertIntervalSeconds} seconds`,
        schedule(parser) {
          return prepareProperSchedule({
            intervalSeconds: packageSettings.keepAwakeUpsertIntervalSeconds,
            parser,
          });
        },
        async job() {
          const cronHistoryCollection = SyncedCron._collection;

          if (!cronHistoryCollection) {
            console.error(
              `Can't find CRON collection in DB to clean up old entries`
            );
          } else {
            // Delete old package logs from cron history
            // (from current time we subtract CRON interval in ms)
            await cronHistoryCollection?.removeAsync({
              name: { $regex: /kolyasya:oplog-keep-awake/ },
              finishedAt: {
                $lte: new Date(
                  Date.now() -
                    packageSettings?.keepAwakeUpsertIntervalSeconds * 1000
                ),
              },
            });
          }

          await keepAwakeCollection.upsertAsync(
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

/**
 * @typedef {Object} LogMessage
 * @property {string} level - 'info', 'error', 'warn', 'debug'
 * @property {string} message
 * @property {string} tag
 */

/**
 * @callback logger
 * @param {LogMessage} logMessage
 * @returns {void}
 */

/**
 * @typedef {Object} Config
 * @property {boolean} log - Log job run details to console
 * @property {?logger} logger - Use a custom logger function (defaults to Meteor's logging package)
 * @property {string} collectionName - Name of collection to use for synchronisation and logging
 * @property {boolean} utc - Default to using localTime
 * @property {number} collectionTTL -  TTL in seconds for history records in collection to expire
     NOTE: Unset to remove expiry but ensure you remove the index from
     mongo by hand

     ALSO: SyncedCron can't use the `_ensureIndex` command to modify
     the TTL index. The best way to modify the default value of
     `collectionTTL` is to remove the index by hand (in the mongo shell
     run `db.cronHistory.dropIndex({startedAt: 1})`) and re-run your
     project. SyncedCron will recreate the index with the updated TTL.
 */

/**
 * Root function, starts Synced Cron
 * @param {Config} config
 */
const initOplogKeepAwake = (config) => {
  if (!instance) {
    instance = new OplogKeepAwake(config);
  } else {
    console.warn(
      `kolyasya:oplog-keep-awake | Seems like you are trying to init package for a second time. You don't need to do this. Check related functions`
    );
  }

  return instance;
};

export default initOplogKeepAwake;
