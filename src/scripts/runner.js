/* eslint-disable no-console */
import { spawn } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import path, { sep, dirname } from 'path';
import { fileURLToPath } from 'url';

import inquirer from 'inquirer';

import { SECRET_PHRASE } from '../_inputs/settings/global.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export const OUTPUTS_JSON_FOLDER = path.resolve(_dirname, '../_outputs/json');

export const SAVED_MODULES_FOLDER = `${OUTPUTS_JSON_FOLDER}${sep}saved-modules`;

const scripts = {
  main: 'main',
};
const aliases = {
  runMain: '1. Основной скрипт',
  exit: '0. Выйти',
};

const commandAliases = {
  [aliases.runMain]: scripts.main,
  [aliases.exit]: 'exit',
};

const getStartMainCommand = async (projectName) => {
  const runMainCommand = `npm run ${projectName}:main`;
  const restartLastMainCommand = `npm run ${projectName}:restart-last`;

  switch (projectName) {
    case scripts.main:
      break;

    default:
      break;
  }

  const notFinishedRoutes = [];

  const savedFiles = readdirSync(SAVED_MODULES_FOLDER);

  for (const fileName of savedFiles) {
    if (!fileName.includes(projectName)) {
      continue;
    }

    const fileString = readFileSync(`${SAVED_MODULES_FOLDER}${sep}${fileName}`, 'utf-8');
    const data = JSON.parse(fileString);

    if (data?.route) {
      const notFinished =
        !data.isFinished &&
        data.modulesData &&
        ('wallet' in data.modulesData
          ? !!data.modulesData.filter(({ modules }) => modules.some(({ count }) => count > 0)).length
          : !!data.modulesData.filter(({ count }) => count > 0));

      if (notFinished) {
        notFinishedRoutes.push(data.route);
      }
    }
  }

  let command;
  let routeName;

  if (notFinishedRoutes.length) {
    const startLastScriptMessage = 'Да (восстановить выполнение)';

    const choicesQuestion = [
      {
        type: 'list',
        name: 'runMainOrRestartQuestions',
        message: 'У Вас есть незаконченные скрипты, продолжить их?',
        choices: [startLastScriptMessage, 'Нет (выполнить новый скрипт, но база текущего роута будет очищена)'],
      },
    ];

    const { runMainOrRestartQuestions } = await inquirer.prompt(choicesQuestion);
    const isStartLastScript = runMainOrRestartQuestions === startLastScriptMessage;

    if (isStartLastScript) {
      const choicesQuestion = [
        {
          type: 'list',
          name: 'routeToRestart',
          message: 'Выберите роут для восстановления',
          choices: notFinishedRoutes,
        },
      ];

      const { routeToRestart } = await inquirer.prompt(choicesQuestion);

      routeName = routeToRestart;
      command = restartLastMainCommand;
    } else {
      command = runMainCommand;
    }
  } else {
    command = runMainCommand;
  }

  const secret = await getSecretPhrase();
  return {
    command,
    secret,
    routeName,
  };
};

const getSecretPhrase = async () => {
  const input = {
    type: 'input',
    name: 'secret',
    message: 'Введите секретную фразу для кодирования приватных ключей:',
    validate: (input) => {
      if (input.trim() === '') {
        return 'Secret cannot be empty';
      }
      return true;
    },
  };

  if (SECRET_PHRASE) {
    return SECRET_PHRASE;
  }

  const { secret } = await inquirer.prompt(input);

  return secret;
};

(async () => {
  const aliasChoices = Object.keys(commandAliases);

  const questions = [
    {
      type: 'list',
      name: 'alias',
      message: 'Выберите скрипт для выполнения:',
      choices: aliasChoices,
    },
  ];

  const { alias } = await inquirer.prompt(questions);
  const selectedAlias = alias;
  let selectedCommand = commandAliases[selectedAlias];
  let args = [];

  switch (selectedAlias) {
    case aliases.runMain: {
      const { command, secret, routeName } = await getStartMainCommand(scripts.main);
      selectedCommand = command;
      args = [secret, routeName || '_'];
      break;
    }

    default:
      break;
  }

  const commandProcess = spawn(selectedCommand, args, {
    shell: true,
  });

  // Отображаем вывод команды
  commandProcess.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  let errorCalled = false;
  // Отображаем ошибки (если есть)
  commandProcess.stderr.on('data', (data) => {
    if (!errorCalled) {
      let errMessage = data.toString();

      if (errMessage.includes('triggerUncaughtException')) {
        errMessage =
          'Произошла неизвестная ошибка: пожалуйста, вызовите "npm run build", что-бы увидеть ошибку или сравните global.js с global.example.js';
      } else {
        errMessage = errMessage
          .split('\n')
          .filter((string) => !!string)
          .at(-1);
      }

      process.stderr.write(
        `\x1b[31m${errMessage}\x1b[0m
`
      );
      errorCalled = true;
    }
  });

  // Завершаем выполнение команды и выводим код завершения
  commandProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Скрипт успешно выполнен: ${selectedCommand}`);
    } else {
      console.error(`Ошибка выполнения скрипта: ${selectedCommand}`);
    }
  });
})();
