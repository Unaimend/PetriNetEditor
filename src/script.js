const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

//import { Shape, Arc, Rectangle, Circle }  from './shapes.js';

let lastX = 0;
let lastY = 0;
let arcStart = null;
const shapes = []; // Array to store drawn shapes
let currentDraw = "circle"
var selectedElem = null
let arcMode = false
let shapeCreator = {
        circle: () => { shapes.push(new Circle(lastX, lastY)) },
        rectangle: () => shapes.push(new Rectangle(lastX, lastY))
}


let drawis = {
        rectangle: setRectangle,
        circle: setCircle,
};

var lastSelectedElement = -1
var lastSelectedPlace = -1
var lastSelectedTransition = -1

class Shape {
  constructor(x, y, fillColor = "blue") {
    this.x = x;
    this.y = y; 
    this.fillColor = fillColor
    // Used in removal and moving of nodes
    this.isSelected = false
  }
  getBoundingBox() {} 
  draw(e, x, y) {}     
}

class Arc extends Shape {
  constructor(start, end, fillColor) {
    super(start.x, start.y, fillColor);
    this.startShape = start
    this.endShape = end 
  }

  draw(e) {
    var arrowSize = 10;
    var startX = this.startShape.x;
    var startY = this.startShape.y;
    var endX = this.endShape.x;
    var endY = this.endShape.y; 
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Calculate angle of the line
    const angle = Math.atan2(endY - startY, endX - startX);

    // Draw the arrowhead
    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, arrowSize / 2);
    ctx.lineTo(-arrowSize, -arrowSize / 2);
    ctx.closePath();

    ctx.fill();
    ctx.restore();
  }
}

export class Rectangle extends Shape{
  constructor(x, y, width = 20, height = 50,fillColor = "white") {
    super(x, y, fillColor);
    this.width = width;
    this.height = height;
        
  }

  draw(e) {
    ctx.beginPath();
    ctx.fillStyle = this.fillColor;
    if (this.isSelected) {
        ctx.fillStyle = "red";
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.stroke();
    ctx.fillStyle = "white";;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }


  getBoundingBox() {
    const topLeftX = this.x; 
    const topLeftY = this.y;
    const width = this.width
    const height = this.width

    return {
      x: topLeftX,
      y: topLeftY,
      width: width,
      height: height
    };
  }
}


class Circle extends Shape{
  constructor(x, y, fillColor = "blue") {
    super(x, y, fillColor);
    this.radius = 10;
  }
  draw(e, debug = true) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.fillColor;
    if (this.isSelected) {
        ctx.fillStyle = "red";
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "white";


    if(debug == true) {
        var bb = this.getBoundingBox()       
        ctx.fillStyle = "pink";
        ctx.strokeRect(...Object.values(bb));
        ctx.stroke();
    }

    [lastX, lastY] = [e.offsetX, e.offsetY];
  }

  getBoundingBox() {
    const topLeftX = this.x - this.radius
    const topLeftY = this.y - this.radius;
    const width = this.radius * 2;
    const height = this.radius * 2;

    return {
      x: topLeftX,
      y: topLeftY,
      width: width,
      height: height
    };
  }
}


function add(e) {
    var setMode = drawis[currentDraw]
    setMode()
    if (!isIntersectingShape(lastX,lastY) && arcMode == false) {
      var shape = shapeCreator[currentDraw]
      shape()
    }
    redraw(e)

}

function redraw(e) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  for (const shape of shapes) {
    shape.draw(e)
  }
}




function setCircle() {
        currentDraw = "circle"
}

function setRectangle() {
        currentDraw = "rectangle"
}


function isIntersectingShape(x, y) {
    var collision = false
    for (const shape of shapes) {
        if (shape instanceof Rectangle) {
            if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                collision = true;
            } else {
            }

        } else if (shape instanceof Circle) {
            const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (distance <= shape.radius) {
                collision = true;
            } else {
            }
        
        } 
        
    }
    return collision
}



function selectElement(x, y) {
    var shape
    for (let i = shapes.length - 1; i >= 0; i--) {
      shape = shapes[i]
      if (shape instanceof Rectangle) {
          if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
            shape.isSelected = true
            lastSelectedElement = i
            lastSelectedTransition = i
            selectedElem = shape
            break;
          } else {
              shape.isSelected = false
          }
      } else if (shape instanceof Circle) {
          const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
          if (distance <= shape.radius) {
            shape.isSelected = true
            lastSelectedElement = i
            lastSelectedPlace = i
            selectedElem = shape
            break
          } else {
              shape.isSelected = false
          }
      } 
    }
  return shape
}

function deselectElement(x, y) {
    for (const shape of shapes) {
        if (shape instanceof Rectangle) {
            if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                if(shape.isSelected == true) {
                  shape.isSelected = !shape.isSelected
                  return shape
                }
            } 

        } else if (shape instanceof Circle) {
            const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (distance <= shape.radius) {
                if(shape.isSelected == true) {
                  shape.isSelected = !shape.isSelected
                  return shape
                }
            } 
        } 
    }
}


canvas.addEventListener('mousemove', function(event) {
    for (const shape of shapes) {
        if (shape.isSelected) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            shape.x = mouseX
            shape.y = mouseY
        }
        redraw(event)
    }
});


canvas.addEventListener('mousedown', (e) => {
    [lastX, lastY] = [e.offsetX, e.offsetY];
    console.log("arc")
    console.log(selectedElem)
    console.log(arcStart)
    if (arcMode && selectedElem != null && arcStart == null) {
      console.log("Starting arc")
      arcStart = elem
    }

});

canvas.addEventListener('mouseup', (e) => {
    console.log("arc2")
    if (arcMode && selectedElem != null && arcStart != null) {
      console.log("Ending arc")
      shapes.push(new Arc(arcStart, selectedElem))
    }
});



canvas.addEventListener('click', (e) => {
  if(selectedElem == null && arcMode == false ){
    selectElement(e.offsetX, e.offsetY)
    redraw(e)
    return
  }
  if(selectedElem != null && arcMode == false) {
    selectedElem.isSelected = false
    selectedElem = null
  }
  redraw(e)
});


document.addEventListener('keydown', (event) => {
    // Check if the pressed key is 'x' or 'X'
    if (event.key === 'x' || event.key === 'X') {
        shapes.splice(lastSelectedElement, 1);
    }
    redraw(event)
});


document.addEventListener('keydown', (event) => {
    // Check if the pressed key is 'x' or 'X'
    if (event.key === 'a' || event.key === 'A') {
      if(arcMode == true) {
        arcMode = false
      } else {
        arcMode = true
      }
    }
    console.log(arcMode)
});

canvas.addEventListener('mouseup', (e) => add(e));


document.getElementById('rectangle-btn').addEventListener('click', setRectangle);
document.getElementById('circle-btn').addEventListener('click', setCircle);

//#https://chat.openai.com/c/242ec82c-5960-40ea-9ebd-f67c84ec2205
