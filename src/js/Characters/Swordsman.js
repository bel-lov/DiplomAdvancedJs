import Character from '../Character';

export default class Swordsman extends Character {
    constructor(level, type) {
        super(level, type);
        this.attack = 40;
        this.defence = 10;
        this.distance = 4;
        this.attackRange = 1;
        this.type = 'swordsman';
        this.class = 'Мечник';
    }
}