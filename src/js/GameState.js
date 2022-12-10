export default class GameState {
  static from(object) {
    // TODO: create object
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
