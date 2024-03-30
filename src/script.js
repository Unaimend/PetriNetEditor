const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let lastX = 0;
let lastY = 0;
const shapes = []; // Array to store drawn shapes
let currentDraw = "circle"

let shapeCreator = {
        circle: () => shapes.push(new Circle(lastX, lastY)),
        rectangle: () => shapes.push(new Rectangle(lastX, lastY))
}


let drawis = {
        rectangle: setRectangle,
        circle: setCircle,
};


class Shape{
  constructor(x, y, fillColor = "blue") {
    this.x = x;
    this.y = y; 
    this.fillColor = fillColor
    // Used in removal and moving of nodes
    this.isSelected = false
  }
  
  draw(e, x, y) {
  }     
}

class Rectangle extends Shape{
  constructor(x, y, fillColor = "white") {
    super(x, y, fillColor);
  }

  draw(e) {
    ctx.beginPath();
    ctx.fillStyle = this.fillColor;
    if (this.isSelected) {
        ctx.fillStyle = "red";
    }
    ctx.fillRect(this.x, this.y, 150, 100);
    ctx.fillStyle = "black";
    ctx.strokeRect(this.x, this.y, 150, 100);
    ctx.stroke();
    ctx.fillStyle = "white";;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
}

class Circle extends Shape{
  constructor(x, y, fillColor = "blue") {
    super(x, y, fillColor);
  }
  draw(e) {
    const radius = 50;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.fillColor;
    if (this.isSelected) {
        ctx.fillStyle = "red";
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "white";
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
}




function add(e) {
    setMode = drawis[currentDraw]
    setMode()
    if (!isIntersectingShape(lastX,lastY)) {
      shape = shapeCreator[currentDraw]
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
            if (x >= shape.x && x <= shape.x + 100 && y >= shape.y && y <= shape.y + 100) {
                collision = true;
            } else {
            }

        } else if (shape instanceof Circle) {
            const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (distance <= 50) {
                collision = true;
            } else {
            }
        
        } 
        
    }
    return collision
}



function selectElement(x, y) {
    for (const shape of shapes) {
        if (shape instanceof Rectangle) {
            if (x >= shape.x && x <= shape.x + 100 && y >= shape.y && y <= shape.y + 100) {
                console.log("DWdwd")
                shape.isSelected = true
            } else {
                shape.isSelected = false
            }

        } else if (shape instanceof Circle) {
            const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (distance <= 50) {
                shape.isSelected = true
            } else {
                shape.isSelected = false
            }
        
        } 
    }
}

function deselectElement(x, y) {
    for (const shape of shapes) {
        if (shape instanceof Rectangle) {
            if (x >= shape.x && x <= shape.x + 100 && y >= shape.y && y <= shape.y + 100) {
                shape.isSelected = !shape.isSelected
                console.log("DWdwddwww222")
            } 

        } else if (shape instanceof Circle) {
            const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (distance <= 50) {
                console.log("DWdwdd")
                shape.isSelected = !shape.isSelected
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
            console.log("X", shape.x)
            console.log("Y", shape.y)
        }
        redraw(event)
    }
});


canvas.addEventListener('mousedown', (e) => {
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousedown', (e) => {
    selectElement(e.offsetX, e.offsetY)
});

canvas.addEventListener('mouseup', (e) => {
    deselectElement(e.offsetX, e.offsetY)
});

canvas.addEventListener('mouseup', (e) => add(e));


document.getElementById('rectangle-btn').addEventListener('click', setRectangle);
document.getElementById('circle-btn').addEventListener('click', setCircle);

//#https://chat.openai.com/c/242ec82c-5960-40ea-9ebd-f67c84ec2205
