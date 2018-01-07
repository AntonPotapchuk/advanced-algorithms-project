Main = function () {
    this._handlers = {
        'onPointsGenerated': [],
        'onPathUpdated': []
    };
    canvas = document.getElementById("graph-canvas")
    this.x = canvas.width;
    this.y = canvas.height;
    this.points = [];
    this.optimizer = undefined;
    this.score = [];
    this.path = undefined;
}
Main.prototype._getPointsNumber = function () {
    var el = document.getElementById("point-number");
    return el.value;
}
Main.prototype.generateInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
Main.prototype.GeneratePoints = function () {
    this.points = []
    for (var i = 0; i < this._getPointsNumber(); i++) {
        var x = this.generateInt(1, this.x)
        var y = this.generateInt(1, this.y)
        this.points.push([x, y])
    }    
    var handlers = this._handlers['onPointsGenerated'];
    for (var i = 0; i < handlers.length; i++) {
        handlers[i](this.points);
    }
}
Main.prototype.addEventListener = function (name, handler) {
    this._handlers[name].push(handler)
}
Main.prototype.getOptimizer = function () {
    var typeEl = document.getElementById("algorithm-type");
    if (typeEl.value == "abo") {
        return ABO(this.points);
    }
    // TODO
    return undefined;
}
Main.prototype.optimizerIterationCompleted = function (path, score) {
    this.score.push(score);
    this.path = path;
}
Main.prototype.Run = function () {
    this.score = [];
    this.path = undefined;
    this.optimizer = this.getOptimizer();
    this.optimizer.addEventListener("onIterationCompleted", function (path, score) {
        this.optimizerIterationCompleted(path, score);
    });
    this.optimizer.run();
}
Main.prototype.Stop = function () {
    if (this.optimizer != undefined) {
        this.optimizer.Stop();
    }
}