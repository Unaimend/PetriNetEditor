import {Canvas, Shape, Arc, Rectangle, Circle }  from './shapes.js';


var c = new Canvas(document.getElementById('myCanvas'));

console.log(c.canvas.getContext("2d"))







document.getElementById('rectangle-btn').addEventListener('click', 
  () => {c.currentShape = c.shapeCreator["rectangle"];} );
document.getElementById('circle-btn').addEventListener('click', 
  () => {c.currentShape = c.shapeCreator["circle"]; });
document.getElementById('boxselect-btn').addEventListener('click', 
  () => {
    c.boxSelectMode = !c.boxSelectMode
    console.log(c.boxSelectMode)
  });

document.getElementById('debug-btn').addEventListener('click', 
  () => {
  });


document.addEventListener('keydown', (event) => {
  // Check if the pressed key is 'x' or 'X'
  if (event.key === 'x' || event.key === 'X') {
    c.deleteShape()
  }
});
