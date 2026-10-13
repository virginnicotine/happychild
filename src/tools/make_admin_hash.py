#!/usr/bin/env python3
"""Печатает хеш пароля администратора для auth.js.
Запуск:  python tools/make_admin_hash.py
Скопируй три значения (salt, rounds, passwordHash) в объект ADMIN в файле auth.js.
Алгоритм совпадает с функцией hashPassword в auth.js."""
import getpass, hashlib, secrets

ROUNDS = 20000
password = getpass.getpass('Новый пароль администратора: ')
salt = secrets.token_hex(12)
h = hashlib.sha256(f'{salt}:{password}'.encode()).hexdigest()
for _ in range(ROUNDS - 1):
    h = hashlib.sha256(f'{h}:{salt}:{password}'.encode()).hexdigest()
print(f"\nsalt: '{salt}', rounds: {ROUNDS},\npasswordHash: '{h}'")
