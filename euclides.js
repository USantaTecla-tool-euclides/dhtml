function Coordinate(x=0, y=0){
  this.x = x;
  this.y = y;

  this.shiftH = function(x){
    return new Coordinate(this.x + x, this.y);
  };

  this.shiftV = function(y){
    return new Coordinate(this.x, this.y + y);
  }

  this.shift = function(x, y){
    return this.shiftH(x).shiftV(y);
  }

  this.getWidth = function(coordinate){
    return Math.abs(coordinate.x - this.x);
  };

  this.getHeight = function(coordinate){
    return Math.abs(coordinate.y - this.y);
  };
  
  this.clone = function(){
    return new Coordinate(x, y);
  };

}

function Model(){
  let getRandom = function(min, max){
    return min + Math.round(Math.random() * (max-min));
  };

  let INITIAL_GRID = 50;
  let MAX_WIDTH = 500;
  let MIN_WIDTH = 1;
  let MAX_HEIGHT = 500;
  let MIN_HEIGHT = 1;

  this.gcd2 = function(width, height){
    if (height == 0){
      return width;
    } 
    return this.gcd2(height, width % height);
  }

  this.setRandom = function() {
    let gcd = getRandom(1,100);
    this.width = gcd * getRandom(MIN_WIDTH, MAX_WIDTH / gcd);
    this.height = gcd * getRandom(MIN_HEIGHT, MAX_HEIGHT / gcd);
    this.leftTop = new Coordinate();
    this.rightBottom = this.leftTop.shift(this.width, this.height);
    console.log("RANDOM");
    console.log("Rectangle: " + JSON.stringify(this.rightBottom));
    console.log("Square: " + this.gcd2(this.rightBottom.x, this.rightBottom.y));
    console.log("Times H: " + this.rightBottom.x / gcd);
    console.log("Times V: " + this.rightBottom.y / gcd);
    this.grid = INITIAL_GRID;
  };

  this.width;
  this.height;
  this.leftTop;
  this.rightBottom;
  this.grid;

  this.isUppermostGrid = function(){
    return this.grid == MAX_WIDTH;
  }

  this.isLowestGrid = function(){
    return this.grid == MIN_WIDTH;
  }

  this.getLeftTop = function() {
    return this.leftTop.clone();
  };

  this.incrementGrid = function(){
    this.grid++;
  };

  this.decrementGrid = function(){
    this.grid--;
  }

  this.getTimesH = function(){
    return Math.floor(this.width / this.grid);
  }

  this.getTimesV = function(){
    return Math.floor(this.height / this.grid);
  }
  
}

function View(model){
  this.model = model;
  this.square = document.getElementById("square");
  this.canvas = document.getElementById("canvas");
  this.context = this.canvas.getContext('2d');
  this.FILLED_COLOR = "blue";
  this.BORDER_COLOR = "white";

  this.clear = function(){
    this.canvas.width = this.canvas.width;
  };

  this.drawBorder = function(leftTop, rightBottom){
    this.context.lineWidth = 1;
    this.context.strokeStyle = this.BORDER_COLOR;
    this.context.strokeRect(leftTop.x, leftTop.y, 
      leftTop.getWidth(rightBottom), 
      leftTop.getHeight(rightBottom));
  };

  this.drawFilled = function(leftTop, rightBottom){
    leftTop = leftTop.shift(1, 1);
    rightBottom = rightBottom.shift(-2, -2);
    this.context.beginPath();
    this.context.rect(leftTop.x, leftTop.y, rightBottom.x, rightBottom.y);
    this.context.fillStyle = this.FILLED_COLOR;
    this.context.fill();
  };

  this.drawRectangle = function (leftTop, rightBottom, filled = false, clear = false) {
    if (clear) {
      this.clear();
    }
    this.drawBorder(leftTop, rightBottom);
    if (filled) {
      this.drawFilled(leftTop, rightBottom, filled);
    }
  };

  this.drawArc = function(leftTop, rightBottom){
    this.context.beginPath();
    this.context.arc(leftTop.x, leftTop.y, 
      leftTop.getWidth(rightBottom), 
      0 * Math.PI, 0.5 * Math.PI);
    this.context.stroke();
  };

  this.drawLine = function(leftTop, rightBottom){
    this.context.beginPath();
    this.context.moveTo(leftTop.x, leftTop.y);
    this.context.lineTo(rightBottom.x, rightBottom.y);
    this.context.stroke();
  }

  this.drawSquare = function() {
    this.square.style.width = model.grid + "px";
    this.square.style.height = model.grid + "px";
  };

  this.drawResult = function(gcd){
    let rectangle = "";
    let grid = "";
    let timesH = "";
    let timesV = "";
    if (gcd != undefined){
      rectangle = this.model.rightBottom.x + " x " + this.model.rightBottom.y;
      grid = gcd;
      timesH = this.model.rightBottom.x / grid;
      timesV = this.model.rightBottom.y / grid;
    }
    document.getElementById("rectangle").innerHTML = rectangle;
    document.getElementById("grid").innerHTML = grid;
    document.getElementById("timesH").innerHTML = timesH;
    document.getElementById("timesV").innerHTML = timesV;
  }

}

function Controller(view, model) {
  this.view = view;
  this.model = model;

  this.resetRectangle = function() {
    console.log("resetRectangle");
    this.model.setRandom();
    this.view.drawSquare();
    this.view.drawResult();
    this.view.drawRectangle(this.model.leftTop, this.model.rightBottom, true, true);
  };

  this.incrementGrid = function() {
    console.log("incrementGrid");
    if (!this.model.isUppermostGrid()) {
      this.model.incrementGrid();
      this.view.drawSquare();
    }
  };

  this.decrementGrid = function() {
    console.log("decrementGrid");
    if (!this.model.isLowestGrid()) {
      this.model.decrementGrid();
      this.view.drawSquare();
    }
  };

  this.applyGrid = function() {
    console.log("applyGrid");
    this.view.drawRectangle(this.model.leftTop, this.model.rightBottom, true, true);
    let leftTop = this.model.getLeftTop();
    for (let i = 0; i < this.model.getTimesV(); i++) {
      let rightBottom = leftTop.shift(this.model.grid, this.model.grid);
      for (let j = 0; j < this.model.getTimesH(); j++) {
        this.view.drawRectangle(leftTop, rightBottom);
        leftTop = leftTop.shiftH(this.model.grid);
        rightBottom = rightBottom.shiftH(this.model.grid);
      }
      leftTop = this.model.leftTop.shiftV((i + 1) * this.model.grid);
    }
  };

  this.gcd = function(width, height){
    if (height == 0){
      return width;
    } 
    return this.gcd(height, width % height);
  }

  this.calculateGrid = function(){
    this.view.drawRectangle(this.model.leftTop, this.model.rightBottom, true, true);
    let leftTop = this.model.leftTop.clone();
    let rightBottom = this.model.rightBottom.clone();
    let width = leftTop.getWidth(rightBottom);
    let height = leftTop.getHeight(rightBottom);
    while (width != height) {
      if (width > height) {
        rightBottom = leftTop.shift(height, height);
      } else if (width < height) {
        rightBottom = leftTop.shift(width, width);
      }
      this.view.drawArc(leftTop, rightBottom);
      if (width > height) {
        leftTop = leftTop.shiftH(height);
      } else {
        leftTop = leftTop.shiftV(width);
      }
      this.view.drawLine(leftTop, rightBottom);
      rightBottom = this.model.rightBottom.clone();
      width = leftTop.getWidth(rightBottom);
      height = leftTop.getHeight(rightBottom);
    }
    this.view.drawResult(width);
  };
}

let model;
let view;
let controller;

function load(){
  model = new Model();
  view = new View(model);
  controller = new Controller(view, model);
  resetRectangle()
}

function resetRectangle(){
  console.log("callaback resetRectangle");
  controller.resetRectangle();
}

function incrementGrid(){
  console.log("callaback incrementGrid");
  controller.incrementGrid();
}

function f(){
  console.log("f");
}

function decrementGrid(){
  console.log("callaback decrementGrid");
  controller.decrementGrid();
}

function applyGrid(){
  console.log("callaback applyGrid");
  controller.applyGrid();
}

function calculateGrid(){
  console.log("callaback calculate");
  controller.calculateGrid();
}