
export function addCircleProperties(canvas, elem) {
  const container = document.getElementById('property-editor');

  const self = canvas;
  // Create a new div element for the property
  const newDiv = document.createElement('div');

  // Create label and input elements
  var pair = document.createElement('div');
  pair.classList.add('property-pair-container')
  var label = document.createElement('label');
  label.textContent = 'Id';
  label.setAttribute('for', 'IdPropertyInputl');
  label.classList.add('property-label');

  var idInput = document.createElement('input');
  idInput.setAttribute('type', 'text');
  idInput.setAttribute('id', 'IdPropertyInput');
  idInput.setAttribute('value', elem.id);
  idInput.classList.add('property-input');
  pair.appendChild(label);
  pair.appendChild(idInput);
  newDiv.appendChild(pair)

  pair = document.createElement('div');
  pair.classList.add('property-pair-container')
  label = document.createElement('label');
  label.textContent = 'X Pos';
  label.setAttribute('for', 'XPosPropertyInputl');
  label.classList.add('property-label');
  
  var input = document.createElement('input');
  input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'XPosPropertyInput');
  input.setAttribute('value', elem.x);
  pair.appendChild(label);
  pair.appendChild(input);
  newDiv.appendChild(pair)
  input.addEventListener('input', function(event) {
    const currentValue = event.target.value;
    const currentID = idInput.value
    const currentShape = self.getShapeWithID(currentID)
    currentShape.x = currentValue
    self.redrawShapes(event)
  });
  
  pair = document.createElement('div');
  pair.classList.add('property-pair-container')
  label = document.createElement('label');
  label.textContent = 'Y Pos';
  label.setAttribute('for', 'YPosPropertyInputl');
  label.classList.add('property-label');
  
  input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'YPosPropertyInput');
  input.setAttribute('value', elem.y);
  pair.appendChild(label);
  pair.appendChild(input);
  newDiv.appendChild(pair)
  input.addEventListener('input', function(event) {
    const currentValue = event.target.value;
    const currentID = idInput.value
    const currentShape = self.getShapeWithID(currentID)
    currentShape.y = currentValue
    self.redrawShapes(event)
  });

  // Append the new div to the container
  container.appendChild(newDiv);
} 


export function addRectangleProperties(canvas, elem) {
  const container = document.getElementById('property-editor');

  const self = canvas;
  // Create a new div element for the property
  const newDiv = document.createElement('div');

  // Create label and input elements
  var pair = document.createElement('div');
  pair.classList.add('property-pair-container')
  var label = document.createElement('label');
  label.textContent = 'Id';
  label.setAttribute('for', 'IdPropertyInputl');
  label.classList.add('property-label');

  var idInput = document.createElement('input');
  idInput.setAttribute('type', 'text');
  idInput.setAttribute('id', 'IdPropertyInput');
  idInput.setAttribute('value', elem.id);
  idInput.classList.add('property-input');
  pair.appendChild(label);
  pair.appendChild(idInput);
  newDiv.appendChild(pair)

  pair = document.createElement('div');
  pair.classList.add('property-pair-container')
  label = document.createElement('label');
  label.textContent = 'X Pos';
  label.setAttribute('for', 'XPosPropertyInputl');
  label.classList.add('property-label');
  
  var input = document.createElement('input');
  input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'XPosPropertyInput');
  input.setAttribute('value', elem.x);
  pair.appendChild(label);
  pair.appendChild(input);
  newDiv.appendChild(pair)
  input.addEventListener('input', function(event) {
    const currentValue = event.target.value;
    const currentID = idInput.value
    const currentShape = self.getShapeWithID(currentID)
    currentShape.x = currentValue
    self.redrawShapes(event)
  });
  
  pair = document.createElement('div');
  pair.classList.add('property-pair-container')
  label = document.createElement('label');
  label.textContent = 'Y Pos';
  label.setAttribute('for', 'YPosPropertyInputl');
  label.classList.add('property-label');
  
  input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'YPosPropertyInput');
  input.setAttribute('value', elem.y);
  pair.appendChild(label);
  pair.appendChild(input);
  newDiv.appendChild(pair)
  input.addEventListener('input', function(event) {
    const currentValue = event.target.value;
    const currentID = idInput.value
    const currentShape = self.getShapeWithID(currentID)
    currentShape.y = currentValue
    self.redrawShapes(event)
  });

  // Append the new div to the container
  container.appendChild(newDiv);
}
