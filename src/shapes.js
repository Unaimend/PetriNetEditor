import {addCircleProperties, addRectangleProperties}  from './propertyEditor.js';
import { STATES, StateMachine} from './stateMachine.js';

export class Canvas {
  constructor(canvas) {
    this.idCounter = 0
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
    this.shapes = []
    this.shapeCreator = {
            circle: (pos) => { this.shapes.push(new Circle(this, pos.x, pos.y)) },
            rectangle: (pos) => this.shapes.push(new Rectangle(this, pos.x, pos.y))
    }
    this.currentShape = this.shapeCreator["circle"]
    this.shapes = []; // Array to store drawn shapes
    this.selectedElem = null
    this.lastSelectedElem = null
    this.arc = null
    this.sm = new StateMachine()
    

    this.viewportTransform = {
      x: 0,
      y: 0,
      scale: 1
    }
    


    this.previousX = 0
    this.previousY = 0
    console.log(this.canvas.width)
    console.log(this.canvas.height)

    //https://observablehq.com/plot/getting-started Add d3 stuff to the canvas
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
    this.mouseMoved = false


    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseMoved = true
      console.log(this.mouseMoved)
      //console.log(`Mouse move called with state ${this.sm.state}`)
      if (this.sm.state == STATES.IS_DRAGGING) {
        if (this.selectedElem != null) {
          this.selectedElem.x = e.offsetX - this.viewportTransform.x
          this.selectedElem.y = e.offsetY - this.viewportTransform.y
          this.addPropertyField(this.selectedElem)
        } 
      }
      if (this.sm.state == STATES.IS_PANNING) {
        this.updatePanning(e)
      }
      
      // This REALLY kills performace
      this.redrawShapes()
      if (this.isBoxSelecting) {
        this.ctx.strokeRect(this.boxStartX, this.boxStartY, e.offsetX - this.boxStartX, e.offsetY - this.boxStartY);
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseMoved = false
      console.log(`Mousedown called with state ${this.sm.state}`)
      this.previousX = e.clientX;
      this.previousY = e.clientY;
      e.preventDefault();

      if(this.sm.state == STATES.ARC_STARTED) {
        var elem = this.selectElement(e.offsetX - this.viewportTransform.x, e.offsetY - this.viewportTransform.y);
        if(elem == null) {
          var startShape = this.lookUpByID(this.arc.startID)
          startShape.fillColor = "blue"
          this.arc = null
          this.sm.state = STATES.NOTHING_SELECTED
          console.log("Arc aborted")
          this.redrawShapes()
          return
        } 
      }
      
      if (this.boxSelectMode == true) {
        this.isBoxSelecting = true;
        this.boxStartX = e.offsetX
        this.boxStartY = e.offsetY
      }
      var elem = this.selectElement(e.offsetX - this.viewportTransform.x, e.offsetY - this.viewportTransform.y);
      //console.log(`Selected ${elem}`)
      if(elem == null) {
        this.sm.state = STATES.IS_PANNING
      } else {
        this.sm.state = STATES.IS_DRAGGING
      } 
      this.addPropertyField(elem)
      this.redrawShapes()
      console.log(`Mousedown left with state ${this.sm.state}`)
    });

    this.canvas.addEventListener('mouseup', (e) => {
      //console.log("Mouseup movestats: ", this.mouseMoved)
      console.log(`Mouseup called with state ${this.sm.state}`)

      e.preventDefault();
      if (this.selectedElem != null) {
        this.selectedElem.fillColor = "blue";
        this.selectedElem = null
      }
      if(this.isBoxSelecting) {
        this.selectMultipleShapes(e)
      }
      
      this.isBoxSelecting = false

      if (this.mouseMoved == false) {
        if(this.boxSelectMode == false) {
          this.addNewShape(e)
          this.sm.state = STATES.NOTHING_SELECTED
        }
      }
      //var elem = this.selectElement(e.offsetX - this.viewportTransform.x, e.offsetY - this.viewportTransform.y);
      //if (elem == null) {
      //  this.sm.state = STATES.NOTHING_SELECTED
      //}
      this.redrawShapes()
      console.log(`Mouseup left with state ${this.sm.state}`)
    });

    //this.canvas.addEventListener('click', (e) => {
    //  //console.log(`Click called with state ${this.sm.state}`)
    //  this.redrawShapes()
    //});

    this.canvas.addEventListener('dblclick', (e) => {
      console.log(`dblClick called with state ${this.sm.state}`)
      var elem = this.startArc(e.offsetX - this.viewportTransform.x, e.offsetY - this.viewportTransform.y);
      console.log(`Element of arc start`)
      console.log(elem)
      if (elem == null) {
        // Get tje start shape from the current arc and reset its color
        var startShape = this.lookUpByID(this.arc.startID)
        startShape.fillColor = "blue"
        this.arc = null 
        this.sm.state = STATES.NOTHING_SELECTED
        console.log("Arc aborted")
        this.redrawShapes()
      }
      if(elem != null) {
        if(this.sm.state != STATES.ARC_STARTED && this.arc == null) {
          this.arc = new Arc(this, elem.id, elem.id)
          elem.fillColor = "yellow"
          console.log(`Started arc from element with id ${elem.id}`)
          this.sm.state = STATES.ARC_STARTED
        } else {
          var startShape = this.lookUpByID(this.arc.startID)
          // If start is a rectnagle we are only allowed to connect to a Rectangle 
          // and the other way around
          if((startShape instanceof Circle && elem instanceof Rectangle ) || 
            (startShape instanceof Rectangle && elem instanceof Circle )) {
            console.log(`Started arc from element with id ${startShape.id} to ${elem.id}`)
            // End arc
            this.arc.endID = elem.id
            // So we can delete them if we delete the nodes
            startShape.arcStart = true
            startShape.fillColor = "blue"
            elem.arcEnd = true
            startShape.arcIDS.push(this.arc.id)
            elem.arcIDS.push(this.arc.id)
            this.shapes.push(this.arc)
            this.arc = null
            this.sm.state = STATES.NOTHING_SELECTED
          } 
        }
        this.redrawShapes()
      }
    });
  
  }

  print(obj) {
  return console.log(JSON.parse(this.serialize(obj)))
  }
  
  updatePanning(e) {
    const localX = e.clientX;
    const localY = e.clientY;
  
    this.viewportTransform.x += localX - this.previousX;
    this.viewportTransform.y += localY - this.previousY;
  
    this.previousX = localX;
    this.previousY = localY;
  }

  simulate() {
    console.log("HEY")
    for(var s of this.shapes) {
      // Go through all Rechtangles and check if they are able to fire.
      // We have to do this before doing the fireing because of we would change the
      // tokens immediatly the result would depend on the order iteration
      if(s instanceof Rectangle) {
        for(var connectedArcsID of s.arcIDS) {
          var connectedArc = this.lookUpByID(connectedArcsID)
          // Get the start object of the arc and check its token amount
          var startObj = this.lookUpByID(connectedArc.startID)
          var endObj = this.lookUpByID(connectedArc.endID)
          // I incoming arc (end id = myself.id has no token left)
          //  TODO This conditions fails in simple_tokens2.json with an uneven amount of startToken
          if(startObj.tokens == 0 /*&& endObj.id == s.id*/) {
            s.canFire = false
            break
          }
          s.canFire = true
        }
      }
    }
    console.log("---------------------")
    for(var i in this.shapes) {
      var s = this.shapes[i]
      // Do the actual fireing
      if(s instanceof Rectangle) {
        if(s.canFire === true) {
          for(var connectedArcsID of s.arcIDS) {
            var connectedArc = this.lookUpByID(connectedArcsID)
            // Get the start object of the arc and check its token amount
            var startObj = this.lookUpByID(connectedArc.startID)
            var endObj = this.lookUpByID(connectedArc.endID)
              startObj.tokens -= 1
              // Todo One Input two output would create tokens out of nothing
              endObj.tokens += 1
              s.canFire = false
            }
          }
      }
    }
    this.redrawShapes()
  }

  lookUpByID(id) {
    return this.shapes[this.shapes.findIndex((e) => e.id == id)]
  }

  serialize (x) {
  return JSON.stringify(x, function(k, v) {
    if (!k.startsWith("$"))
      return v;
    });
  }

  save () {
    try {
      window.electron.save('save', this.serialize({"counter": this.idCounter, "shapes" : this.shapes}));
    } catch (error) {
      console.error('Error:', error);
    }
  }


  
  async load () {
    try {
      this.shapes  = []
      var content = await window.electron.load()
      var c = JSON.parse(content)
      var s = c["shapes"]
      for(var i in s) {
        var shape = s[i]
        switch(shape.type) {
          case "Circle": {
            var sh = new Circle(this, shape.x, shape.y, shape.fillColor)
            sh.id = shape.id
            sh.arcStart = shape.arcStart
            sh.arcEnd  = shape.arcEnd
            sh.arcIDS = shape.arcIDS
            sh.tokens = shape.tokens
            this.shapes.push(sh)
            break
          }
          case "Rectangle": {
            var sh = new Rectangle(this, shape.x, shape.y, shape.width, shape.height, shape.fillColor)
            sh.id = shape.id
            sh.arcStart = shape.arcStart
            sh.arcEnd  = shape.arcEnd
            sh.arcIDS = shape.arcIDS
            sh.tokens = shape.tokens
            this.shapes.push(sh)
            break
          }
          case "Arc": {
            var sh = new Arc(this, shape.startID, shape.endID, shape.fillColor)
            sh.id = shape.id
            sh.tokens = shape.tokens
            this.shapes.push(sh)
            break
          }
          default: {
            console.log("Should not happen")
          }
        }
      }
      this.idCounter = c["counter"]
      this.redrawShapes()
    } catch (error) {
        console.error('Error:', error);
    }
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
    console.log("Deletion called")
    if(index != -1) {
      console.log("Deletion index valid")
      var elemToDel = this.shapes[index]
      // Remoev shape
      this.shapes.splice(index, 1);
      if (elemToDel instanceof Circle || elemToDel instanceof Rectangle) {
        console.log("Deleting Circle or Rectangle")
        // DELETE ARROW CODE
        // Get new indices of arrows 
        var arcIds = elemToDel.arcIDS
        var arcIndices = []
        // TODO Add Circle then Rect then Arc, delete Rect -> Arc still in Circle
        // TODO Add circle and two rects then add arc sth like that 
        arcIds.forEach( id => {
          arcIndices.push(this.shapes.findIndex((e) => e.id == id))
        });
        arcIndices.sort((a, b) => b - a);

        arcIndices.forEach(index => {
            this.shapes.splice(index, 1);
        });

        // If we are still in this state and we end up deleting we
        // deleted the start shape of the arc
        if(this.sm.state == STATES.ARC_STARTED) {
          this.arc = null
          this.sm.state = STATES.NOTHING_SELECTED
          console.log("Deleted Arc start")
        }
        // END OF DELETE ARROW CODE
      } else if (elemToDel instanceof Arc) {
        // We need to remove the arc refs from the connected shapes
        var start = this.lookUpByID(elemToDel.startID)
        start.arcStart = false
        var end = this.lookUpByID(elemToDel.endID)
        end.arcStart = false
        var idOfArc = elemToDel.id
        var indexInStart = start.arcIDS.findIndex(elem => idOfArc == elem.id)
        var indexInEnd = end.arcIDS.findIndex(elem => idOfArc == elem.id)

        start.arcIDS.splice(indexInStart)
        end.arcIDS.splice(indexInEnd)
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
    if (!this.isIntersectingShape(e.offsetX - this.viewportTransform.x, e.offsetY-this.viewportTransform.y)) {
      this.currentShape({x: e.offsetX - this.viewportTransform.x, y: e.offsetY-this.viewportTransform.y})
    }
    this.redrawShapes()
  }

  redrawShapes() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, 500, 500);
    this.ctx.setTransform(this.viewportTransform.scale, 0, 0, this.viewportTransform.scale, this.viewportTransform.x, this.viewportTransform.y);
    
   
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
        
        var startShape = this.lookUpByID(shape.startID)
        var endShape = this.lookUpByID(shape.endID)
        var startXY = [startShape.x, startShape.y]
        var endXY = [endShape.x, endShape.y]
        
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
        var startShape = this.lookUpByID(shape.startID)
        var endShape = this.lookUpByID(shape.endID)
        var startXY = [startShape.x, startShape.y]
        var endXY = [endShape.x, endShape.y]
        
        var dir = [endXY[0] - startXY[0], endXY[1] - startXY[1]]

        let t = ((x - startXY[0]) * dir[0] + (y - startXY[1]) * dir[1]) / (dir[0] * dir[0]+ dir[1] * dir[1]);
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
  constructor(canvas, x, y, fillColor = "blue") {
    this.id = canvas.idCounter++
    this.$canvas = canvas
    this.$ctx = canvas.ctx 
    this.x = x;
    this.y = y; 
    this.fillColor = fillColor
    // Used in removal and moving of nodes
    this.isSelected = false
    this.arcStart = false
    this.arcEnd = false
    this.arcIDS = []
    
    // For rects and circles this is the current amount
    // For arc in is the throughput
    this.tokens = 1
  }
  getBoundingBox() {} 
  draw(e, x, y) {}     

}

export class Circle extends Shape{
  constructor(ctx, x, y, fillColor = "blue") {
    super(ctx, x, y, fillColor);
    this.radius = 10;
    this.type = "Circle"
  }
  draw(debug = true) {
    this.$ctx.beginPath();
    this.$ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.$ctx.fillStyle = this.fillColor;

    if(debug == true) {
        var bb = this.getBoundingBox()       
        //this.$ctx.fillStyle = "pink";
        this.$ctx.strokeRect(...Object.values(bb));
        this.$ctx.stroke();
    }
    this.$ctx.fill();
    this.$ctx.closePath();
    this.$ctx.font = '20px Arial';
    this.$ctx.fillStyle = 'red'; // Text c
    this.$ctx.fillText(this.tokens, this.x, this.y);

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
  constructor(canvas, x, y, width = 20, height = 50,fillColor = "blue") {
    super(canvas, x, y, fillColor);
    this.width = width;
    this.height = height;
    this.type = "Rectangle"
    this.canFire = false
  }

  draw(e) {
    this.$ctx.beginPath();
    this.$ctx.fillStyle = this.fillColor;
    this.$ctx.fillRect(this.x, this.y, this.width, this.height);
    this.$ctx.fillStyle = "black";
    this.$ctx.strokeRect(this.x, this.y, this.width, this.height);
    this.$ctx.stroke();

    this.$ctx.fillStyle = "green";
  }


  getBoundingBox() {
    const topLeftX = this.x; 
    const topLeftY = this.y;
    const width = this.width
    const height = this.width

    return {
      x: topLeftX,
      y: topLeftY,
    };
  }
}



export class Arc extends Shape {
  constructor(canvas, start, end, fillColor = "blue") {
    super(canvas, start.x, start.y, fillColor);
    this.startID = start
    this.endID = end 
    this.type = "Arc"
  }

  draw(e) {
    var arrowSize = 10;
    this.$ctx.strokeStyle = this.fillColor;
    let startShape = this.$canvas.lookUpByID(this.startID)
    let endShape = this.$canvas.lookUpByID(this.endID)

    this.$ctx.moveTo(startShape.x, startShape.y);
    this.$ctx.lineTo(endShape.x, endShape.y, );
    this.$ctx.stroke();

    // Calculate angle of the line
    const angle = Math.atan2(endShape.y- startShape.y, endShape.x- startShape.x);

    // Draw the arrowhead
    this.$ctx.save();
    this.$ctx.translate(endShape.x, endShape.y);
    this.$ctx.rotate(angle);

    this.$ctx.beginPath();
    this.$ctx.moveTo(0, 0);
    this.$ctx.lineTo(-arrowSize, arrowSize / 2);
    this.$ctx.lineTo(-arrowSize, -arrowSize / 2);
    this.$ctx.closePath();

    this.$ctx.fill();
    this.$ctx.restore();
  }
}


const response = await window.electron.ping()
