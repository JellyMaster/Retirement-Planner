# Polaris v1.2.0 Release Checklist

This checklist is the final gate for merging `feature/drawdown-simple-rework` into `master` and tagging Version 1.2.0.

## 1. Synchronise npm version metadata

`package.json` is already set to `1.2.0`. Before the merge, synchronise the root version recorded in `package-lock.json` without creating a Git tag:

```bash
npm version 1.2.0 --no-git-tag-version --allow-same-version
```

Review the resulting diff. It should only synchronise version metadata unless npm reports another legitimate lockfile change.

Commit the lockfile update, for example:

```bash
git add -- package-lock.json
git commit -m "chore: sync v1.2 package lock metadata"
```

## 2. Run the complete release gate

```bash
npm run verify
```

This must pass:

- ESLint
- TypeScript checking
- Vitest test suite
- production build

Do not tag the release if any part fails.

## 3. Review the release branch

Expected branch:

```text
feature/drawdown-simple-rework
```

At release preparation time the branch was ahead of `master` with no commits behind it.

Confirm before merge:

```bash
git status
git fetch origin
git rev-list --left-right --count origin/master...HEAD
```

The working tree should be clean and the branch should not be unexpectedly behind `master`.

## 4. Smoke test the application

At minimum check:

- Overview loads the active plan
- My Plan can edit and save the active plan
- Compare opens selected scenarios
- Drawdown Simple loads correctly
- Detailed Income loads and its reference table opens
- Detailed Balance loads and its reference table opens
- Retirement Journey loads and its reference table opens
- How it works loads and Calculation reference opens
- Today's Money / Future Money switch works
- Light and Dark modes remain usable
- navigation and deep links work
- persistent educational disclaimer is visible as intended

## 5. Merge into master

Once verification is green, merge `feature/drawdown-simple-rework` into `master` using the repository's normal merge process.

Because this branch contains the complete v1.2 development history, choose the merge strategy intentionally. If preserving the individual development commits is useful, use a normal merge. If the project prefers release-level history, use the repository's established squash/rebase policy.

## 6. Verify GitHub Pages

After the merge:

- confirm the deployment workflow starts
- confirm the workflow succeeds
- open the deployed application
- smoke test the Drawdown workspace on the deployed build

## 7. Tag the release

After the deployment is confirmed:

```bash
git checkout master
git pull
git tag -a v1.2.0 -m "Polaris Retirement Planner v1.2.0"
git push origin v1.2.0
```

## 8. Create the GitHub Release

Use `docs/RELEASE_NOTES_1.2.md` as the basis for the GitHub Release notes.

Release title:

```text
Polaris Retirement Planner v1.2.0
```

## Release decision

Version 1.2.0 is ready to release when:

- package and lockfile version metadata agree
- `npm run verify` passes
- the branch is clean and up to date with `master`
- GitHub Pages deploys successfully after merge
- the deployed application passes the smoke test
