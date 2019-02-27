/*
   Fireworks demo page script
   --------------------------
   Not required for your use!
*/

// Redeclaration just in case fireworks.js is included after this (and the following would be undefined)


function addEventHandler(o,evtName,evtHandler) {
  typeof(attachEvent)=='undefined'?o.addEventListener(evtName,evtHandler,false):o.attachEvent('on'+evtName,evtHandler);
}

function removeEventHandler(o,evtName,evtHandler) {
  typeof(attachEvent)=='undefined'?o.removeEventListener(evtName,evtHandler):o.detachEvent('on'+evtName,evtHandler);
}

var controller;

function Controller(o) {
  //writeDebug('Controller()');
  var self = this;
  this.o = o;
  this.controls = [];
  this.cb = [];
  this.options = [];
  this.functionExample = null;// document.getElementById('function-example');
  this.fbIE = null;

  this.randomize = function() {
    for (var i=0; i<self.controls.length; i++) {
      setTimeout(self.controls[i].randomize,20+(128*i+1));
    }
  }

  this.cbClick = function() {
    document.getElementById('controls').getElementsByTagName('dl')[this._index].className = 'col'+(this.checked==false||this.checked==''?' disabled':'');
    self.updateExample();
  }

  this.updateExample = function() {
    var s = '';
//    for (var i=0; i<self.controls.length; i++) {
//      s += (((i<4&&self.cb[0].checked)||(i>3&&self.cb[1].checked))?self.controls[i].value:'null')+',';
//    }
//    for (i=0; i<self.options.length-1; i++) {
//      s += self.options[i].checked+',';
//    }
//    s += self.options[i].checked;
//    self.functionExample.innerHTML = s;
  }

  this.createCustomFirework = function() {
    // build parameters, pass to firework controller
    // createFirework(nRadius,nParticles,nCircles,burstType,startX,startY,burstX,burstY,allowRandom,obeyBoundaries)
    var argv = [];
    var order = [0,1,2,3,4,5,6,7]; // map control objects to parameter order
    for (var i=0; i<order.length; i++) {
      argv[i] = self.controls[order[i]].value;
    }
    writeDebug('Creating firework from options..');
    if (self.cb[0].checked==false||self.cb[0].checked=='') {
      argv[0]=argv[1]=argv[2]=argv[3]=null;
    } else {
      argv[3] = parseInt(argv[3]--); // fails without parseint when argv[3] is 1 (effectively, null string?)
    }
    if (self.cb[1].checked==false||self.cb[1].checked=='') argv[4]=argv[5]=argv[6]=argv[7]=null;
    argv[8] = self.options[0].checked==true||self.options[0].checked=='checked';
    argv[9] = self.options[1].checked==true||self.options[1].checked=='checked';
    writeDebug('argv: '+argv);
    createFirework(argv[0],argv[1],argv[2],argv[3],argv[4],argv[5],argv[6],argv[7],argv[8],argv[9]);
  }

  this.destructor = function() {
    for (var i=self.controls.length; i--;) {
      self.controls[i].destructor();
    }
    for (i=self.cb.length; i--;) {
      self.cb.onclick = null;
      self.cb[i] = null;
    }
    for (i=self.options.length; i--;) {
      self.options[i] = null;
    }
    if (fc.isIE) {
      self.fbIE.onmouseover = null;
      self.fbIE.onmouseout = null;
      self.fbIE = null;
    }
    self.cb = null;
    self.options = null;
    self.controls = null;
    self.functionExample = null;
    self.o = null;
  }

  var items = parseInt(this.o.length/3);
  for (var i=0; i<items; i++) {
    this.controls[this.controls.length] = new Slider(this.o[(3*i)+2].getElementsByTagName('div')[1],this.o[(3*i)+1],this.o[(3*i)+2].getElementsByTagName('div')[0]);
  }
//  this.cb = [document.getElementById('disabled-0'),document.getElementById('disabled-1')];
//  for (i=this.cb.length; i--;) {
//    this.cb[i]._index = i;
//    this.cb[i].onclick = this.cbClick;
//  }
//  this.cb[1].checked = false;
//  this.options = [document.getElementById('opt-random0'),document.getElementById('opt-random1')];
//  this.options[0].checked = false;
//  this.options[1].checked = true;
//  if (fc.isIE) {
//    this.fbIE = document.getElementById('fireButton');
//    this.fbIE.onmouseover = function() {this.className='hover';}
//    this.fbIE.onmouseout = function() {this.className='';}
//  }
  setTimeout(self.randomize,706);

}

var sliderComponents = 6;

function Slider(o, i, name) {
    //oStartScale, oEndScale, oB
    // writeDebug('Slider()');
  
    var self = this;
    var isInit = false;

    this.o = o[(sliderComponents * i) + sliderComponents - 1].getElementsByTagName('div')[1];
    this.oV = o[(sliderComponents * i) + 1];
    this.oB = o[(sliderComponents * i) + sliderComponents - 1].getElementsByTagName('div')[0];
  this.index = i;
  

  ///////////////////////////////////////////////////////////
  // Acquisisco Start End e valore iniziale
  ///////////////////////////////////////////////////////////
  this.startScale = parseFloat(o[(sliderComponents * i) + 1].innerHTML.toString());
  this.endScale = parseFloat(o[(sliderComponents * i) + 2].innerHTML.toString());
  
  o[(sliderComponents * i)].innerHTML = o[(sliderComponents * i)].innerHTML + ":  " + this.startScale + '/' + this.endScale;

  this.startValue = parseFloat(o[(sliderComponents * i) + 3].innerHTML.toString());
  this.value = parseFloat(o[(sliderComponents * i) + 3].innerHTML.toString());
  this.precision = Math.pow(10,parseFloat(o[(sliderComponents * i) + 4].innerHTML.toString()));
  this.isInitializing = true;

  ///////////////////////////////////////////////////////////
  //Cancello i valori, dopo averli acquisiti,
  // per evitare che compaiano nello slider
  ///////////////////////////////////////////////////////////
  o[(sliderComponents * i) + 2].innerHTML = "";
  o[(sliderComponents * i) + 3].innerHTML = "";
  o[(sliderComponents * i) + 4].innerHTML = "";

  this.controlSize = 200;
  this.scale = this.endScale - this.startScale;
  this.oID = 'sc'; // +(fc.gOID++);
  this.offX = 0;
  this.x = 0;
  this.xMin = 0 - 10;
  this.xMax = this.controlSize - 10; // self.o.parentNode.offsetWidth-10;
  
  this.timer = null;
  this._className = this.o.className;
  this.tween = [];
  this.frame = 0;
  this.offX = -this.o.offsetLeft;
  this.uniformName = name;
  

  this.oV.innerHTML = this.value;

  this.over = function() {
    this.className = self._className+' hover';
    event.cancelBubble=true;
    return false;
  }

  this.out = function() {
    this.className = self._className;
    event.cancelBubble=true;
    return false;
  }

  this.down = function(e) {
    var e = e?e:event;
    self.offX = e.clientX-self.o.offsetLeft;
    addEventHandler(document,'mousemove',self.move);
    addEventHandler(document,'mouseup',self.up);
    return false;
  }

  this.barClick = function (e) {
      var e = e ? e : event;
      var a = self.o.parentNode.parentNode.offsetLeft;
      var b = e.clientX;
      var c = self.o.offsetWidth;
      self.slide(self.x, b - a - c);

      //self.offX = e.clientX - self.o.parentNode.parentNode.parentNode.offsetLeft;
      //self.move(e);
      //self.offX = 0;
      /*
      var pos = self.xMin + self.x;
      var stepScale = (self.controlSize) / 10.0;
      if (e.clientX - stepScale + self.x > self.x) self.moveTo(pos + stepScale);
      else self.moveTo(pos - stepScale);
      */
      var pos = self.xMin + self.x;
      var stepScale = (self.controlSize) / 10.0;
      if (e.clientX - stepScale + self.xMin > pos) self.moveTo(pos + stepScale);
      else self.moveTo(pos - stepScale);
      self.update();
  }

  this.move = function(e) {
    var e=e?e:event;
    var x = e.clientX-self.offX;
    if (x>self.xMax) {
      x = self.xMax;
    } else if (x<self.xMin) {
      x = self.xMin;
    }  
  self.moveTo(x);
  self.update();

    e.stopPropgation?e.stopPropagation():e.cancelBubble=true;
    return false;
  }

  this.up = function(e) {
    removeEventHandler(document,'mousemove',self.move);
    removeEventHandler(document,'mouseup',self.up);
    //controller.updateExample();
  }

  this.slide = function(x0,x1) {
//    self.tween = animator.createTween(x0,x1);
//    animator.enqueue(self,self.animate,controller.updateExample);
//    animator.start();
  }

  this.moveTo = function(x) {
      self.x = x - self.xMin;
    self.o.style.marginLeft = x+'px';
  }

  this.animate = function() {
    self.moveTo(self.tween[self.frame].data);
    self.update();
    if (self.frame++>=self.tween.length-1) {
      self.active = false;
      self.frame = 0;
      if (self._oncomplete) self._oncomplete();
      self.update();
      return false;
    }
    return true;
  }
/*
  this.doUpdate = function(t) {
    if (!self.timer) self.timer = setTimeout(self.update,t||20);
  }
*/
  this.update = function () {
      //self.timer = null;
      if (self.isInitializing) {
          self.isInitializing = false;
          var pos = (self.value - self.startScale) / (self.scale / self.controlSize);
          self.moveTo(pos + self.xMin);
      }
      else {
          self.value = self.startScale + self.x * (self.scale / self.controlSize);
          //if (self.value < 1) self.value = 1;

          if (self.value < self.startScale) self.value = self.startScale
          else if (self.value > self.endScale) self.value = self.endScale;


          if (self.oV.innerHTML != self.value) {
              self.oV.innerHTML = self.value;
              //if (self.functionUpdate) functionUpdate();
          }
      }
      var val = parseFloat(parseInt(self.value * this.precision) / this.precision);
      self.oV.innerHTML = val;
      //ctxGL.useProgram(progM);
      ctxGL.uniform1f(ctxGL.getUniformLocation(progM, self.uniformName), val);
      if (isInit) render();
      else isInit = true;

  }

  this.randomize = function() {
    self.slide(self.x,parseInt(Math.random()*self.xMax));
  }

  this.destructor = function() {
    self.o.onmouseover = null;
    self.o.onmouseout = null;
    self.o.onmousedown = null;
    self.o = null;
    self.oV = null;
    self.oB.onclick = null;
    self.oB = null;
  }

//  if (fc.isIE) {
//    // IE is lame, no :hover
//    this.o.onmouseover = this.over;
//    this.o.onmouseout = this.out;
//  }

  
  this.o.onmousedown = this.down;
  this.oB.onclick = this.barClick;
  self.update();
}

/*
function demoInit() {
  //document.getElementById('hideStuff').checked = false;
    controller = new Controller(document.getElementById('controls').getElementsByTagName('dd'));
}
*/
//function demoDestuctor() {
//  controller.destructor();
//  controller = null;
//}

//document.addEventHandler(window,'load',demoInit);
//addEventHandler(window,'unload',demoDestuctor);