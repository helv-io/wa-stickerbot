import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { clientConfig } from '../config'

let db: Database<sqlite3.Database, sqlite3.Statement>
;(async () => {
  // open the database
  db = await open({
    filename: `${clientConfig.sessionId || 'default'}.sqlite`,
    driver: sqlite3.Database
  })
  db.run('CREATE TABLE IF NOT EXISTS Usage (type TEXT, count NUM)')
})()

export const getCount = async (type: string) => {
  return (
    (await db.get('SELECT count FROM Usage WHERE type = ?', type))?.count || 0
  )
}

export const addCount = async (type: string) => {
  const row = await db.get('SELECT * FROM Usage WHERE type = ?', type)
  if (row) {
    db.run('UPDATE Usage SET count = count + 1 WHERE type = ?', type)
  } else {
    db.run('INSERT INTO Usage VALUES (?, 1)', type)
  }
}
