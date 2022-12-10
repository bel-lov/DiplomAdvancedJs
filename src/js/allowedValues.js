export function allowedValues(position, distance, boardSize) {
    const allowValues = [];
    const itemRow = Math.floor(position / boardSize);
    const itemColumn = position % boardSize;

    for (let i = 1; i <= distance; i += 1) {
        if (itemColumn + i < 8) {
            allowValues.push(itemRow * 8 + (itemColumn + i));
        }
        if (itemColumn - i >= 0) {
            allowValues.push(itemRow * 8 + (itemColumn - i));
        }
        if (itemRow + i < 8) {
            allowValues.push((itemRow + i) * 8 + itemColumn);
        }
        if (itemRow - i >= 0) {
            allowValues.push((itemRow - i) * 8 + itemColumn);
        }
        if (itemRow + i < 8 && itemColumn + i < 8) {
            allowValues.push((itemRow + i) * 8 + (itemColumn + i));
        }
        if (itemRow - i >= 0 && itemColumn - i >= 0) {
            allowValues.push((itemRow - i) * 8 + (itemColumn - i));
        }
        if (itemRow + i < 8 && itemColumn - i >= 0) {
            allowValues.push((itemRow + i) * 8 + (itemColumn - i));
        }
        if (itemRow - i >= 0 && itemColumn + i < 8) {
            allowValues.push((itemRow - i) * 8 + (itemColumn + i));
        }
    }
    return allowValues;
}

export function allowedValuesAttack(position, distance, boardSize) {
    // straight and diagonal attack
    const allowValues = [];
    const itemRow = Math.floor(position / boardSize);
    const itemColumn = position % boardSize;

    for (let i = 1; i <= distance; i += 1) {
        if (itemColumn + i < 8) {
            allowValues.push(itemRow * 8 + (itemColumn + i));
        }
        if (itemColumn - i >= 0) {
            allowValues.push(itemRow * 8 + (itemColumn - i));
        }
        if (itemRow + i < 8) {
            allowValues.push((itemRow + i) * 8 + itemColumn);
        }
        if (itemRow - i >= 0) {
            allowValues.push((itemRow - i) * 8 + itemColumn);
        }
        if (itemRow + i < 8 && itemColumn + i < 8) {
            allowValues.push((itemRow + i) * 8 + (itemColumn + i));
        }
        if (itemRow - i >= 0 && itemColumn - i >= 0) {
            allowValues.push((itemRow - i) * 8 + (itemColumn - i));
        }
        if (itemRow + i < 8 && itemColumn - i >= 0) {
            allowValues.push((itemRow + i) * 8 + (itemColumn - i));
        }
        if (itemRow - i >= 0 && itemColumn + i < 8) {
            allowValues.push((itemRow - i) * 8 + (itemColumn + i));
        }
    }
    return allowValues;
}