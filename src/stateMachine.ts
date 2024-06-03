// String enum

enum STATES {
  NOTHING_SELECTED = "NOTHING_SELECTED",
  // Circler is last selected item
  SHAPE_SELECTED = "SHAPE_SELECTED",
  // ARc is last selected item
  ARC_SELECTED = "ARC_SELECTED",
  ARC_STARTED = "ARC_STARTED",
  IS_DRAGGING = "IS_DRAGGING",
  IS_PANNING = "IS_PANNING",
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
