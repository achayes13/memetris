# memetris

Multiplayer tetris where everybody gets one button. Best played with 3 friends in the same room.

## How to Play

- Open the spectate page (https://memetris.herokuapp.com/spectate) on a shared screen, like a TV
- Have each person open the game (https://memetris.herokuapp.com) on their phone
- Each player has a single button, and you're all playing the same Tetris instance
- You'll need at least 4 players to actually play (up, down, left, and A)
- If more than 4 players load the game, the extra players will be queued up until someone quits

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
