
function createLabelInputPair_(canvas, propertyWindow, elem, labelText, extractor, setter) {
  // Create label and input elements
  var pair = document.createElement('div');
  pair.classList.add('property-pair-container')
  var label = document.createElement('label');
  label.textContent = labelText;
  label.classList.add('property-label');

  var input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', labelText)
  input.setAttribute('value', extractor(elem));
  input.classList.add('property-input');
  pair.appendChild(label);
  pair.appendChild(input);
  propertyWindow.appendChild(pair)


  input.addEventListener('input', function(event) {
    const currentValue = event.target.value;
    var idInput = document.getElementById('id')
    const currentID = idInput.value
    const currentShape = canvas.getShapeWithID(currentID)
    setter(currentShape, currentValue)
    canvas.redrawShapes(event)
  });
  return pair
}


export function addCircleProperties(canvas, elem) {
  const container = document.getElementById('property-editor');
  // Create a new div element for the property
  const propertyWindow = document.createElement('div');
  const self = canvas;
  function createLabelInputPair(labelText, extractor, setter) {
    var newDiv = createLabelInputPair_(self, propertyWindow, elem, labelText, extractor, setter)
    container.appendChild(newDiv);
  }
  
  createLabelInputPair("id", (e) => e.id, (s, v) => s.id = v)
  createLabelInputPair( "X Pos", (e) => e.x, (s, v) => s.x = v)
  createLabelInputPair( "Y Pos", (e) => e.y, (s, v) => s.y = v)
  createLabelInputPair( "Tokens", (e) => e.tokens, (s, v) => s.tokens = v)
  createLabelInputPair( "Label", (e) => e.label, (s, v) => s.label= v)
}


export function addRectangleProperties(canvas, elem) {
  const container = document.getElementById('property-editor');
  // Create a new div element for the property
  const propertyWindow = document.createElement('div');
  const self = canvas;
  function createLabelInputPair(labelText, extractor, setter) {
    var newDiv = createLabelInputPair_(self, propertyWindow, elem, labelText, extractor, setter)
    container.appendChild(newDiv);
  }
  
  createLabelInputPair("id", (e) => e.id, (s, v) => s.id = v)
  createLabelInputPair( "X Pos", (e) => e.x, (s, v) => s.x = v)
  createLabelInputPair( "Y Pos", (e) => e.y, (s, v) => s.y = v)
  createLabelInputPair( "Label", (e) => e.label, (s, v) => s.label= v)
}
