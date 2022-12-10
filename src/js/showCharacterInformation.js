const icons = {
    level: '\u{1F396}',
    attack: '\u{2694}',
    defence: '\u{1F6E1}',
    health: '\u{2764}',
};

export default function showCharacterInformation(character) {
    return `${icons.level}${character.level} ${icons.attack}${character.attack} ${icons.defence}${character.defence} ${icons.health}${character.health}`;
}