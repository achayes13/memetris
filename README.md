# memetris

Multiplayer tetris where everybody gets one button. Best played with 7 friends in the same room.

![screenshot](https://github.com/paulvirag/memetris/blob/master/public/images/screenshot.png?raw=true)

## How to Play

- Open the spectate page (https://memetris.herokuapp.com/spectate) on a shared screen, like a TV
- Have each person open the game (https://memetris.herokuapp.com) on their phone
- Each player has a single button, and you're all playing the same Tetris instance
- You'll need at least 8 players to actually play (up, down, left, and A for each team)
- If more than 8 players load the game, the extra players will be queued up until someone quits

## Features

- Scoring and game speed are roughly based on the original Tetris
- Music is the "Tetris A" theme from the original game
- Clearing more than 1 line at a time sends garbage lines to the opposing team

## Local Development
### Initial Setup
- `heroku login` to authenticate Heroku CLI
- `heroku git:remote -a memetris` to connect to the Heroku repo
- `npm i` to install NPM packages

### Developing
- Run `npm run monitor` in a separate terminal tab to enable JS autoformatting
- `npm run build` to generate necessary files
- VS Code "F5" to run the app, or `npm run start` from the command line
- Running locally - `localhost:5001/spectate` to see the full view and `localhost:5001/play` for individual controllers

## Deploying
- `git push heroku master` to push, CI/CD and deploy
