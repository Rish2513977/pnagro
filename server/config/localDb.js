import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'pnagro_local_db.json');

// In-memory collections storage
const storage = {
  users: [],
  equipments: [],
  bookings: [],
  reviews: [],
};

let isInitialized = false;

// Generate MongoDB-compatible 24-char hex ObjectId
export const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + random;
};

// Helper to access nested properties like 'location.state'
function getNestedValue(obj, pathStr) {
  if (!obj || !pathStr) return undefined;
  if (!pathStr.includes('.')) return obj[pathStr];
  const parts = pathStr.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

// Check if a document matches a single filter condition
function matchCondition(docVal, condition) {
  if (condition === undefined) return true;

  // Regex condition
  if (condition instanceof RegExp) {
    if (Array.isArray(docVal)) {
      return docVal.some((item) => condition.test(String(item)));
    }
    return condition.test(String(docVal || ''));
  }

  // Operator object: $regex, $in, $gte, $lte
  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    // $regex operator
    if (condition.$regex) {
      const flags = condition.$options || '';
      const rx = new RegExp(condition.$regex, flags);
      if (Array.isArray(docVal)) {
        return docVal.some((item) => rx.test(String(item)));
      }
      return rx.test(String(docVal || ''));
    }

    // $in operator
    if (Array.isArray(condition.$in)) {
      if (Array.isArray(docVal)) {
        return condition.$in.some((inVal) => {
          if (inVal instanceof RegExp) {
            return docVal.some((item) => inVal.test(String(item)));
          }
          return docVal.some((item) => String(item) === String(inVal));
        });
      }
      return condition.$in.some((inVal) => {
        if (inVal instanceof RegExp) {
          return inVal.test(String(docVal || ''));
        }
        return String(docVal) === String(inVal);
      });
    }

    // $gte / $lte operators
    let gtePassed = true;
    let ltePassed = true;
    if (condition.$gte !== undefined) {
      gtePassed = Number(docVal) >= Number(condition.$gte);
    }
    if (condition.$lte !== undefined) {
      ltePassed = Number(docVal) <= Number(condition.$lte);
    }
    return gtePassed && ltePassed;
  }

  // Array value checking (e.g. availableAttachments includes 'Cultivator')
  if (Array.isArray(docVal)) {
    return docVal.some((item) => String(item).toLowerCase() === String(condition).toLowerCase());
  }

  // Standard equality (case-insensitive for role / status strings, ID equality)
  if (typeof docVal === 'string' && typeof condition === 'string') {
    return docVal.toLowerCase() === condition.toLowerCase();
  }

  return String(docVal) === String(condition);
}

// Check if a document matches full query
function matchDocument(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key of Object.keys(query)) {
    if (key === '$or') {
      const orConditions = query.$or;
      if (!Array.isArray(orConditions)) continue;
      const matchedAny = orConditions.some((cond) => matchDocument(doc, cond));
      if (!matchedAny) return false;
      continue;
    }

    const docVal = getNestedValue(doc, key);
    const cond = query[key];
    if (!matchCondition(docVal, cond)) {
      return false;
    }
  }

  return true;
}

// Persist storage to JSON file
export function persistLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(storage, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist local DB to file:', err.message);
  }
}

// Load storage from JSON file
export function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      storage.users = data.users || [];
      storage.equipments = data.equipments || [];
      storage.bookings = data.bookings || [];
      storage.reviews = data.reviews || [];
      console.log(
        `📦 Loaded persistent data from ${DB_FILE} (${storage.users.length} users, ${storage.equipments.length} machines, ${storage.bookings.length} bookings, ${storage.reviews.length} reviews)`
      );
      return true;
    }
  } catch (err) {
    console.warn('Could not read existing local DB file, starting fresh:', err.message);
  }
  return false;
}

// Initialize Local DB
export async function initLocalDb() {
  if (isInitialized) return;
  loadLocalDb();
  isInitialized = true;
}

export function isLocalDbActive() {
  return isInitialized;
}

// Helper to wrap raw plain object into Document instance with Mongoose methods
function wrapDocument(collectionName, rawDoc) {
  if (!rawDoc) return null;
  const doc = { ...rawDoc };

  // Attach methods
  doc.toString = function () {
    return this._id;
  };

  doc.isModified = function () {
    return true;
  };

  doc.toObject = function () {
    return { ...this };
  };

  doc.toJSON = function () {
    const copy = { ...this };
    delete copy.save;
    delete copy.matchPassword;
    delete copy.isModified;
    delete copy.toObject;
    delete copy.toJSON;
    return copy;
  };

  // User password comparison
  if (collectionName === 'users') {
    doc.matchPassword = async function (enteredPassword) {
      if (!this.password) return false;
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  // Save method
  doc.save = async function () {
    this.updatedAt = new Date().toISOString();

    // If user password changed to plain text, hash it
    if (collectionName === 'users' && this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const items = storage[collectionName];
    const idx = items.findIndex((i) => i._id === this._id);
    const plainToSave = { ...this };
    delete plainToSave.save;
    delete plainToSave.matchPassword;
    delete plainToSave.isModified;
    delete plainToSave.toObject;
    delete plainToSave.toJSON;

    if (idx !== -1) {
      items[idx] = plainToSave;
    } else {
      items.push(plainToSave);
    }
    persistLocalDb();
    return this;
  };

  return doc;
}

// Query builder providing chainable .sort(), .skip(), .limit(), .populate(), .select()
class QueryBuilder {
  constructor(collectionName, query = {}, isSingle = false) {
    this.collectionName = collectionName;
    this.query = query;
    this.isSingle = isSingle;
    this.sortSpec = null;
    this.skipCount = 0;
    this.limitCount = null;
    this.populateList = [];
    this.selectSpec = null;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  skip(count) {
    this.skipCount = Number(count) || 0;
    return this;
  }

  limit(count) {
    this.limitCount = Number(count);
    return this;
  }

  populate(pathOrObj, selectFields) {
    if (typeof pathOrObj === 'string') {
      this.populateList.push({ path: pathOrObj, select: selectFields });
    } else if (pathOrObj && typeof pathOrObj === 'object') {
      this.populateList.push(pathOrObj);
    }
    return this;
  }

  select(spec) {
    this.selectSpec = spec;
    return this;
  }

  async exec() {
    let list = storage[this.collectionName] || [];

    // Filter
    list = list.filter((doc) => matchDocument(doc, this.query));

    // Sort
    if (this.sortSpec && typeof this.sortSpec === 'object') {
      const keys = Object.keys(this.sortSpec);
      list.sort((a, b) => {
        for (const k of keys) {
          const dir = this.sortSpec[k] === -1 || this.sortSpec[k] === 'desc' ? -1 : 1;
          const valA = getNestedValue(a, k);
          const valB = getNestedValue(b, k);
          if (valA === valB) continue;
          if (valA == null) return 1 * dir;
          if (valB == null) return -1 * dir;
          if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB) * dir;
          }
          return (valA > valB ? 1 : -1) * dir;
        }
        return 0;
      });
    }

    // Skip
    if (this.skipCount > 0) {
      list = list.slice(this.skipCount);
    }

    // Limit
    if (this.limitCount != null && this.limitCount >= 0) {
      list = list.slice(0, this.limitCount);
    }

    // Wrap in doc instances
    let results = list.map((item) => wrapDocument(this.collectionName, item));

    // Populate references
    for (const pop of this.populateList) {
      const popPath = pop.path;
      const selectStr = pop.select;
      const allowedFields = selectStr ? selectStr.split(' ').filter(Boolean) : null;

      for (const doc of results) {
        const refId = doc[popPath];
        if (!refId) continue;

        let targetCollection = '';
        if (popPath === 'equipment') targetCollection = 'equipments';
        else if (popPath === 'owner' || popPath === 'user') targetCollection = 'users';

        if (targetCollection) {
          const targetItem = storage[targetCollection].find(
            (t) => String(t._id) === String(refId._id || refId)
          );
          if (targetItem) {
            let populatedVal = { ...targetItem };
            if (targetCollection === 'users' && !this.selectSpec?.includes('+password')) {
              delete populatedVal.password;
            }
            if (allowedFields && allowedFields.length > 0) {
              const filtered = { _id: populatedVal._id };
              for (const f of allowedFields) {
                if (f.startsWith('-')) continue;
                if (populatedVal[f] !== undefined) filtered[f] = populatedVal[f];
              }
              populatedVal = filtered;
            }
            doc[popPath] = populatedVal;
          }
        }
      }
    }

    // Handle select (like '-password' or '+password')
    if (this.selectSpec) {
      const spec = this.selectSpec;
      if (spec.includes('-password')) {
        results.forEach((d) => delete d.password);
      }
    } else {
      // By default, never leak user password unless explicitly requested with +password
      if (this.collectionName === 'users') {
        results.forEach((d) => delete d.password);
      }
    }

    if (this.isSingle) {
      return results.length > 0 ? results[0] : null;
    }
    return results;
  }

  // Make query object thenable so `await Model.find(...)` directly resolves
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

// Model abstraction representing a MongoDB collection
export class LocalModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async create(data) {
    if (Array.isArray(data)) {
      const createdList = [];
      for (const item of data) {
        createdList.push(await this.create(item));
      }
      return createdList;
    }

    const doc = {
      _id: data._id || generateObjectId(),
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If user password, hash it
    if (this.collectionName === 'users' && doc.password) {
      if (!doc.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        doc.password = await bcrypt.hash(doc.password, salt);
      }
    }

    storage[this.collectionName].push(doc);
    persistLocalDb();

    return wrapDocument(this.collectionName, doc);
  }

  async insertMany(array) {
    const created = [];
    for (const item of array) {
      created.push(await this.create(item));
    }
    return created;
  }

  find(query = {}) {
    return new QueryBuilder(this.collectionName, query, false);
  }

  findOne(query = {}) {
    return new QueryBuilder(this.collectionName, query, true);
  }

  findById(id) {
    return new QueryBuilder(this.collectionName, { _id: String(id) }, true);
  }

  findByIdAndUpdate(id, update, options = { new: true }) {
    const list = storage[this.collectionName];
    const idx = list.findIndex((i) => String(i._id) === String(id));
    if (idx !== -1) {
      const current = { ...list[idx] };
      const updateFields = update.$set ? { ...update.$set } : { ...update };
      delete updateFields.$set;

      // Apply updates
      for (const k of Object.keys(updateFields)) {
        if (k.includes('.')) {
          const parts = k.split('.');
          if (parts.length === 2) {
            current[parts[0]] = current[parts[0]] || {};
            current[parts[0]][parts[1]] = updateFields[k];
          }
        } else {
          current[k] = updateFields[k];
        }
      }

      current.updatedAt = new Date().toISOString();
      list[idx] = current;
      persistLocalDb();
    }

    // Return QueryBuilder synchronously so .populate() and .select() can be chained
    return new QueryBuilder(this.collectionName, { _id: String(id) }, true);
  }

  findByIdAndDelete(id) {
    const list = storage[this.collectionName];
    const idx = list.findIndex((i) => String(i._id) === String(id));
    let removed = null;
    if (idx !== -1) {
      removed = list.splice(idx, 1)[0];
      persistLocalDb();
    }
    const collectionName = this.collectionName;
    return {
      select() {
        return this;
      },
      populate() {
        return this;
      },
      then(resolve, reject) {
        return Promise.resolve(wrapDocument(collectionName, removed)).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(wrapDocument(collectionName, removed)).catch(reject);
      },
    };
  }

  async deleteMany(query = {}) {
    const list = storage[this.collectionName];
    const beforeCount = list.length;
    storage[this.collectionName] = list.filter((doc) => !matchDocument(doc, query));
    const deletedCount = beforeCount - storage[this.collectionName].length;
    persistLocalDb();
    return { deletedCount };
  }

  async countDocuments(query = {}) {
    const list = storage[this.collectionName] || [];
    return list.filter((doc) => matchDocument(doc, query)).length;
  }

  async distinct(field) {
    const list = storage[this.collectionName] || [];
    const values = new Set();
    list.forEach((item) => {
      const val = getNestedValue(item, field);
      if (val !== undefined) values.add(val);
    });
    return Array.from(values);
  }

  async aggregate(pipeline = []) {
    let list = [...(storage[this.collectionName] || [])];
    for (const stage of pipeline) {
      if (stage.$group) {
        const groupKey = stage.$group._id;
        const fieldName = typeof groupKey === 'string' && groupKey.startsWith('$') ? groupKey.slice(1) : groupKey;
        const counts = {};
        for (const item of list) {
          const val = getNestedValue(item, fieldName) || 'Unknown';
          counts[val] = (counts[val] || 0) + 1;
        }
        return Object.entries(counts).map(([k, count]) => ({ _id: k, count }));
      }
    }
    return list;
  }
}

// Singletons for each collection
export const localUsers = new LocalModel('users');
export const localEquipments = new LocalModel('equipments');
export const localBookings = new LocalModel('bookings');
export const localReviews = new LocalModel('reviews');
