import {addCircleProperties, addRectangleProperties, addArcProperties}  from './propertyEditor.js';
import { STATES, StateMachine} from './stateMachine.js';
import { TokenHistoryEntry, TokenHistory } from './utils.js';




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
    
    this.zeroPlacesHidden == false
    this.history = new TokenHistory()

    this.viewportTransform = {
      x: 0,
      y: 0,
      scale: 1
    }
    


    this.previousX = 0
    this.previousY = 0
    //console.log(this.canvas.width)
    //console.log(this.canvas.height)

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


    // Reenable to fix update 
    // need to trasnform all the x,y coordinates before this works 
    // properly
    //canvas.addEventListener("wheel", (e) => {
    //  this.updateZooming(e)
    //  this.redrawShapes()
  
    //});

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseMoved = true
      //console.log(this.mouseMoved)
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
      //console.log(`Mousedown called with state ${this.sm.state}`)
      this.previousX = e.clientX;
      this.previousY = e.clientY;
      e.preventDefault();

      if(this.sm.state == STATES.ARC_STARTED) {
        var elem = this.selectElement(e.offsetX - this.viewportTransform.x, e.offsetY - this.viewportTransform.y);
        if(elem == null) {
          return this.cancelArc()
        } else {
          var startID = this.lookUpByID(this.arc.startID)
          this.print(startID)
          return this.createArc(elem)
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
      //console.log(`Mousedown left with state ${this.sm.state}`)
    });

    this.canvas.addEventListener('mouseup', (e) => {
      //console.log("Mouseup movestats: ", this.mouseMoved)
      //console.log(`Mouseup called with state ${this.sm.state}`)

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
          this.mouseMoved = false
        }
      }
      this.sm.state = STATES.NOTHING_SELECTED
      this.redrawShapes()
      //console.log(`Mouseup left with state ${this.sm.state}`)
    });


    window.electron.hideZeroPlaces(() => {
      this.hideZeroPlaces()
    })

    window.electron.getTokenHistory(() => {
      this.getTokenHistory()
    })

    this.canvas.addEventListener('dblclick', (e) => {
      //console.log(`dblClick called with state ${this.sm.state}`)
      var elem = this.startArc(e.offsetX - this.viewportTransform.x, e.offsetY - this.viewportTransform.y);
      //console.log(`Element of arc start`)
      //console.log(elem)
      if (elem == null) {
        return this.cancelArc()
      }
      if(elem != null) {
        if(this.sm.state != STATES.ARC_STARTED) {
          this.arc = new Arc(this, elem.id, elem.id)
          elem.fillColor = "yellow"
          console.log(`Started arc from element with id ${elem.id}`)
          this.sm.state = STATES.ARC_STARTED
        } else {
          this.createArc(elem)
        }
        this.redrawShapes()
      }
    });
  
  }

  hideZeroPlaces() {
    this.zeroPlacesHidden = !this.zeroPlacesHidden
    if(this.zeroPlacesHidden) {
      for(var s of this.shapes) {
        if(s.tokens == 0) {
          s.hide = true
        }
      }
    } else {
      for(var s of this.shapes) {
        if(s.tokens == 0) {
          s.hide = false
        }
      }
    }
    this.redrawShapes()
  }

  print(obj) {
  return console.log(JSON.parse(this.serialize(obj)))
  }


  deepCopy(obj) {
  return JSON.parse(this.serialize(obj))
  }

  cancelArc() {
    var startShape = this.lookUpByID(this.arc.startID)
    startShape.fillColor = "blue"
    this.arc = null
    this.sm.state = STATES.NOTHING_SELECTED
    console.log("Arc aborted")
    this.redrawShapes()
  } 

  createArc(elem) {
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
    } 
  }
  
  updatePanning(e) {
    // Adapted from  https://harrisonmilbradt.com/articles/canvas-panning-and-zooming
    const localX = e.clientX;
    const localY = e.clientY;
  
    this.viewportTransform.x += localX - this.previousX;
    this.viewportTransform.y += localY - this.previousY;
  
    this.previousX = localX;
    this.previousY = localY;
  }

  getClickCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {x: x, y };
  }

  
  updateZooming(e) {
    // Adapted from https://harrisonmilbradt.com/articles/canvas-panning-and-zooming
   let oldX = this.viewportTransform.x;
   let oldY = this.viewportTransform.y;

   const localX = e.clientX;
   const localY = e.clientY;

   const previousScale = this.viewportTransform.scale;
   

   var newScale = this.viewportTransform.scale += e.deltaY * -0.001;
   newScale = Math.min(newScale, 2)
   newScale = Math.max( newScale, 0.6)
   const newX = localX - (localX - oldX) * (newScale / previousScale);
   const newY = localY - (localY - oldY) * (newScale / previousScale);

   this.viewportTransform.x = newX;
   this.viewportTransform.y = newY;
   this.viewportTransform.scale = newScale;
  } 

  shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
  }

  // Executes all places in a random order
  simulateNonDeterministic () {
    //const indices = this.shapes.map((_, index) => index);
    //this.shuffleArray(indices)
    //this.print(indices)
    //for(var i of indices) {
    //  // this.print("index")
    //  // this.print(i)
    //  var s = this.shapes[i]
    //  // Do the actual fireing
    //  if(s instanceof Rectangle) {
    //    var incomingEdges = s.getIncomingEdges()
    //    var outgoingEdges = s.getOutgoingEdges()
    //    var tokens = incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens) 
    //    var minTokenCount = Math.min(...tokens)
    //    // this.print("Rectangle")
    //    // this.print(s.id)
    //    // this.print(tokens)
    //    // this.print(minTokenCount)
    //    // this.print("-------")
    //    if(minTokenCount > 0) {
    //      incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens -= obj.edgeWeight)
    //      outgoingEdges.map(obj => this.lookUpByID(obj.endID).tokens += obj.edgeWeight)
    //    }
    //  }
    //}
    //this.redrawShapes()
  }

  
  simulateNonDeterministic2 () {
    //for(var i in this.shapes) {
    //  var s = this.shapes[i]
    //  // Do the actual fireing
    //  if(s instanceof Rectangle) {
    //    var incomingEdges = s.getIncomingEdges()
    //    var outgoingEdges = s.getOutgoingEdges()
    //    
    //    var tokensInc = incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens) 
    //    var tokensOut = outgoingEdges.map(obj => this.lookUpByID(obj.endID).tokens) 
    //    var minTokenCount = Math.min(...tokensInc)
    //    var maxTokenCount = Math.max(...tokensOut)
    //  // this.print(minTokenCount)
    //    // this.print(maxTokenCount)
    //    if(minTokenCount >= maxTokenCount && minTokenCount > 0) {
    //      incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens -= obj.edgeWeight)
    //      outgoingEdges.map(obj => this.lookUpByID(obj.endID).tokens += obj.edgeWeight)
    //    }
    //  }
    //}
    //this.redrawShapes()
  }
  // Execute one single random transition
  simulateNonDeterministic3 () {
    // Do the actual fireing
    //var s = null
    //var i = 0
    //console.log("START")
    //do {
    //  var i = Math.floor(Math.random() * (this.shapes.length + 1))
    //  s = this.shapes[i]
    //} while(!(s instanceof Rectangle))
    //console.log(s)
    //var incomingEdges = s.getIncomingEdges()
    //var outgoingEdges = s.getOutgoingEdges()
    //
    //var tokensInc = incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens) 
    //var tokensOut = outgoingEdges.map(obj => this.lookUpByID(obj.endID).tokens) 
    //var minTokenCount = Math.min(...tokensInc)
    //var maxTokenCount = Math.max(...tokensOut)
    //// this.print(minTokenCount)
    //// this.print(maxTokenCount)
    //if(minTokenCount >= maxTokenCount && minTokenCount > 0) {
    //  incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens -= obj.edgeWeight)
    //  outgoingEdges.map(obj => this.lookUpByID(obj.endID).tokens += obj.edgeWeight)
    //} 
  }

  simulateNonDeterministic4 () {
    // Do the actual fireing
    var s = null
    var i = 0
    do {
      var i = Math.floor(Math.random() * (this.shapes.length + 1))
      s = this.shapes[i]
    } while(!(s instanceof Rectangle))
    var incomingEdges = s.getIncomingEdges()
    var outgoingEdges = s.getOutgoingEdges()
    
    var tokensInc = incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens) 
    var minTokenCount = Math.min(...tokensInc)
    // this.print(minTokenCount)
    // this.print(maxTokenCount)
    if(minTokenCount >= 1) {
      incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens -= obj.edgeWeight)
      outgoingEdges.map(obj => this.lookUpByID(obj.endID).tokens += obj.edgeWeight)
    } 
  }

  getTokenHistory() {
    try {
      // TODO This deepcopy is not necessary
      let start = performance.now();
      var copy = this.history
      let end = performance.now();
      let duration = end - start;
      console.log(`Time taken: ${duration} milliseconds`);

      start = performance.now();
      window.electron.sendHistoryData('sendHistoryData', copy);
      end = performance.now();
      duration = end - start;
      console.log(`Send time taken: ${duration} milliseconds`);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  saveTokenCount(iteration) {
    var shapesToAdd =  this.deepCopy(this.shapes.filter(obj => obj instanceof Circle))
    this.history.add(new TokenHistoryEntry(iteration, shapesToAdd))
  }


  simulateEndles() {
    console.log("START!")
    var old_tokens = []
    var new_tokens = []
    var counter = 0
    var cap = 0
    var lastIterationStop = 0
    if(this.history.length > 0) {
      lastIterationStop = this.history[this.history.length - 1].iteration
    }

    while(counter < 10 && cap < 10000) {
      // Token count before simulation
      old_tokens = this.shapes.map(obj => obj.tokens)
      this.saveTokenCount(lastIterationStop + cap, old_tokens)
      this.simulateNonDeterministic4()
      // Token count after simulation
      new_tokens = this.shapes.map(obj => obj.tokens) 
      //console.log(old_tokens)
      //console.log(new_tokens)
      //console.log(cap)
      // If they are the same, nothing changed
      // if that happens multiple times we are in a steady state
      if(old_tokens == new_tokens) {
        counter += 1
      } 
      cap += 1
    }
    // Save the last state
    this.saveTokenCount(lastIterationStop + cap, new_tokens)
  }

  simulateN() {
    console.log("START!")
    var old_tokens = []
    var new_tokens = []
    var counter = 0
    var cap = 0
    while( cap < 10) {
      // Token count before simulation
      old_tokens = this.shapes.map(obj => obj.tokens)
      this.simulateNonDeterministic4()
      // Token count after simulation
      new_tokens = this.shapes.map(obj => obj.tokens) 
      cap += 1
    }
    this.redrawShapes()
  }


  simulateSpecific() {
    var index = [9, 15]
    var sh = this.shapes.filter(shape => index.includes(shape.id))
    for (var s of sh) {
      //var s = this.shapes[i]
      console.log(s.id)
      var incomingEdges = s.getIncomingEdges()
      var outgoingEdges = s.getOutgoingEdges()
      
      var tokensInc = incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens) 
      var minTokenCount = Math.min(...tokensInc)
      // this.print(minTokenCount)
      // this.print(maxTokenCount)
      if(minTokenCount >= 1) {
        incomingEdges.map(obj => this.lookUpByID(obj.startID).tokens -= obj.edgeWeight)
        outgoingEdges.map(obj => this.lookUpByID(obj.endID).tokens += obj.edgeWeight)
      } 
    }
  }

  simulate() {
    this.print(this.shapes)
    console.log("++++++++++++++++++++++")
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
          if(connectedArc.startID == s.id) {
            //this.print("K")
            //this.print(s.getOutgoingEdges().length)
            //if(s.getOutgoingEdges().length > 1) {
            //  // Image have a circle with two outgoing edges that each consume 
            //  // 1 token and we start with 3 tokens in the circle. What happens after
            //  // two steps? We either stop wuth one token after one step or we randomly
            //  // pick one of the ougoing edges to put the last token ito
            //  // But this is only necessary if the min of incoming tokens is smaller the the 
            //  // amount of outgoing edges.
            //  this.print("DWDN")
            //  var incomingEdges = s.getIncomingEdges()
            //  for(var edge of incomingEdges) {
            //    var startCircleID = edge.startID
            //    var startCircle = this.lookUpByID(startCircleID)
            //    this.print("DWD")
            //    this.print(startCircle)
            //  }
            //}
            s.canFire = true
          } else {
            //INCOMING EDGE
            var endObj = this.lookUpByID(connectedArc.endID)
            if(startObj.tokens == 0 /*&& endObj.id == s.id*/) {
              s.canFire = false
              break
            }
          }
        }
      }
    }
    this.print(this.shapes)
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
            // TODO REPEAT THE TOKEN CHECK
            startObj.tokens -= 1
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
            sh.label = shape.label
            this.shapes.push(sh)
            break
          }
          case "Rectangle": {
            var sh = new Rectangle(this, shape.x, shape.y, shape.width, shape.height, shape.fillColor)
            sh.id = shape.id
            sh.arcStart = shape.arcStart
            sh.canFire = shape.canFire
            sh.arcEnd  = shape.arcEnd
            sh.arcIDS = shape.arcIDS
            sh.label = shape.label
            this.shapes.push(sh)
            break
          }
          case "Arc": {
            var sh = new Arc(this, shape.startID, shape.endID, shape.fillColor)
            sh.id = shape.id
            sh.label = shape.label
            sh.edgeWeight = shape.edgeWeight ? shape.edgeWeight : 1
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
    this.print(this.shapes)
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
    if(elem instanceof Arc) {
      addArcProperties(this, elem)
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
      this.currentShape(this.transform({x : e.offsetX, y: e.offsetY}))
    }
    this.redrawShapes()
  }

  transform({x, y}) {
    return {
        x: ((x - this.viewportTransform.x) / this.viewportTransform.scale),
        y: ((y - this.viewportTransform.y) / this.viewportTransform.scale)
      }
  }
  redrawShapes() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(1, 0, 0, 1, this.viewportTransform.x, this.viewportTransform.y);
    
    this.ctx.scale(this.viewportTransform.scale, this.viewportTransform.scale)
    
   
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
        
        if (distance < 5 && t < 1  && t > 0) {
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
    this.label = ""
    this.fillColor = fillColor
    // Used in removal and moving of nodes
    this.isSelected = false
    this.arcStart = false
    this.arcEnd = false
    this.arcIDS = []

    this.hidden = false
    
    // For rects and circles this is the current amount
    // For arc in is the throughput


  }
  getBoundingBox() {} 

  getIncomingEdges() {
    var incomingEdges = []
    for(var arcID of this.arcIDS) {
      var arc = this.$canvas.lookUpByID(arcID)
      if(arc.endID == this.id) {
        incomingEdges.push(arc)
      }
    }
    return incomingEdges
  }
  getOutgoingEdges() {
    var outgoingEdges = []
    for(var arcID of this.arcIDS) {
      var arc = this.$canvas.lookUpByID(arcID)
      if(arc.startID == this.id) {
        outgoingEdges.push(arc)
      }
    }
    return outgoingEdges
  }

  draw() {

    const textMetrics = this.$ctx.measureText(this.label);
    const textWidth = textMetrics.width;

    this.$ctx.font = '20px Arial';
    this.$ctx.fillStyle = 'blue';
    this.$ctx.fillText(this.label, this.x-textWidth/2, this.y - 15);
  }     

}

export class Circle extends Shape{
  constructor(ctx, x, y, fillColor = "blue") {
    super(ctx, x, y, fillColor);
    this.radius = 10;
    this.type = "Circle"

    this.tokens = 0
  }
  draw(debug = true) {
    super.draw()
    if (!this.hide) {
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
    super.draw(e)
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
    this.edgeWeight = 1
  }

  draw(e) {
    var arrowSize = 10;
    this.$ctx.strokeStyle = this.fillColor;
    let startShape = this.$canvas.lookUpByID(this.startID)
    let endShape = this.$canvas.lookUpByID(this.endID)


    
    if (startShape.x <= endShape.x) {
      const controlPoint = {
          x: (startShape.x + endShape.x) / 2,
          y: ((startShape.y + endShape.y) / 2) - 20
      };
      this.$ctx.moveTo(startShape.x, startShape.y);
      this.$ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endShape.x, endShape.y);
    } else {
      const controlPoint = {
          x: (startShape.x + endShape.x) / 2,
          y: ((startShape.y + endShape.y) / 2) + 20
      }
      this.$ctx.moveTo(endShape.x, endShape.y);
      this.$ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, startShape.x, startShape.y);
    } 


    //this.$ctx.lineTo(endShape.x, endShape.y, );
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
