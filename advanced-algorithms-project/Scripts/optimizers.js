var OptimizerBase = function (points) {
    this.points = points;
    this._stop = false;
    this.handlers = { "onIterationCompleted": [] };
    this.costs = this.calculateCosts();
    this.worker = undefined;
    this.best_score = 1000000000;
    this.best_path = undefined;
}
OptimizerBase.prototype.addEventListener = function (name, handler) {
    this.handlers[name].push(handler);
}
OptimizerBase.prototype.onIterationCompleted = function (path, score) {
    var handlers = this.handlers["onIterationCompleted"];
    for (var i = 0; i < handlers.length; i++) {
        handlers[i](path, score);
    }
}
OptimizerBase.prototype.generateInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
OptimizerBase.prototype.do = function () {}
OptimizerBase.prototype.Start = function () {
    var that = this;
    this.worker = setInterval(function () { that.do(); }, 2);
}
OptimizerBase.prototype.Stop = function () {
    if (this.worker) {
        clearInterval(this.worker);
        this.worker = undefined;
    }
}
OptimizerBase.prototype.calculateCosts = function () {
    var arr = [];
    for (var i = 0; i < this.points.length; i++) {
        var cost = []
        for (var j = 0; j < this.points.length; j++) {
            var first = this.points[i];
            var second = this.points[j];
            cost.push(Math.sqrt(Math.pow(first[0] - second[0], 2) + Math.pow(first[1] - second[1], 2)))
        }
        arr.push(cost)
    }
    return arr;
}

// Algorithm Description: https://www.researchgate.net/profile/Julius_Odili/publication/314607500_TUTORIALS_ON_AFRICAN_BUFFALO_OPTIMIZATION_FOR_SOLVING_THE_TRAVELLING_SALESMAN_PROBLEM/links/58c3bf23aca272e36dd052fa/TUTORIALS-ON-AFRICAN-BUFFALO-OPTIMIZATION-FOR-SOLVING-THE-TRAVELLING-SALESMAN-PROBLEM.pdf
var Buffalo = function (parent) {
    this.parent = parent;
    this.path = [];
    this.m = { x: 0, y: 0};
    // There should be current coordinates:)
    this.w = { x: 0, y: 0 };
    // As I understand, in this task it should be the copy of the previous coordinates
    this.bp = { x: 0, y: 0 };
    this.score = 0;
}
Buffalo.prototype.Move = function (point_id) {
    if (this.path.length == this.parent.points.length) {
        this.score += this.parent.costs[this.path[this.path.length - 1]][this.path[0]];
    } else if (this.path.length > 0) {
        this.score += this.parent.costs[this.path[this.path.length - 1]][point_id];
    }
    this.path.push(point_id);
    var new_point = this.parent.points[point_id];
    this.w.x = this.bp.x = new_point[0];
    this.w.y = this.bp.y = new_point[1];
}
var ABO = function (points, lp1, lp2, buffalos) {
    OptimizerBase.call(this, points);
    this.lp1 = lp1;
    this.lp2 = lp2;
    this.buffalos_num = buffalos;
}
ABO.prototype = Object.create(OptimizerBase.prototype);
ABO.prototype.constructor = ABO;
ABO.prototype.getIntWithout = function (min, max, skip) {
    while (true) {
        var val = this.generateInt(min, max);
        if (val != skip) {
            return val;
        }
    }
}
ABO.prototype.getClosestPointByCoord = function(coords, skip_points){
    var len = 1000000000;
    var closest = -1;
    for (var i = 0; i < this.points.length; i++) {
        if (skip_points.indexOf(i) > -1) {
            continue;
        }
        var point = this.points[i];
        var new_len = Math.sqrt(Math.pow(coords.x - point[0], 2) + Math.pow(coords.y - point[1], 2));
        if (new_len < len) {
            len = new_len;
            closest = i;
        }
    }
    return closest;
}
ABO.prototype.getClosestPointByDist = function(current_point, value, skip_points) {
    var diff = 1000000000;
    var closest = -1;
    for (var i = 0; i < this.points.length; i++) {
        if (skip_points.indexOf(i) > -1) {
            continue;
        }
        var new_diff = Math.abs(this.costs[current_point][i] - value);
        if (new_diff < diff) {
            diff = new_diff;
            closest = i;
        }
    }
    return closest;
}
ABO.prototype.do = function () {
    // Initialize buffalos
    var ind = this.generateInt(0, this.points.length - 1);
    var initialPoint = this.points[ind];
    var bg = this.points[this.getIntWithout(0, this.points.length - 1, ind)];

    if (this.buffalos == undefined) {
        this.buffalos = [];
        for (var i = 0; i < this.buffalos_num; i++) {
            this.buffalos.push(new Buffalo(this));
        }
        this.best_buffalo = this.generateInt(0, this.buffalos_num - 1);
    } 
    for (var i = 0; i < this.buffalos.length; i++) {
        buffalo = this.buffalos[i]            
        buffalo.path = [];
        buffalo.score = 0;            
        buffalo.bp.x = buffalo.w.y = buffalo.m.x = initialPoint[0];
        buffalo.bp.y = buffalo.w.x = buffalo.m.y = initialPoint[1];
        buffalo.Move(ind);
    }
    console.log("ITER")
    
        
    for (var i = 0; i < this.points.length - 1; i++) {
        var best_score = 10000000;
        var new_bg = undefined;
        for (var j = 0; j < this.buffalos_num; j++){
            var buffalo = this.buffalos[j];
            buffalo.m.x = buffalo.m.x + this.lp1 * Math.abs(bg[0] - buffalo.w.x) +
                this.lp2 * (buffalo.bp.x - buffalo.w.x);
            buffalo.m.y = buffalo.m.y + this.lp1 * Math.abs(bg[0] - buffalo.w.y) +
                this.lp2 * (buffalo.bp.y - buffalo.w.y);
            var lambda = Math.random() + 1;
            buffalo.w.x = (buffalo.w.x + buffalo.m.x) / lambda;
            buffalo.w.y = (buffalo.w.y + buffalo.m.y) / lambda;
            var point_id = this.getClosestPointByCoord({ x: buffalo.w.x, y: buffalo.w.y }, buffalo.path);
            var prob = (Math.pow(buffalo.w.x, this.lp1) * Math.pow(buffalo.m.x, this.lp2)) /
                (Math.pow(buffalo.w.y, this.lp1) * Math.pow(buffalo.m.y, this.lp2));
            var current_point = buffalo.path[buffalo.path.length - 1];
            point_id = this.getClosestPointByDist(current_point, prob * this.costs[current_point][point_id], buffalo.path);
            buffalo.Move(point_id);
            if (best_score > buffalo.score) {
                best_score = buffalo.score;
                new_bg = this.points[point_id];
            }
        }
        bg = new_bg;
    }
    var best_score = 100000000;
    var best_path = undefined;
    for (var i = 0; i < this.buffalos_num; i++) {
        var buffalo = this.buffalos[i];
        buffalo.Move(buffalo.path[0]);
        if (best_score >= buffalo.score) {
            best_score = buffalo.score;
            best_path = buffalo.path;
        }
    }
    if (best_score < this.best_score) {
        this.best_score = best_score;
        this.best_path = best_path;
    }
    this.onIterationCompleted(this.best_path, this.best_score);    
}

var DE = function (points, populations, len1, len2) {
    OptimizerBase.call(this, points);    
    this.populations_count = populations;
    this.len1 = len1;
    this.len2 = len2;
    this.id = 0;
}
DE.prototype = Object.create(OptimizerBase.prototype);
DE.prototype.constructor = DE;
DE.prototype.valueInArray = function (arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][0] == val[0] && arr[i][1] == val[1])
            return true;
    }
    return false;
}
DE.prototype.GSX = function (x, x1, x2) {
    city = x1[x];
    index1 = x;
    index2 = -1;
    for (var i = 0; i < x2.length; i++) {
        if (x2[i][0] == city[0] && x2[i][1] == city[1]){
            index2 = i;
            break;
        }
    }
    new_population = []
    ind_x1 = []
    ind_x2 = []

    for (var i = 0; i < x1.length + 1; i++) {
        if (index1 >= 0) {
            ind_x1.push(index1)
            index1 -= 1;
        } else {
            index1 = x1.length - 1;
        }
    }
    for (var i = 0; i < x2.length + 1; i++) {
        if (index2 < x2.length) {
            ind_x2.push(index2)
            index2 += 1;
        } else {
            index2 = 0;
        }
    }
    middle = Math.floor(x1.length / 2);
    last1 = ind_x1.shift();
    last2 = ind_x2.shift();

    while (new_population.length < this.points.length) {
        while (ind_x1.length) {
            last1 = ind_x1.shift();
            if (!this.valueInArray(new_population, x1[last1]))
                break;
        }
        while (ind_x2.length) {
            last2 = ind_x2.shift();
            if (!this.valueInArray(new_population, x2[last2]) && (x1[last1][0] != x2[last2][0] || x1[last1][1] != x2[last2][1]))
                break;
        }
        new_population.splice(new_population.length, 0, x2[last2]);
        new_population.splice(0, 0, x1[last1]);
    }
    return new_population
}
DE.prototype.MOX = function (target, source, len1) {
    var city_random = this.generateInt(0, target.length - 1);
    var index_s = -1;
    for (var i = 0; i < source.length; i++) {
        if (source[i][0] == target[city_random][0] && source[i][1] == target[city_random][1]) {
            index_s = i + 1;
            break;
        }
    }
    var new_target = [];
    var index_t = city_random + 1;
    var source_len1 = [];
    if (index_s + len1 <= source.length) {
        source_len1 = source.slice(index_s, index_s + len1);
    } else {
        for (var i = 0; i < len1 - 1; i++) {
            if (index_s < source.length) {
                source_len1.push(source[index_s]);
                index_s += 1;
            } else {
                index_s = 0;
                source_len1.push(source[index_s]);
                index_s += 1;
            }
        }
    }
    for (var i = 0; i < source.length; i++) {
        if (index_t < source.length) {
            new_target.push(target[index_t]);
            index_t += 1;
        } else {
            index_t = 0;
            new_target.push(target[index_t])
            index_t += 1;
        }
    }
    var new_arr = []
    for (var i = 0; i < new_target.length; i++) {
        if (!this.valueInArray(source_len1, new_target[i])) {
            new_arr.push(new_target[i]);
        }
    }
    return new_arr.concat(source_len1);
}
DE.prototype.dist = function (points) {
    var dist = 0;
    for (var i = 0; i < points.length - 1; i++) {
        var p1 = points[i];
        var p2 = points[i + 1];
        dist += Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
    }
    return dist;
}
DE.prototype.two_opt = function (route, best_dist, it, iterations) {
    var first_iteration = best_dist;
    for (var i = 0; i < route.length - 1; i++) {
        i += 1;
        var k = i + 1;
        while (k <= route.length - 1) {
            var new_route = this.swap(route, i, k);
            var new_dist = this.dist(new_route);
            if (new_dist < best_dist) {
                route = new_route;
                best_dist = new_dist;
            }
            k += 1;
        }
    }
    if(best_dist < first_iteration){
        iterations[it] = []
        iterations[it].push(route)
        iterations[it].push(best_dist)
        it += 1
        this.two_opt(route, best_dist, it, iterations);
    }
    return iterations;
}
DE.prototype.swap = function (route, i, k) {
    var start = route.slice(0, i);
    var middle = route.slice(i, k + 1);
    middle = middle.reverse();
    var end = route.slice(k + 1);
    return start.concat(middle).concat(end);
}
DE.prototype.shuffleArray = function (o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
DE.prototype.pointsToIndexes = function (points) {
    var res = [];
    for (var i = 0; i < points.length; i++) {
        res.push(this.points.indexOf(points[i]));
    }
    return res;
}
DE.prototype.do = function () {
    if (this.populations == undefined) {
        this.populations = [];
        for (var i = 0; i < this.populations_count; i++) {
            this.populations.push(this.shuffleArray(this.points));
        }
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        for (var i = 0; i < this.populations_count; i++) {
            var p = this.populations[i];
            var unique = p.filter(onlyUnique);
            if (unique.length != p.length) {
                console.log("WARNING")
            }
        }
    }
    var x = this.generateInt(0, this.points.length - 1);
    var pi = this.GSX(x, this.populations[this.id + 1], this.populations[this.id + 2]);
    var vi = this.MOX(this.populations[this.id], pi, this.len1);
    var ui = this.MOX(this.populations[this.id], vi, this.len2);
    var initial_path = ui;
    var initial_dist = this.dist(ui);
    var it = 0;
    var iterations = {};
    this.two_opt(initial_path, initial_dist, it, iterations)
    var min_dist = []
    var min_seq = undefined;
    var min = 1000000000;
    var it_keys = Object.keys(iterations)
    for (var i = 0; i < it_keys.length; i++) {
        var key = it_keys[i];
        var k = iterations[key][0];
        var j = iterations[key][1];
        min_dist.push(j);
        if (j < min) {
            min = j;
            min_seq = k;
        }
    }
    if (initial_dist >= min) {
        this.populations[this.id] = min_seq;
    }
    if (min < this.best_score) {
        this.best_score = min;
        this.best_path = this.pointsToIndexes(min_seq);
    }
    this.onIterationCompleted(this.best_path, this.best_score);
    this.id += 1;
    if (this.id >= this.populations_count - 2) {
        this.id = 0;
    }
}