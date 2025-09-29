
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
