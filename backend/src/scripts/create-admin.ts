// Admin User Creation Script
// Dieses Script wird mit tsx ausgeführt, nicht kompiliert

import Database from 'better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

const dbPath = path.join(__dirname, '../../data/erp.db');
const db = new Database(dbPath);

const email = 'admin@eliteerp.de';
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

db.prepare(`
  INSERT OR REPLACE INTO users (email, password, first_name, last_name, role)
  VALUES (?, ?, ?, ?, ?)
`).run(email, hash, 'Admin', 'User', 'admin');

console.log('✅ Admin user created!');
console.log('Email:', email);
console.log('Password:', password);

db.close();

