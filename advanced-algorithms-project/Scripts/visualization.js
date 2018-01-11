var Visualizer = function () {
    this.graph_canvas = document.getElementById("graph-canvas");
    this.graph_context = this.graph_canvas.getContext('2d');
    this.plot = document.getElementById("plot");
    this.UpdateScore([]);
}
Visualizer.prototype.DrawPoints = function (points) {
    this.graph_context.clearRect(0, 0, this.graph_canvas.width, this.graph_canvas.height)
    for (var i = 0; i < points.length; i++) {
        this.graph_context.beginPath();
        this.graph_context.strokeStyle = "#FF0000";
        var point = points[i];
        this.graph_context.arc(point[0], point[1], 2, 0, 2 * Math.PI);
        this.graph_context.stroke();
    }
}
Visualizer.prototype.DrawPath = function (points, ids) {
    this.DrawPoints(points);
    this.graph_context.beginPath();
    this.graph_context.strokeStyle = "#000000";
    for (var i = 0; i < ids.length; i++) {
        this.graph_context.lineTo(points[ids[i]][0], points[ids[i]][1]);
    }
    this.graph_context.lineTo(points[ids[0]][0], points[ids[0]][1]);
    this.graph_context.stroke();
}
Visualizer.prototype.UpdatePath = function (points, ids, score) {
    this.DrawPath(points, ids);
    this.UpdateScore(score);
}
Visualizer.prototype.UpdateScore = function (data) {
    if (data.length) {
        var lastRow = data[data.length - 1];
        var lastValue = lastRow[lastRow.length - 1];
        document.getElementById("iter").innerHTML = lastValue[0];
        document.getElementById("score").innerHTML = lastValue[1];
    }    
    $.plot(this.plot, data, { yaxis: { position: "fight" } });
}