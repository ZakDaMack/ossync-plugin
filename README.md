# OSSync

This is a plugin for OSSync.

Requires a OSSync server to connect to which can be set up via docker.

## Getting started

- Test

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Local development

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Deploying

- Update `package.json` version
- Run `npm run version` to update all other version files
- Create new GitHub release using your new version number as the "Tag version" `git tag {version}`
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments
- Publish the release

## To do

- Compress folder data
- Improve sync content

## API Documentation

See https://github.com/obsidianmd/obsidian-api
