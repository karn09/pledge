'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise() {
  this.state = 'pending';
  this.handlerGroups = [];
  this.value = null;
}
$Promise.prototype.then = function (successCb, errorCb) {
  if (typeof successCb !== 'function') {
    successCb = null;
  }
  if (typeof errorCb !== 'function') {
    errorCb = null;
  }
  var newGroup = {
    successCb: successCb, errorCb: errorCb, forwarder: new Deferral()
  }
  this.handlerGroups.push(newGroup);
  this.callHandlers();
  
  return newGroup.forwarder.$promise;
};

$Promise.prototype.catch = function(errorFn) {
  return this.then(null, errorFn);
};

$Promise.prototype.callHandlers = function () {
  // return and run last function in object held within this.handlerGroups.
  // var latest = this.handlerGroups.length - 1;
  // if (this.state === 'resolved') {
  //   this.handlerGroups[latest].successCb(this.value);
  // }
  // if (this.state === 'rejected' && this.handlerGroups[latest].errorCb) {
  //   this.handlerGroups[latest].errorCb(this.value);
  // }
  if (this.state === 'pending') {
    return;
  }
  
  var pA = this, pbDeferral; //renamed that to pA as this will be the initial found promise. 
  
  this.handlerGroups.forEach(function(group) {
    pbDeferral = group.forwarder;
    if (pA.state === 'resolved') {
      if (isFn(group.successCb)) {
        group.successCb(pA.value);
      } else { // if no success handler on pA, resolve with that instead
        pbDeferral.resolve(pA.value);
      }
    } else {
      if (isFn(group.errorCb)) {
        group.errorCb(pA.value)
      } else { // no error handler found, move 
        pbDeferral.reject(pA.value)
      }
    }
  })
  this.handlerGroups = [];
};

function isFn (fn) {
  return typeof fn === 'function';
}

function Deferral() {
  this.$promise = new $Promise();
}
function settle (state, value) {
  if (this.$promise.state === 'pending') {
    this.$promise.state = state;
    this.$promise.value = value;
    this.$promise.callHandlers();
  }
}

Deferral.prototype.resolve = function (data) {
  // if (this.$promise.state === 'pending') {
  //   this.$promise.state = 'resolved';
  //   this.$promise.value = data;
  //   if (this.$promise.handlerGroups.length > 0) {
  //     for (var i = 0; i < this.$promise.handlerGroups.length; i++) {
  //       this.$promise.handlerGroups[i].successCb(data);
  //     }
  //     this.$promise.handlerGroups = [];
  //   }
  // }
  settle.call(this, 'resolved', data);
};
Deferral.prototype.reject = function (err) {
  // if (this.$promise.state === 'pending') {
  //   this.$promise.state = 'rejected';
  //   this.$promise.value = err;
  //   if (this.$promise.handlerGroups.length > 0) {
  //     for (var i = 0; i < this.$promise.handlerGroups.length; i++) {
  //       this.$promise.handlerGroups[i].errorCb(err);
  //     }
  //     this.$promise.handlerGroups = [];
  //   }
  // }
  settle.call(this, 'rejected', err)
};

function defer() {
  return new Deferral();
}




/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
