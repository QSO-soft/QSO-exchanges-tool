## Common Naming Rules

- Constants (global reusable) `SNAKE_UPPER_CASE`
- Variables, methods, functions `camelCase`
- Classes, types, interfaces `PascalCase`
- Files, folders `kebab-case`

## Pull Requests (PRs)

### PR Naming

* PR name should be descriptive and match the associated task.
* Example: "Feature XYZ Implementation."

### PR Description

* PR descriptions should be a list of completed tasks.
* Example:
  * Implemented feature XYZ.
  * Fixed bug ABC.
  * Added unit tests for component DEF.

### TODO Block

* If there are remaining tasks in the PR, list them in a TODO block at the end of the description.

## Branches

### Branch Naming

* Use the following prefixes for branch names:
  * `feat/feature-name` for feature branches.
  * `fix/feature-name` for bug fix branches.
  * `update/feature-name` for update or enhancement branches.

## Commits

### Commit Messages

* Commit messages should have a feature-specific prefix in CAPS in brackets, followed by a concise description.
  example `[README] Add more rules to style guide`
* Use `git commit --amend` to add additional information to a commit (e.g., fix comments).
* Prefer `rebase from the `main  branch to avoid unnecessary merge commits.
  `git fetch origin main`
  `git rebase origin/main `
  in case of merge conflicts
  resolve conflicts
  `git add file.name`
  `git rebase --continue`
* Commits should provide implementation details. There amount depends on feature volume. Prefered to keep them as little as possible. in Case of redundant commit use `squash`

## Variables

### Functions

* Function names should answer the question "What does it do?"
* Clearly describe the main action.
* A function should generally perform a single action.
* If a function is utility (combines several func inside of it), use name, which will describe MAIN AIM.
* `guards` - functions, which can be implemented for preventing fewer steps under some condition

### Booleans

* Boolean variable names should answer questions like "Is it?" or "Has it? or "Should it?"
* Names should start with `has`, `is`, or `should`.
* If using multiple values in an `if` statement, store them in a variable that reflects what you're checking.
* use `check` prefix for func, which returns boolean by condition
* use `assert` prefix for func, which check types

### Variables

* Use nouns for variable names.
* Variables should answer the question "What is it?"
* Reflect the essence of the data they hold.
