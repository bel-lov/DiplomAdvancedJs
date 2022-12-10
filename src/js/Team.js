/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
// export default class Team {
//   // TODO: write your logic here
// }
import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Daemon from './Characters/Daemon';
import Magician from './Characters/Magician';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

const allCharacters = [Bowman, Swordsman, Magician, Daemon, Undead, Vampire];
const userTeam = [Bowman, Swordsman, Magician];
const userTeamLevel1 = [Bowman, Swordsman];
const enemyTeam = [Daemon, Undead, Vampire];

class Team {
  constructor() {
    this.allCharacters = allCharacters;
    this.userTeam = userTeam;
    this.userTeamLevel1 = userTeamLevel1;
    this.enemyTeam = enemyTeam;
  }
}

const newTeam = new Team();
export default newTeam;
