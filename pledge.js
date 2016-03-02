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
  this.handlerGroups.push({successCb: successCb, errorCb: errorCb});
  this.callHandlers();
};

$Promise.prototype.catch = function(errorFn) {
  this.then(null, errorFn);
};

$Promise.prototype.callHandlers = function () {
  // return and run last function in object held within this.handlerGroups.
  var latest = this.handlerGroups.length - 1;
  if (this.state === 'resolved') {
    this.handlerGroups[latest].successCb(this.value);
  }
  if (this.state === 'rejected' && this.handlerGroups[latest].errorCb) {
    this.handlerGroups[latest].errorCb(this.value);
  }

};

function Deferral() {
  this.$promise = new $Promise();
}
Deferral.prototype.resolve = function (data) {
  if (this.$promise.state === 'pending') {
    this.$promise.state = 'resolved';
    this.$promise.value = data;
    if (this.$promise.handlerGroups.length > 0) {
      for (var i = 0; i < this.$promise.handlerGroups.length; i++) {
        this.$promise.handlerGroups[i].successCb(data);
      }
      this.$promise.handlerGroups = [];
    }
  }
};
Deferral.prototype.reject = function (err) {
  if (this.$promise.state === 'pending') {
    this.$promise.state = 'rejected';
    this.$promise.value = err;
    if (this.$promise.handlerGroups.length > 0) {
      for (var i = 0; i < this.$promise.handlerGroups.length; i++) {
        this.$promise.handlerGroups[i].errorCb(err);
      }
      this.$promise.handlerGroups = [];
    }
  }
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
