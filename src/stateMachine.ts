// String enum

enum STATES {
  NOTHING_SELECTED = "NOTHING_SELECTED",
  // Circler is last selected item
  CIRCLE_SELECTED = "CIRCLE_SELECTED",
  // Rectangle is last selected item
  RECTANGLE_SELECTED = "RECTANGLE_SELECTED",
  // ARc is last selected item
  ARC_SELECTED = "ARC_SELECTED",
  ARC_STARTED = "ARC_STARTED",
}

class StateMachine {
  state: STATES;

  constructor() {
    this.state = STATES.NOTHING_SELECTED;
  }
  
  next(event: Event) {
  }

}
export { StateMachine, STATES }; 
