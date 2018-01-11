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
    this.score = []
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
        var l1 = parseFloat(document.getElementById("buffalo_l1").value);
        var l2 = parseFloat(document.getElementById("buffalo_l2").value);
        var population = parseInt(document.getElementById("buffalo_population").value);
        return new ABO(this.points, l1, l2, population);
    }
    var l1 = parseFloat(document.getElementById("de_len1").value);
    var l2 = parseFloat(document.getElementById("de_len2").value);
    var population = parseInt(document.getElementById("de_population").value);
    return new DE(this.points, population, l1, l2);
}
Main.prototype.optimizerIterationCompleted = function (path, s) {
    var score = this.score[this.score.length - 1]
    if (!score.length) {
        score.push([0, s])
    } else {
        score.push([score.length - 1, s]);
    }    
    this.path = path;
    var handlers = this._handlers['onPathUpdated'];
    for (var i = 0; i < handlers.length; i++) {
        handlers[i](this.points, this.path, this.score);
    }
}
Main.prototype.Start = function () {
    if (this.points != null && this.points.length) {
        this.score.push([]);
        this.path = undefined;
        this.optimizer = this.getOptimizer();
        var that = this;
        this.optimizer.addEventListener("onIterationCompleted", function (path, score) {
            that.optimizerIterationCompleted(path, score);
        });
        this.optimizer.Start();
    }    
}
Main.prototype.Stop = function () {
    if (this.optimizer != undefined) {
        this.optimizer.Stop();
    }
}