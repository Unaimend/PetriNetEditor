export class Canvas {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
    this.lastSelectedElement = -1
    this.lastX = 0;
    this.lastY = 0;
    this.shapes = []
    this.shapeCreator = {
            circle: (pos) => { this.shapes.push(new Circle(this.ctx, pos.x, pos.y)) },
            rectangle: (pos) => this.shapes.push(new Rectangle(this.ctx, pos.x, pos.y))
    }
    this.currentShape = this.shapeCreator["circle"]
    this.arcStart = null;
    this.arcEnd = null;
    this.shapes = []; // Array to store drawn shapes
    this.selectedElem = null
    this.arcMode = false

    this.isDragging = false





    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      var elem = this.selectElement(e.offsetX, e.offsetY);
      if(elem == null) {
        this.addNewShape(e)
      }
      this.redrawShapes()
    });

    this.canvas.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          if (this.selectedElem != null) {
            this.selectedElem.x = e.offsetX;
            this.selectedElem.y = e.offsetY;
            this.redrawShapes(e)
          }
        }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.isDragging = false;
      if (this.selectedElem != null) {
        this.selectedElem.fillColor = "blue";
        this.selectedElem = null
        this.redrawShapes(e)
      }
      
    });



  }

  addNewShape(e) {
    if (!this.isIntersectingShape(e.offsetX, e.offsetY) && this.arcMode == false) {
      this.currentShape({x: e.offsetX, y: e.offsetY})
    }
    this.redrawShapes(e)
  }

  redrawShapes(e) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
    for (const shape of this.shapes) {
      shape.draw(e)
    }
  }
  
  isIntersectingShape(x, y) {
    var collision = false
    for (const shape of this.shapes) {
        if (shape instanceof Rectangle) {
            if (x >= shape.x && x <= shape.x + shape.width && 
                y >= shape.y && y <= shape.y + shape.height) {
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


  selectElement(x, y) {
    var shape = null
    console.log(this.selectedElem)
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      shape = this.shapes[i]
      if (shape instanceof Rectangle) {
        if (x >= shape.x && x <= shape.x + shape.width && 
          y >= shape.y && y <= shape.y + shape.height) {
          //shape.isSelected = true
          //lastSelectedElement = i
          if (this.selectedElem != null) {
            this.selectedElem.fillColor = "blue";
          }
          this.selectedElem = shape
          this.selectedElem.fillColor = "red";
          return this.selectedElem
        }// else {
          //  shape.isSelected = false
        //}
      } else if (shape instanceof Circle) {
        const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
        if (distance <= shape.radius) {
          //shape.isSelected = true
          //lastSelectedElement = i
          if (this.selectedElem != null) {
            this.selectedElem.fillColor = "blue";
          }
          this.selectedElem = shape
          this.selectedElem.fillColor = "red";
          return this.selectedElem
        } //else {
            //shape.isSelected = false
        //}
      } 
    }
    return null
  }
}




export class Shape {
  constructor(ctx, x, y, fillColor = "blue") {
    this.ctx = ctx
    this.x = x;
    this.y = y; 
    this.fillColor = fillColor
    // Used in removal and moving of nodes
    this.isSelected = false
    this.arcStart = false
    this.arcEnd = false
  }
  getBoundingBox() {} 
  draw(e, x, y) {}     
}

export class Circle extends Shape{
  constructor(ctx, x, y, fillColor = "blue") {
    super(ctx, x, y, fillColor);
    this.radius = 10;
  }
  draw(e, debug = false) {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.fillColor;

    if(debug == true) {
        var bb = this.getBoundingBox()       
        this.ctx.fillStyle = "pink";
        this.ctx.strokeRect(...Object.values(bb));
        this.ctx.stroke();
    }
    this.ctx.fill();
    this.ctx.closePath();

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

export class Rectangle extends Shape{
  constructor(ctx, x, y, width = 20, height = 50,fillColor = "yellow") {
    super(ctx, x, y, fillColor);
    this.width = width;
    this.height = height;
        
  }

  draw(e) {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.fillColor;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = "black";
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);
    this.ctx.stroke();

    this.ctx.fillStyle = "green";
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



export class Arc extends Shape {
  constructor(ctx, start, end, fillColor) {
    super(ctx, start.x, start.y, fillColor);
    this.startShape = start
    this.endShape = end 
  }

  draw(e) {
    var arrowSize = 10;
    var startX = this.startShape.x;
    var startY = this.startShape.y;
    var endX = this.endShape.x;
    var endY = this.endShape.y; 
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Calculate angle of the line
    const angle = Math.atan2(endY - startY, endX - startX);

    // Draw the arrowhead
    this.ctx.save();
    this.ctx.translate(endX, endY);
    this.ctx.rotate(angle);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-arrowSize, arrowSize / 2);
    this.ctx.lineTo(-arrowSize, -arrowSize / 2);
    this.ctx.closePath();

    this.ctx.fill();
    this.ctx.restore();
  }
}
