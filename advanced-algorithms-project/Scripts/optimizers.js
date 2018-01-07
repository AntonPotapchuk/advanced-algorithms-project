var OptimizerBase = function (points) {
    this.points = points;
    this._stop = false;
    this.handlers = { "onIterationCompleted": [] };
}
OptimizerBase.prototype.addEventListener = function (name, handler) {
    this.handlers[name].push(handler);
}

// Algorithm Source: https://www.researchgate.net/profile/Julius_Odili/publication/314607500_TUTORIALS_ON_AFRICAN_BUFFALO_OPTIMIZATION_FOR_SOLVING_THE_TRAVELLING_SALESMAN_PROBLEM/links/58c3bf23aca272e36dd052fa/TUTORIALS-ON-AFRICAN-BUFFALO-OPTIMIZATION-FOR-SOLVING-THE-TRAVELLING-SALESMAN-PROBLEM.pdf
var ABO = function (points) {
    OptimizerBase.call(this, points);
}
ABO.prototype = Object.create(OptimizerBase.prototype);
ABO.prototype.constructor = ABO;
ABO.prototype.Start = function () {
    this._stop = false;
    while (!this.stop) {

    }
}
ABO.prototype.Stop = function () {
    this._stop = true;
}