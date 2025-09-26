
// "use strict";

// /**
//  * Migration Helpers
//  * Safe wrappers around Sequelize migration methods
//  * Prevents crashes on Render/Neon when schema changes already exist
//  */

// module.exports = {
//   /**
//    * Add column only if it does not exist
//    */
//   async addColumnIfNotExists(
//     queryInterface,
//     tableName,
//     columnName,
//     attributes
//   ) {
//     const table = await queryInterface.describeTable(tableName);
//     if (!table[columnName]) {
//       await queryInterface.addColumn(tableName, columnName, attributes);
//       console.log(`✅ Added column ${columnName} to ${tableName}`);
//     } else {
//       console.log(
//         `⚠️ Column ${columnName} already exists in ${tableName}, skipping`
//       );
//     }
//   },

//   /**
//    * Remove column only if it exists
//    */
//   async removeColumnIfExists(queryInterface, tableName, columnName) {
//     const table = await queryInterface.describeTable(tableName);
//     if (table[columnName]) {
//       await queryInterface.removeColumn(tableName, columnName);
//       console.log(`🗑️ Removed column ${columnName} from ${tableName}`);
//     } else {
//       console.log(
//         `⚠️ Column ${columnName} does not exist in ${tableName}, skipping`
//       );
//     }
//   },

//   /**
//    * Create table only if it does not exist
//    */
//   async createTableIfNotExists(
//     queryInterface,
//     tableName,
//     attributes,
//     options = {}
//   ) {
//     const [results] = await queryInterface.sequelize.query(
//       `SELECT to_regclass('public.${tableName}') as table`
//     );
//     if (!results[0].table) {
//       await queryInterface.createTable(tableName, attributes, options);
//       console.log(`✅ Created table ${tableName}`);
//     } else {
//       console.log(`⚠️ Table ${tableName} already exists, skipping`);
//     }
//   },

//   /**
//    * Drop table only if it exists
//    */
//   async dropTableIfExists(queryInterface, tableName) {
//     const [results] = await queryInterface.sequelize.query(
//       `SELECT to_regclass('public.${tableName}') as table`
//     );
//     if (results[0].table) {
//       await queryInterface.dropTable(tableName);
//       console.log(`🗑️ Dropped table ${tableName}`);
//     } else {
//       console.log(`⚠️ Table ${tableName} does not exist, skipping`);
//     }
//   },

//   /**
//    * Add index only if it does not exist
//    */
//   async addIndexIfNotExists(queryInterface, tableName, fields, options = {}) {
//     const indexName = options.name || `${tableName}_${fields.join("_")}_idx`;

//     const [results] = await queryInterface.sequelize.query(`
//       SELECT indexname 
//       FROM pg_indexes 
//       WHERE tablename = '${tableName}' AND indexname = '${indexName}'
//     `);

//     if (!results.length) {
//       await queryInterface.addIndex(tableName, fields, {
//         ...options,
//         name: indexName,
//       });
//       console.log(`✅ Added index ${indexName} on ${tableName}`);
//     } else {
//       console.log(
//         `⚠️ Index ${indexName} already exists on ${tableName}, skipping`
//       );
//     }
//   },
// };




// utils/migrationHelpers.cjs
"use strict";

async function addColumnIfNotExists(queryInterface, table, column, options) {
  const tableDesc = await queryInterface.describeTable(table);
  if (!tableDesc[column]) {
    await queryInterface.addColumn(table, column, options);
  }
}

async function removeColumnIfExists(queryInterface, table, column) {
  const tableDesc = await queryInterface.describeTable(table);
  if (tableDesc[column]) {
    await queryInterface.removeColumn(table, column);
  }
}

async function createTableIfNotExists(queryInterface, tableName, attributes, options = {}) {
  const tables = await queryInterface.showAllTables();
  const tableExists = tables.includes(tableName) || tables.includes(tableName.toLowerCase());
  if (!tableExists) {
    await queryInterface.createTable(tableName, attributes, options);
  }
}

async function dropTableIfExists(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  const tableExists = tables.includes(tableName) || tables.includes(tableName.toLowerCase());
  if (tableExists) {
    await queryInterface.dropTable(tableName);
  }
}

async function addIndexIfNotExists(queryInterface, table, fields, options) {
  const [indexes] = await queryInterface.sequelize.query(`SELECT indexname FROM pg_indexes WHERE tablename = '${table}'`);
  const indexName = options?.name;
  const indexExists = indexes.some((idx) => idx.indexname === indexName);
  if (!indexExists) {
    await queryInterface.addIndex(table, fields, options);
  }
}

module.exports = {
  addColumnIfNotExists,
  removeColumnIfExists,
  createTableIfNotExists,
  dropTableIfExists,
  addIndexIfNotExists,
};
