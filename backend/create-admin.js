const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'erp.db');
const db = new sqlite3.Database(dbPath);

const email = 'admin@eliteerp.de';
const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }

  db.run(`
    INSERT OR REPLACE INTO users (email, password, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?)
  `, [email, hash, 'Admin', 'User', 'admin'], (err) => {
    if (err) {
      console.error('Error creating user:', err);
    } else {
      console.log('Admin user created successfully!');
      console.log('Email:', email);
      console.log('Password:', password);
    }
    db.close();
  });
});
