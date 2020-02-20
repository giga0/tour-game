# tour-game

### Project setup (i.e. How to install this game)
Clone repository:
```
git clone git@github.com:giga0/tour-game.git
```

Then run in your command prompt:
```
cd tour-game
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Technologies and API used
- Webpack
- Vue
- Indexed Database API

### Game Info & Rules
Player has a board of 10*10 boxes. When a player clicks on an empty box in the board, a level is generated and boxes that the player can click on are shown. The number of boxes the player can click is defined by the current level. To complete a level, the player must click on all generated fields in a specific order. The player cannot click random fields, they can only click fields that pass a specific rule set by the game. Each new level will have one more box than the previous level. To complete the whole game, the player must finish all 99 levels.

Whenever the player completes a level they gain a life.
Whenever the player fails to complete a level, they lose a number of lives equal to the number of unclicked boxes in that level.
The player can then choose from which level he will start a new game as long as he has completed that level.
When he reaches zero lives, he starts from level 1 again.
