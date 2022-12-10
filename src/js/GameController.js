// import themes from './themes';//темы игрового поля
// import GameState from './GameState';//текущее состояние игры
// import Team from './Team';//состава команды
// import { generateTeam } from './generators';//генератор игроков
// import PositionedCharacter from './PositionedCharacter';
// import cursors from './cursors';

// import Bowman from './Characters/Bowman';
// import Swordsman from './Characters/Swordsman';
// import Daemon from './Characters/Daemon';
// import Undead from './Characters/Undead';
// import Vampire from './Characters/Vampire';
// import Magician from './Characters/Magician';

// export default class GameController {
//   constructor(gamePlay, stateService) {
//     this.gamePlay = gamePlay;
//     this.stateService = stateService;
//     this.gameState = new GameState();

//     this.userTeam = new Team();
//     this.aiTeam = new Team();
//     this.userHeroes = [Bowman, Swordsman, Magician];
//     this.aiHeroes = [Daemon, Undead, Vampire];
//   }

//   init() {
//     this.gamePlay.drawUi(themes.prairie);//отрисовка поля
//     // TODO: add event listeners to gamePlay events
//     // TODO: load saved stated from stateService
//     this.userTeam.addHeroes(generateTeam(this.userHeroes, 1, 2));
//     this.aiTeam.addHeroes(generateTeam(this.aiHeroes, 1, 2));

//     this.positionTeam(this.userTeam, this.positionUser());
//     this.positionTeam(this.aiTeam, this.positionAi());

//     this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
//     this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
//     this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

//     this.gamePlay.redrawPositions(this.gameState.allCell);
//   }

//   onCellClick(index) {
//     // TODO: react to click
//   }

//   onCellEnter(index) {
//     // TODO: react to mouse enter
//   }

//   onCellLeave(index) {
//     // TODO: react to mouse leave
//   }
// }


import themes from './themes';
import GamePlay from './GamePlay';
import Team from './Team';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import { allowedValues, allowedValuesAttack } from './allowedValues';
import cursors from './cursors';
import showCharacterInformation from './showCharacterInformation';
import GameState from './GameState';

let userPositions = [];
let enemyPositions = [];
let selectedCharacterIndex = 0;
let allowedDistance;
let allowedPosition;
let boardSize;

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentTheme = themes.prairie;
    this.index = 0;
    this.blockedBoard = false;
    this.selected = false;
    this.selectedCharacter = {};
    this.currentMove = 'user';
    this.point = 0;
    this.level = 1;
    this.userTeams = [];
    this.enemyTeams = [];
  }

  /* eslint class-methods-use-this: 0 */

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.mouseEvents();
    this.nextLevel();
  }

  mouseEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
  }

  saveGame() {
    const maxPoint = this.maxPoints();
    const currentGameState = {
      point: this.point,
      maxPoint,
      level: this.level,
      currentTheme: this.currentTheme,
      userPositions,
      enemyPositions,
    };
    this.stateService.save(GameState.from(currentGameState));
    GamePlay.showMessage('Game saved!');
  }

  loadGame() {
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        this.point = loadGameState.point;
        this.level = loadGameState.level;
        this.currentTheme = loadGameState.currentTheme;
        userPositions = loadGameState.userPositions;
        enemyPositions = loadGameState.enemyPositions;
        this.gamePlay.drawUi(this.currentTheme);
        this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
      }
      GamePlay.showMessage('Game loaded!');
    } catch (e) {
      console.log(e);
      GamePlay.showMessage('Не удалось загрузить игру');
      this.newGame();
    }
  }

  maxPoints() {
    let maxPoint = 0;
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        maxPoint = Math.max(loadGameState.maxPoint, this.point);
      }
    } catch (e) {
      maxPoint = this.point;
      console.log(e);
    }
    return maxPoint;
  }

  async onCellClick(index) {
    // TODO: react to click
    this.index = index;
    if (!this.blockedBoard) {
      if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
        GamePlay.showError('Inappropriate action!');
      } else if (this.funcFindIndex([...userPositions]) !== -1) {
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.selectCell(index);
        selectedCharacterIndex = index;
        this.selectedCharacter = [...userPositions].find(
          (item) => item.position === index,
        );
        this.selected = true;
      } else if (
        !this.selected
        && this.funcFindIndex([...enemyPositions]) !== -1
      ) {
        GamePlay.showError('Not your character!');
      } else if (
        this.selected
        && this.gamePlay.boardEl.style.cursor === 'pointer'
      ) {
        // move
        this.selectedCharacter.position = index;
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.selected = false;
        this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
        this.currentMove = 'enemy';
        this.enemyStrategy();
      } else if (
        this.selected
        && this.gamePlay.boardEl.style.cursor === 'crosshair'
      ) {
        // attack
        const thisAttackEnemy = [...enemyPositions].find(
          (item) => item.position === index,
        );
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor(cursors.auto);
        this.selected = false;
        await this.characterAttacker(
          this.selectedCharacter.character,
          thisAttackEnemy,
        );
        if (enemyPositions.length > 0) {
          this.enemyStrategy();
        }
      }
    }
  }

  funcFindIndex(arr) {
    return arr.findIndex((item) => item.position === this.index);
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.index = index;
    if (!this.blockedBoard) {
      for (const item of [...userPositions, ...enemyPositions]) {
        if (item.position === index) {
          this.gamePlay.showCellTooltip(
            showCharacterInformation(item.character),
            index,
          );
        }
      }

      if (this.selected) {
        allowedPosition = this.selectedCharacter.position;
        allowedDistance = this.selectedCharacter.character.distance;
        boardSize = this.gamePlay.boardSize;

        const allowedPositions = allowedValues(
          allowedPosition,
          allowedDistance,
          boardSize,
        );
        allowedDistance = this.selectedCharacter.character.distanceAttack;

        const allowAttack = allowedValuesAttack(
          allowedPosition,
          allowedDistance,
          boardSize,
        );

        if (this.funcFindIndex(userPositions) !== -1) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (
          allowedPositions.includes(index)
          && this.funcFindIndex([...userPositions, ...enemyPositions]) === -1
        ) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else if (
          allowAttack.includes(index)
          && this.funcFindIndex(enemyPositions) !== -1
        ) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  getPositions(length) {
    const position = {
      user: [],
      enemy: [],
    };
    let random;
    for (let i = 0; i < length; i += 1) {
      do {
        random = this.randomPosition();
      } while (position.user.includes(random));
      position.user.push(random);
      do {
        random = this.randomPosition(6);
      } while (position.enemy.includes(random));
      position.enemy.push(random);
    }
    return position;
  }

  randomPosition(columnEnemy = 0) {
    return (Math.floor(Math.random() * 8) * 8) + ((Math.floor(Math.random() * 2) + columnEnemy));
  }

  newGame() {
    this.blockedBoard = false;
    const maxPoint = this.maxPoints();
    const currentGameState = this.stateService.load();
    if (currentGameState) {
      currentGameState.maxPoint = maxPoint;
      this.stateService.save(GameState.from(currentGameState));
    }
    userPositions = [];
    enemyPositions = [];
    this.level = 1;
    this.point = 0;
    this.currentTheme = themes.prairie;
    this.nextLevel();
    GamePlay.showMessage('Game started.');
  }

  levelUp() {
    for (const item of userPositions) {
      const current = item.character;
      current.level += 1;
      current.attack = this.levelUplForAttackAndDefence(current.attack, current.health);
      current.defence = this.levelUplForAttackAndDefence(current.defence, current.health);
      current.health = (current.health + 80) < 100 ? current.health + 80 : 100;
    }
  }

  levelUplForAttackAndDefence(attackBefore, life) {
    return Math.floor(Math.max(attackBefore, attackBefore * (1.8 - life / 100)));
  }

  nextLevel() {
    this.currentMove = 'user';
    if (this.level === 1) {
      this.userTeams = generateTeam(Team.userTeamLevel1, 1, 2);
      this.enemyTeams = generateTeam(Team.enemyTeam, 1, 2);
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
      GamePlay.showMessage('Start Level 1');
    } else if (this.level === 2) {
      this.currentTheme = themes.desert;
      this.userTeams = generateTeam(Team.userTeam, 1, 1);
      this.enemyTeams = generateTeam(
        Team.enemyTeam,
        2,
        this.userTeams.length + userPositions.length,
      );
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
      GamePlay.showMessage('Start Level 2');
    } else if (this.level === 3) {
      this.currentTheme = themes.arctic;
      this.userTeams = generateTeam(Team.userTeam, 2, 2);
      this.enemyTeams = generateTeam(
        Team.enemyTeam,
        3,
        this.userTeams.length + userPositions.length,
      );
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
      GamePlay.showMessage('Start Level 3');
    } else if (this.level === 4) {
      this.currentTheme = themes.mountain;
      this.userTeams = generateTeam(Team.userTeam, 3, 2);
      this.enemyTeams = generateTeam(
        Team.enemyTeam,
        4,
        this.userTeams.length + userPositions.length,
      );
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
      GamePlay.showMessage('Start Level 4');
    } else {
      this.blockedBoard = true;
      GamePlay.showMessage(`Game over. Your scores ${this.point} .`);
      return;
    }

    const characterPositions = this.getPositions(userPositions.length);
    for (let i = 0; i < userPositions.length; i += 1) {
      userPositions[i].position = characterPositions.user[i];
      enemyPositions[i].position = characterPositions.enemy[i];
    }

    this.gamePlay.drawUi(this.currentTheme);
    this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
  }

  addPositionCharacter(userTeams, enemyTeams) {
    for (let i = 0; i < userTeams.length; i += 1) {
      userPositions.push(new PositionedCharacter(userTeams[i], 0));
    }
    for (let i = 0; i < enemyTeams.length; i += 1) {
      enemyPositions.push(new PositionedCharacter(enemyTeams[i], 0));
    }
  }

  async enemyAttacks(character, target) {
    await this.characterAttacker(character, target);
    this.currentMove = 'user';
  }




  // async characterAttacker(attacker, target) {
  //   const targetCharacter = target.character;
  //   let damage = Math.max(attacker.attack - targetCharacter.defence, attacker.attack * 0.1);
  //   damage = Math.floor(damage);
  //   await this.gamePlay.showDamage(target.position, damage);
  //   targetCharacter.health -= damage;
  //   this.currentMove = this.currentMove === 'enemy' ? 'user' : 'enemy';
  //   if (targetCharacter.health <= 0) {
  //     userPositions = userPositions.filter((item) => item.position !== target.position);
  //     enemyPositions = enemyPositions.filter((item) => item.position !== target.position);
  //     if (userPositions.length === 0) {
  //       GamePlay.showMessage('Game over!');
  //       this.blockedBoard = true;
  //     }
  //     if (enemyPositions.length === 0) {
  //       console.log('The enemy lost!');
  //       for (const item of userPositions) {
  //         this.point += item.character.health;
  //       }
  //       this.levelUp();
  //       this.level += 1;
  //       this.nextLevel();
  //     }
  //   }
  //   this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
  // }

  // enemyStrategy() {
  //   if (this.currentMove === 'enemy') {
  //     // attack
  //     for (const itemEnemy of [...enemyPositions]) {
  //       allowedDistance = this.selectedCharacter.character.distanceAttack;
  //       allowedPosition = itemEnemy.position;
  //       boardSize = this.gamePlay.boardSize;
  //       const allowAttack = allowedValuesAttack(
  //         allowedPosition,
  //         allowedDistance,
  //         boardSize,
  //       );
  //       const target = this.enemyAttack(allowAttack);
  //       if (target !== null) {
  //         this.enemyAttacks(itemEnemy.character, target);
  //         return;
  //       }
  //     }

  //     // move
  //     const randomIndex = Math.floor(
  //       Math.random() * [...enemyPositions].length,
  //     );
  //     const randomEnemy = [...enemyPositions][randomIndex];
  //     this.enemyMove(randomEnemy);
  //     this.gamePlay.redrawPositions([...userPositions, ...enemyPositions]);
  //     this.currentMove = 'user';
  //   }
  // }

  // enemyMove(itemEnemy) {
  //   const tempEnemy = itemEnemy;
  //   const itemEnemyDistance = itemEnemy.character.distance;
  //   let tempRow;
  //   let tempColumn;
  //   let stepRow;
  //   let stepColumn;
  //   let Steps;
  //   const itemEnemyRow = this.positionRow(tempEnemy.position);
  //   const itemEnemyColumn = this.positionColumn(tempEnemy.position);
  //   let nearUser = {};

  //   for (const itemUser of [...userPositions]) {
  //     const itemUserRow = this.positionRow(itemUser.position);
  //     const itemUserColumn = this.positionColumn(itemUser.position);
  //     stepRow = itemEnemyRow - itemUserRow;
  //     stepColumn = itemEnemyColumn - itemUserColumn;
  //     Steps = Math.abs(stepRow) + Math.abs(stepColumn);

  //     if (nearUser.steps === undefined || Steps < nearUser.steps) {
  //       nearUser = {
  //         steprow: stepRow,
  //         stepcolumn: stepColumn,
  //         steps: Steps,
  //         positionRow: itemUserRow,
  //         positionColumn: itemUserColumn,
  //       };
  //     }
  //   }
  //   // diagonal travel
  //   if (Math.abs(nearUser.steprow) === Math.abs(nearUser.stepcolumn)) {
  //     if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
  //       tempRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));
  //       tempColumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

  //       tempEnemy.position = this.rowColumnToIndex(tempRow, tempColumn);
  //     } else {
  //       tempRow = (itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow))));
  //       tempColumn = (itemEnemyColumn - (nearUser.stepcolumn - (1 * Math.sign(nearUser.steprow))));

  //       tempEnemy.position = this.rowColumnToIndex(tempRow, tempColumn);
  //     }
  //   } else if (nearUser.stepcolumn === 0) {
  //     // vertical travel
  //     if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
  //       tempRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));

  //       tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
  //     } else {
  //       tempRow = (itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow))));

  //       tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
  //     }
  //   } else if (nearUser.steprow === 0) {
  //     // horizontal travel
  //     if (Math.abs(nearUser.stepcolumn) > itemEnemyDistance) {
  //       tempColumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

  //       tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempColumn);
  //     } else {
  //       const tempFormul = (nearUser.stepcolumn - (1 * Math.sign(nearUser.stepcolumn)));
  //       tempColumn = (itemEnemyColumn - tempFormul);

  //       tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempColumn);
  //     }
  //   } else if (Math.abs(nearUser.steprow) > Math.abs(nearUser.stepcolumn)) {
  //     if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
  //       tempRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));

  //       tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
  //     } else {
  //       tempRow = (itemEnemyRow - (nearUser.steprow));

  //       tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
  //     }
  //   } else if (Math.abs(nearUser.stepcolumn) > itemEnemyDistance) {
  //     tempColumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

  //     tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempColumn);
  //   } else {
  //     tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn));
  //   }
  // }

  // positionRow(index) {
  //   return Math.floor(index / this.gamePlay.boardSize);
  // }

  // positionColumn(index) {
  //   return index % this.gamePlay.boardSize;
  // }

  // rowColumnToIndex(row, column) {
  //   return (row * 8) + column;
  // }

  // enemyAttack(allowAttack) {
  //   for (const itemUser of [...userPositions]) {
  //     if (allowAttack.includes(itemUser.position)) {
  //       return itemUser;
  //     }
  //   }
  //   return null;
  // }
}