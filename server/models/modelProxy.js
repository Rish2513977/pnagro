import mongoose from 'mongoose';

export function createModelProxy(modelName, mongooseModel, localModel) {
  // Return a proxy that directs calls based on Mongoose connection state
  const handler = {
    get(target, prop, receiver) {
      const isMongooseConnected = mongoose.connection.readyState === 1;
      const activeModel = isMongooseConnected ? mongooseModel : localModel;

      if (prop in activeModel) {
        const val = activeModel[prop];
        if (typeof val === 'function') {
          return val.bind(activeModel);
        }
        return val;
      }

      // Fallback to localModel if mongooseModel doesn't have it (or vice versa)
      if (prop in localModel) {
        const val = localModel[prop];
        if (typeof val === 'function') {
          return val.bind(localModel);
        }
        return val;
      }

      return Reflect.get(target, prop, receiver);
    },

    // Support `new Model(data)` constructor syntax
    construct(target, args) {
      const isMongooseConnected = mongoose.connection.readyState === 1;
      if (isMongooseConnected) {
        return new mongooseModel(...args);
      }
      const data = args[0] || {};
      const doc = {
        _id: localModel.generateObjectId ? localModel.generateObjectId() : undefined,
        ...data,
      };
      // Return wrapped doc that can be saved
      return {
        ...doc,
        async save() {
          return await localModel.create(doc);
        },
      };
    },
  };

  return new Proxy(mongooseModel, handler);
}

