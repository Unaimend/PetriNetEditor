import {Canvas, Shape, Arc, Rectangle, Circle }  from './shapes.js';


var c = new Canvas(document.getElementById('myCanvas'));



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
    console.log(c.shapes)
  });


document.addEventListener('keydown', (event) => {
  // Check if the pressed key is 'x' or 'X'
  if (event.key === 'x' || event.key === 'X') {
    c.deleteShape()
  }
  if (event.key === 'c' || event.key === 'C') {
    console.log("WD")
    c.currentShape = c.shapeCreator["circle"];
  }
  if (event.key === 'r' || event.key === 'R') {
    c.currentShape = c.shapeCreator["rectangle"];
  }
});

const canvas = document.getElementById('myCanvas');
const main = document.getElementById('main');




// Function to resize the canvas to fill its container
function resizeCanvas() {
    // Set the canvas width and height to match the container's dimensions
    canvas.width = 0.97 * main.clientWidth;
    canvas.height = 0.95 * main.clientHeight;
}

// Call resizeCanvas() initially and whenever the window is resized
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
