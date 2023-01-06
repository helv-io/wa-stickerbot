import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

let db: Database<sqlite3.Database, sqlite3.Statement>
  ; (async () => {
    // open the database
    db = await open({
      filename: `/data/${process.env.WA_SESSION_ID || 'default'}.sqlite`,
      driver: sqlite3.Database
    })
    await db.run('CREATE TABLE IF NOT EXISTS Usage (type TEXT, count NUM)')
    await db.run(
      'CREATE TABLE IF NOT EXISTS Donors (name TEXT, number TEXT, amount NUM)'
    )
    await db.run('CREATE TABLE IF NOT EXISTS Banned (user TEXT)')
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

export const getDonors = async () => {
  let donors = ''
  await db.each('SELECT * FROM Donors ORDER BY amount DESC', (err, row) => {
    donors += `${row.name}\n`
  })
  if (donors) donors = `🙌🙌🙌\n${donors}`
  return donors
}

export const addDonor = (name: string) => {
  db.run('INSERT INTO Donors VALUES (?, ?, ?)', name, null, null)
}

export const ban = (user: string) => {
  db.run('INSERT INTO Banned VALUES (?)', user)
}

export const unban = (user: string) => {
  db.run('DELETE FROM Banned WHERE user = ?', user)
}

export const isUserBanned = async (user: string) => {
  return (
    (await db.get('SELECT COUNT(0) ct FROM Banned WHERE user = ?', user)).ct > 0
  )
}
