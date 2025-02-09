import PouchDB from "pouchdb-core";
import HttpPouch from "pouchdb-adapter-http";
import replication from "pouchdb-replication";
import mapreduce from "pouchdb-mapreduce";
// @ts-ignore
import SQLiteAdapterFactory from "pouchdb-adapter-react-native-sqlite";
import SQLite from "react-native-sqlite-2";

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

export default PouchDB.plugin(HttpPouch)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(SQLiteAdapter);
