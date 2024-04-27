import {addCircleProperties, addRectangleProperties}  from './propertyEditor.js';

export class Canvas {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
    this.shapes = []
    this.shapeCreator = {
            circle: (pos) => { this.shapes.push(new Circle(this.ctx, pos.x, pos.y)) },
            rectangle: (pos) => this.shapes.push(new Rectangle(this.ctx, pos.x, pos.y))
    }
    this.currentShape = this.shapeCreator["circle"]
    this.shapes = []; // Array to store drawn shapes
    this.selectedElem = null
    this.lastSelectedElem = null
    this.arc = null


    //https://observablehq.com/plot/getting-started
    //Add d3 stuff to the canvas
    //const context = this.ctx;

    //const width = canvas.width;
    //const height = canvas.height;

    //const nodes = d3.range(100).map(() => ({ x: Math.random() * width, y: Math.random() * height }));

    //const simulation = d3.forceSimulation(nodes)
    //                     .force("charge", d3.forceManyBody().strength(-5))
    //                     .force("center", d3.forceCenter(width / 2, height / 2))
    //                     .on("tick", ticked);

    //function ticked() {
    //  context.clearRect(0, 0, width, height);

    //  context.beginPath();
    //  nodes.forEach(d => {
    //    context.moveTo(d.x, d.y);
    //    context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
    //  });
    //  context.fillStyle = "#1f77b4";
    //  context.fill();
    //}


    this.isDragging = false
    this.isBoxSelecting = false
    this.boxStartX = null
    this.boxStartY = null
    this.boxSelectMode = false

    this.selectedElements = []



    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      if (this.boxSelectMode == true) {
        this.isBoxSelecting = true;
        this.boxStartX = e.offsetX
        this.boxStartY = e.offsetY
      }
      var elem = this.selectElement(e.offsetX, e.offsetY);
      this.addPropertyField(elem)
      this.redrawShapes()
    });


    this.canvas.addEventListener('click', (e) => {
      this.isDragging = false
      if(this.selectElem == null && this.boxSelectMode == false) {
        this.addNewShape(e)
      }
      this.redrawShapes()
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        if (this.selectedElem != null) {
          this.selectedElem.x = e.offsetX;
          this.selectedElem.y = e.offsetY;
          this.addPropertyField(this.selectedElem)
        }
      }

      // This REALLY kills performace
      this.redrawShapes()
      if (this.isBoxSelecting) {
        console.log(e.offsetX - this.boxStartX)
        console.log(e.offsetY - this.boxStartY)
        this.ctx.strokeRect(this.boxStartX, this.boxStartY, e.offsetX - this.boxStartX, e.offsetY - this.boxStartY);
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.isDragging = false;
      if (this.selectedElem != null) {
        this.selectedElem.fillColor = "blue";
        this.selectedElem = null
      }
      if(this.isBoxSelecting) {
        this.selectMultipleShapes(e)
      }
      
      this.isBoxSelecting = false
      this.redrawShapes()
    });

    this.canvas.addEventListener('dblclick', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      var elem = this.startArc(e.offsetX, e.offsetY);
      if(elem != null) {
        if(this.arc == null) {
          // Start arc
          this.arc = new Arc(this.ctx, elem, elem)
        }
        
        if( this.arc != null)
          if((this.arc.startShape instanceof Circle && elem instanceof Rectangle ) || 
            (this.arc.startShape instanceof Rectangle && elem instanceof Circle )) {
            // End arc
            this.arc.endShape = elem
            // So we can delete them if we delete the nodes
            this.arc.startShape.arcs.push(this.arc)
            this.arc.endShape.arcs.push(this.arc)
            this.shapes.push(this.arc)
            this.arc = null
          } 
      }
      this.redrawShapes()
    });
  
  }
  deleteAllChildren() {
    const container = document.getElementById('property-editor');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  getShapeWithID(id) {
    var shape = this.shapes.filter(shape => shape.id == id);
    return shape[0]
  }


  addPropertyField(elem) {
    if(elem == null) {
      return
    }
    this.deleteAllChildren()

    if(elem instanceof Circle) {
      addCircleProperties(this, elem)
    }
    
    if(elem instanceof Rectangle) {
      addRectangleProperties(this, elem)
    }
  }


  deleteShapeInternal(index) {
    if(index != -1) {

      var elemToDel = this.shapes[index]
      // Remoev shape
      this.shapes.splice(index, 1);
      if (elemToDel instanceof Circle || elemToDel instanceof Rectangle) {
        // DELETE ARROW CODE
        // Get new indices of arrows 
        var arcIds = elemToDel.arcs.map( (e) => e.id)
        var arcIndices = []
        arcIds.forEach( id => {
          arcIndices.push(this.shapes.findIndex((e) => e.id == id))
        });
        arcIndices.sort((a, b) => b - a);


        arcIndices.forEach(index => {
            this.shapes.splice(index, 1);
        });
        // END OF DELETE ARROW CODE
      } else if (elemToDel instanceof Arc) {
        // We need to remove the arc refs from the connected shapes
        var start = elemToDel.startShape
        var end = elemToDel.endShape
        var idOfArc = elemToDel.id
        var indexInStart = start.arcs.findIndex(elem => idOfArc == elem.id)
        var indexInEnd = end.arcs.findIndex(elem => idOfArc == elem.id)

        start.arcs.splice(indexInStart)
        end.arcs.splice(indexInStart)
      }
    }
  }

  deleteShape(e) {
    if(this.lastSelectedElem != null) {
      var index = this.shapes.findIndex(elem => this.lastSelectedElem.id == elem.id)
      if(index != -1) {
        this.deleteShapeInternal(index)
      }
    }
    this.redrawShapes()
  }


  addNewShape(e) {
    if (!this.isIntersectingShape(e.offsetX, e.offsetY)) {
      this.currentShape({x: e.offsetX, y: e.offsetY})
    }
    this.redrawShapes()
  }

  redrawShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
    for (const shape of this.shapes) {
      shape.draw()
    }
  }
  
  isIntersectingShape(x, y) {
    var collision = false
    for (const shape of this.shapes) {
      if (shape instanceof Rectangle) {
        if (x >= shape.x && x <= shape.x + shape.width && 
          y >= shape.y && y <= shape.y + shape.height) {
          collision = true;
        } 
      } else if (shape instanceof Circle) {
          const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
          if (distance <= shape.radius) {
              collision = true;
          } 
      } else if (shape instanceof Arc) {
        var startXY = [shape.startShape.x, shape.startShape.y]
        var endXY = [shape.endShape.x, shape.endShape.y]
        
        var dir = [endXY[0] - startXY[0], endXY[1] - startXY[1]]

        let t = ((x - startXY[0]) * dir[0] + (y - startXY[1]) * dir[1]) / (dir[0] * dir[0]+ dir[1] * dir[1]);
        var check2 = [startXY[0] + dir[0]*t,  startXY[1] + dir[1]*t]
    
        let distance = Math.sqrt((x - check2[0]) ** 2 + (y - check2[1]) ** 2);
        
        if (distance < 10 && t < 1  && t > 0) {
          collision = true;
        }
      }
    }
    return collision
  }


  selectElement(x, y) {
    var shape = null
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
          this.lastSelectedElem = shape
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
          this.lastSelectedElem = shape
          this.selectedElem.fillColor = "red";
          return this.selectedElem
        } //else {
            //shape.isSelected = false
        //}
      } else if (shape instanceof Arc) {
          if (this.selectedElem != null) {
            this.selectedElem.fillColor = "pink";
          }
        var startXY = [shape.startShape.x, shape.startShape.y]
        var endXY = [shape.endShape.x, shape.endShape.y]
        
        var dir = [endXY[0] - startXY[0], endXY[1] - startXY[1]]

        let t = ((x - startXY[0]) * dir[0] + (y - startXY[1]) * dir[1]) / (dir[0] * dir[0]+ dir[1] * dir[1]);
        console.log(t)
        var check2 = [startXY[0] + dir[0]*t,  startXY[1] + dir[1]*t]
        
        // DEbug intersection point
        //if(check2[0] > startXY[0] && check2[0] <= endXY[0]) {
        //  //this.shapes.push(new Circle(this.ctx, check2[0], check2[1], "green"))
        //}
    
        let distance = Math.sqrt((x - check2[0]) ** 2 + (y - check2[1]) ** 2);
        
        if (distance < 10 && t < 1  && t > 0) {
          this.selectedElem = shape
          this.lastSelectedElem = shape
          this.selectedElem.fillColor = "red";
          return this.selectedElem
        }
      }
    }
    this.selectedElem = null
    return null
  }


  selectMultipleShapes(e) {
    var shape = null
    this.selectedElements = []
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      shape = this.shapes[i]
      if (this.boxStartX <= shape.x && shape.x <= e.offsetX && 
        this.boxStartY <= shape.y && shape.y < e.offsetY)  {
        this.selectedElements.push(shape)
        shape.fillColor = "red"
      } else {
        shape.fillColor = "blue"
      }
    }
  }

  startArc(x, y) {
    var shape = null
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      shape = this.shapes[i]
      if (shape instanceof Rectangle) {
        if (x >= shape.x && x <= shape.x + shape.width && 
          y >= shape.y && y <= shape.y + shape.height) {
          return shape
        }
      } else if (shape instanceof Circle) {
        const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
        if (distance <= shape.radius) {
          return shape
        } 
      } 
    }
    return null
  }
}




export class Shape {
  static idCounter = 0
  constructor(ctx, x, y, fillColor = "blue") {
    this.id = Shape.idCounter++
    this.ctx = ctx
    this.x = x;
    this.y = y; 
    this.fillColor = fillColor
    // Used in removal and moving of nodes
    this.isSelected = false
    this.arcStart = false
    this.arcEnd = false
    this.arcs = []
  }
  getBoundingBox() {} 
  draw(e, x, y) {}     
}

export class Circle extends Shape{
  constructor(ctx, x, y, fillColor = "blue") {
    super(ctx, x, y, fillColor);
    this.radius = 10;
  }
  draw(debug = false) {
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
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = 'red'; // Text c
    this.ctx.fillText(this.id, this.x, this.y);

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
  constructor(ctx, x, y, width = 20, height = 50,fillColor = "blue") {
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
  constructor(ctx, start, end, fillColor = "blue") {
    super(ctx, start.x, start.y, fillColor);
    this.startShape = start
    this.endShape = end 
  }

  draw(e) {
    var arrowSize = 10;
    this.ctx.strokeStyle = this.fillColor;
    this.ctx.beginPath();
    this.ctx.moveTo(this.startShape.x, this.startShape.y);
    this.ctx.lineTo(this.endShape.x, this.endShape.y, );
    this.ctx.stroke();

    // Calculate angle of the line
    const angle = Math.atan2(this.endShape.y- this.startShape.y, this.endShape.x- this.startShape.x);

    // Draw the arrowhead
    this.ctx.save();
    this.ctx.translate(this.endShape.x, this.endShape.y);
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


const response = await window.electron.ping()
console.log(response)
