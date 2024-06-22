## About links in root [README](../README.md)
- Add links to `README.md` in `Managers` section for new managers
- Add links to `README.md` in `Scripts` section for new scripts
- Add links to `config.ts` and/or `settings.ts` in `Configs/settings` section for new managers/scripts

---

## How to use `logger`

- `logger.info('some message')` to log some info
- `logger.warning('some message')` to log some warnings
- `logger.error('some message')` to log some errors
- `logger.error('some message')` to log some success results
- second parameter in call above can be used to inform what folder name in logs should be for current log, `unset` by default
- to find logs, open `logs` folder in the root directory of the app
- open `combined.log` file to see all logs
- open `errors.log` file to see error logs only

---

## How to disable `TypeScript` and `eslint` rules

- `// @ts-ignore: Some comment` to disable `TypeScript` rule for the next line with some comment
- `/* eslint-disable-line no-debugger, no-console */` disable specific `eslint` rules for the next line

---
