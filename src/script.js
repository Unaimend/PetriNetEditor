import {Canvas, Shape, Arc, Rectangle, Circle }  from './shapes.js';


var c = new Canvas(document.getElementById('myCanvas'));

console.log(c.canvas.getContext("2d"))


//
//document.addEventListener('keydown', (event) => {
//    // Check if the pressed key is 'x' or 'X'
//    if (event.key === 'x' || event.key === 'X') {
//        shapes.splice(lastSelectedElement, 1);
//    }
//    redraw(event)
//});
//
//


document.getElementById('rectangle-btn').addEventListener('click', 
  () => {c.currentShape = c.shapeCreator["rectangle"];} );
document.getElementById('circle-btn').addEventListener('click', 
  () => {c.currentShape = c.shapeCreator["circle"]; });


document.getElementById('debug-btn').addEventListener('click', 
  () => {console.log(c.shapes)});


