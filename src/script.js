import {Canvas, Shape, Arc, Rectangle, Circle }  from './shapes.js';


var c = new Canvas(document.getElementById('myCanvas'));


//
//
//
//function setCircle() {
//        currentDraw = "circle"
//}
//
//function setRectangle() {
//        currentDraw = "rectangle"
//}
//
//
//
//function startArc(x, y) {
//    var shape
//    for (let i = shapes.length - 1; i >= 0; i--) {
//      shape = shapes[i]
//      if (shape instanceof Rectangle) {
//          if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
//            shape.arcStart = true
//            return shape;
//          } else {
//              shape.arcStart = false
//          }
//      } else if (shape instanceof Circle) {
//          const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
//          if (distance <= shape.radius) {
//            shape.arcStart = true
//            return shape;
//          } else {
//              shape.arcStart = false
//          }
//      } 
//    }
//  return null
//}
//
//function endArc(x, y) {
//  var shape;
//    for (let i = shapes.length - 1; i >= 0; i--) {
//      shape = shapes[i]
//      if (shape instanceof Rectangle) {
//          if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
//            shape.arcEnd = true
//            return shape;
//          } else {
//              shape.arcEnd = false
//          }
//      } else if (shape instanceof Circle) {
//          const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
//          if (distance <= shape.radius) {
//            shape.arcEnd = true
//            return shape;
//          } else {
//              shape.arcEnd = false
//          }
//      } 
//    }
//  return null
//}
//
//
//
//
//
//function deselectElement(x, y) {
//    for (const shape of shapes) {
//        if (shape instanceof Rectangle) {
//            if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
//                if(shape.isSelected == true) {
//                  shape.isSelected = !shape.isSelected
//                  return shape
//                }
//            } 
//
//        } else if (shape instanceof Circle) {
//            const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
//            if (distance <= shape.radius) {
//                if(shape.isSelected == true) {
//                  shape.isSelected = !shape.isSelected
//                  return shape
//                }
//            } 
//        } 
//    }
//}
//
//
//canvas.addEventListener('mousemove', function(event) {
//    for (const shape of shapes) {
//        if (shape.isSelected) {
//            const rect = canvas.getBoundingClientRect();
//            const mouseX = event.clientX - rect.left;
//            const mouseY = event.clientY - rect.top;
//            shape.x = mouseX
//            shape.y = mouseY
//        }
//        redraw(event)
//    }
//});
//
//
//canvas.addEventListener('mousedown', (e) => {
//    [lastX, lastY] = [e.offsetX, e.offsetY];
//});
//
//canvas.addEventListener('mouseup', (e) => {
//    console.log("arc2")
//    //if (arcMode && selectedElem != null && arcStart != null) {
//    //  console.log("Ending arc")
//    //}
//});
//
//
//
//canvas.addEventListener('click', (e) => {
//  if(selectedElem == null && arcMode == false ){
//    selectElement(e.offsetX, e.offsetY)
//    redraw(e)
//    return
//  }
//
//  if(arcMode == true && arcStart == null) {
//    var elem = startArc(e.offsetX,e.offsetY)
//    if (elem != null) {
//      console.log("Starting arc")
//      redraw(e)
//    }
//    arcStart = elem
//    return
//  }
//
//  if(arcMode == true && arcStart != null) {
//    var elem = endArc(e.offsetX,e.offsetY)
//    console.log("ArcEnd")
//    arcEnd = elem
//    console.log(elem)
//    if (elem != null) {
//      console.log("ending arc")
//      // DO stuff and reset arc start and arc end
//      shapes.push(new Arc(arcStart, arcEnd))
//    
//    }
//    for(var i = 0; i < shapes.length; ++i) {
//      var s = shapes[i]
//      s.arcStart = false;
//      s.arcEnd = false;
//    }
//    arcStart = null
//    arcEnd = null
//    redraw(e)
//
//    return
//  }
//
//  if(selectedElem != null && arcMode == false) {
//    selectedElem.isSelected = false
//    selectedElem = null
//    redraw(e)
//    return
//  }
//});
//
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
//document.addEventListener('keydown', (event) => {
//    // Check if the pressed key is 'x' or 'X'
//    if (event.key === 'a' || event.key === 'A') {
//      if(arcMode == true) {
//        arcMode = false
//      } else {
//        arcMode = true
//      }
//    }
//    console.log(arcMode)
//});


document.getElementById('rectangle-btn').addEventListener('click', 
  () => {c.currentShape = c.shapeCreator["rectangle"];} );
document.getElementById('circle-btn').addEventListener('click', 
  () => {c.currentShape = c.shapeCreator["circle"]; });


document.getElementById('debug-btn').addEventListener('click', 
  () => {console.log(c.selectedElem)});


