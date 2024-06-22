<img src='qso-soft.png'/>

# Usage overview | QSO-soft

## Steps to set up script:

1. Установить [VisualStudio Code](https://code.visualstudio.com/) или Sublime Text или любую другую IDE

2. Установка node, npm, git
   : 2.1. Устанавливаем Node +, если версия ниже 20й - https://nodejs.org/en/download, либо - https://github.com/coreybutler/nvm-windows
   : 2.2. Устанавливаем Git, если еще не установлен - https://gitforwindows.org/ (всё по умолчанию выбирайте)
   : 2.3. Устанавливаем его глобально

```bash
npm install npm -g
npm install typescript -g
```

3. После установки Git у вас должен появиться bash в выборе терминалов в VS Code (на стрелочку нажмите снизу в терминале и там будет Git Bash). Используем обязательно его или zsh! Главное, не powershell!

4. Проверяем версию Node, NPM и NVM.

```bash
node -v && git -v && npm -v
# v20.8.0 (не обязательно прям цифра в цифру, главное чтобы была версия выше v20)
# git version 2.42.0 (все равно на версию)
# 9.8.1 (все равно на версию)
```

5. Переходим на рабочий стол

```bash
cd ./<путь на рабочий стол>
```

6. Клонируем репозиторий и выполняем логин в GitHub, так как это приватный репозиторий

```bash
git clone https://github.com/QSO-soft/QSO-exchanges.git
```

7. Переходим в папку с проектом

```bash
cd QSO-exchanges
```

8. Устанавливаем нужные зависимости

```bash
npm i
```

9.  Подготавливаем файлы к работе

```bash
npm run prepare-files
```

10. Заполняем файлы
    : 10.1. `src/_inputs/settings/global.js`
    : 10.2. `src/_inputs/settings/settings.ts`
    : 10.3. `src/_inputs/settings/routes/base.ts`
    : 10.4. `src/_inputs/csv/wallets.csv` (НЕ УДАЛЯЙТЕ HEADER CSV ФАЙЛА! Это не .txt!)
    : 10.5. `src/_inputs/csv/proxies.csv` (OPTIONAL)

11. npm start

---

## Scripts

- [Exchanges](src/scripts/main/README.md)
