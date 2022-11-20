import themes from './themes';
import GameState from './GameState';
import Team from './Team';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import cursors from './cursors';

import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import Magician from './Characters/Magician';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();

    this.userTeam = new Team();
    this.aiTeam = new Team();
    this.userHeroes = [Bowman, Swordsman, Magician];
    this.aiHeroes = [Daemon, Undead, Vampire];
  }

  init() {
    this.gamePlay.drawUi(themes[this.gameState.level]);//отрисовка поля
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.userTeam.addHeroes(generateTeam(this.userHeroes, 1, 2));
    this.aiTeam.addHeroes(generateTeam(this.aiHeroes, 1, 2));

    this.positionTeam(this.userTeam, this.positionUser());
    this.positionTeam(this.aiTeam, this.positionAi());

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    this.gamePlay.redrawPositions(this.gameState.allCell);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
