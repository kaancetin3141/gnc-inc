#!/usr/bin/env node
// GNC PostgreSQL — 5 veritabanı + rol kurulumu
// Kullanım: bun /home/z/pg/setup-db.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync, chmodSync } from 'node:fs';

const PSQL = '/home/z/pgdeb/root/usr/lib/postgresql/17/bin/psql';
const env = { ...process.env, LD_LIBRARY_PATH: '/home/z/pgdeb/root/usr/lib/x86_64-linux-gnu' };

const pass = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 20; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s + '!1';
};

// gnc_inc şifresi: git geçmişindeki .env ile tutarlı kalır
const DBS = [
  { db: 'gnc_inc',    user: 'gnc_inc_user',    pass: 'tvDeCsv34LR3XtQLpm2i' },
  { db: 'gnc_erp',    user: 'gnc_erp_user',    pass: pass() },
  { db: 'kaloriai',   user: 'kaloriai_user',    pass: pass() },
  { db: 'fruitstorm', user: 'fruitstorm_user',  pass: pass() },
  { db: 'cubiq',      user: 'cubiq_user',       pass: pass() },
];

const psql = (input, db = 'postgres') =>
  execFileSync(PSQL, ['-h', '/tmp', '-U', 'postgres', '-d', db, '-v', 'ON_ERROR_STOP=0', '-c', input], { env, encoding: 'utf8' });

const query = (input, db = 'postgres') =>
  execFileSync(PSQL, ['-h', '/tmp', '-U', 'postgres', '-d', db, '-t', '-A', '-c', input], { env, encoding: 'utf8' }).trim();

for (const { db, user, pass: p } of DBS) {
  // Rol: yoksa oluştur, varsa şifresini güncelle
  psql(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${user}') THEN
      CREATE ROLE ${user} LOGIN CREATEROLE PASSWORD '${p}';
    ELSE
      ALTER ROLE ${user} WITH PASSWORD '${p}';
    END IF;
  END $$;`);
  // DB: yoksa oluştur (CREATE DATABASE transaction içinde çalışamaz → koşullu)
  const exists = query(`SELECT 1 FROM pg_database WHERE datname = '${db}'`);
  if (exists !== '1') {
    psql(`CREATE DATABASE ${db} OWNER ${user} TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C';`);
    console.log(`  + ${db} veritabanı oluşturuldu`);
  }
  console.log(`✓ ${db} / ${user}`);
}

let md = `# GNC PostgreSQL 17 — Kimlik Bilgileri (GİZLİ)\n\n> Sadece sunucu yönetimi içindir. Repo'ya ASLA commit edilmez.\n\n| Servis | DB | Kullanıcı | Şifre |\n|---|---|---|---|\n`;
let urls = `\n## DATABASE_URL'ler\n\n`;
for (const { db, user, pass: p } of DBS) {
  md += `| ${db} | ${db} | ${user} | \`${p}\` |\n`;
  urls += `\`${db}\`: \`postgresql://${user}:${p}@127.0.0.1:5432/${db}\`\n\n`;
}
md += urls;
writeFileSync('/home/z/pg/credentials.md', md);
chmodSync('/home/z/pg/credentials.md', 0o600);
console.log('\n✓ /home/z/pg/credentials.md yazıldı (0600)');
