var CodeFlower = function(selector, w, h) {
  this.w = w;
  this.h = h;

  d3.select(selector).selectAll("svg").remove();

  this.svg = d3.select(selector).append("svg:svg")
    .attr('width', w)
    .attr('height', h);

  this.force = d3.layout.force()
    .on("tick", this.tick.bind(this))
    .charge(function(d) { return d._children ? -d.size / 100 : -40; })
    .linkDistance(function(d) { return d.target._children ? 80 : 25; })
    .size([h, w]);
};

function getFixed (d) {
  return !isNaN(parseFloat(d.name)) && isFinite(d.name);
}


CodeFlower.prototype.update = function(json) {
  if (json) this.json = json;

  this.json.fixed = true;
  this.json.x = this.w / 2;
  this.json.y = this.h / 2;

  var nodes = this.flatten(this.json);
  var links = d3.layout.tree().links(nodes);
  var total = nodes.length || 1;

  // remove existing text (will readd it afterwards to be sure it's on top)
  this.svg.selectAll("text").remove();

  // Restart the force layout
  this.force
    .gravity(Math.atan(total / 50) / Math.PI * 0.4)
    .nodes(nodes)
    .links(links)
    .start();

  // Update the links
  this.link = this.svg.selectAll("line.link")
    .data(links, function(d) { return d.target.name; });

  // Enter any new links
  this.link.enter().insert("svg:line", ".node")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  // Exit any old links.
  this.link.exit().remove();

  // Update the nodes
  this.node = this.svg.selectAll("circle.node")
    .data(nodes, function(d) { return d.name; })
    .classed("collapsed", function(d) { return d._children ? 1 : 0; });

  this.node.transition()
    .attr("r", function(d) { return d.children ? 3.5 : Math.pow(d.size, 2/5) || 1; });

  // Enter any new nodes
  this.node.enter().append('svg:circle')
    .attr("class", "node")
    .classed('directory', function(d) { return (d._children || d.children) ? 1 : 0; })
    .attr("r", function(d) { return d.children ? 3.5 : Math.pow(d.size*3, 2/5) })
    .style("fill", function color(d) {
      if (d.hr == 0) {return "#b3ecff";}
      else if (d.hr == 1) {return "#FCCDE5";}
      else if (d.hr == 2) {return "#ffff99";}
      else if (d.hr == 3) {return "#ccff66";}
      else if (d.hr == 4) {return "#ff6633";}
      else if (d.hr == 5) {return "red";}
      else {return "red";}

    })
    .call(this.force.drag)
    .on("click", this.click.bind(this))
    .on("mouseover", this.mouseover.bind(this))
    .on("mouseout", this.mouseout.bind(this));

  // Exit any old nodes
  this.node.exit().remove();
};

CodeFlower.prototype.flatten = function(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) {
      node.size = node.children.reduce(function(p, v) {
        return p + recurse(v);
      }, 0);
    }
    if (!node.id) node.id = ++i;
    nodes.push(node);
    return node.size;
  }

  root.size = recurse(root);
  return nodes;
};

CodeFlower.prototype.click = function(d) {
  // Toggle children on click.
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  this.update();
};

CodeFlower.prototype.mouseover = function(d) {
  d3.select("#tooltip1").style("visibility", "visible").text("Time: " + d.name);
  d3.select("#tooltip2").style("visibility", "visible").text("Step Count: " + d.size + " steps");
  d3.select("#tooltip3").style("visibility", "visible").text("Heart Rate: Level " + Number(d.hr));
};


CodeFlower.prototype.mouseout = function() {
  //this.text.style('display', 'none');
  d3.select("#tooltip").style("visibility", "hidden");
};

//Chang link position
CodeFlower.prototype.tick = function() {
  var h = this.h;
  var w = this.w;
  var p = w/2;
  var n = h/2-h/9;


  this.node.attr("transform", function(d) {
     if (getFixed(d)) {
       
       if (d.name === 6) {
          d.x=p;
          d.y=p-n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 18) {
          d.x=p;
          d.y=p+n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 0) {
          d.x=p-n;
          d.y=p;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 12) {
          d.x=p+n;
          d.y=p;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 7) {
          d.x=p;
          d.y=p-0.43*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 19) {
          d.x=p;
          d.y=p+0.43*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 1) {
          d.x=p-0.43*n;
          d.y=p;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 13) {
          d.x=p+0.43*n;
          d.y=p;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 8) {
          d.x=p+0.5*n;
          d.y=p-0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 20) {
          d.x=p-0.5*n;
          d.y=p+0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 4) {
          d.x=p-0.5*n;
          d.y=p-0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 16) {
          d.x=p+0.5*n;
          d.y=p+0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 9) {
          d.x=p+0.43*0.5*n;
          d.y=p-0.43*0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 21) {
          d.x=p-0.43*0.5*n;
          d.y=p+0.43*0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 5) {
          d.x=p-0.43*0.5*n;
          d.y=p-0.43*0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 17) {
          d.x=p+0.43*0.5*n;
          d.y=p+0.43*0.866*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 10) {
          d.x=(p+0.43*0.866*n);
          d.y=(p-0.43*0.5*n);
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 22) {
          d.x=p-0.866*n;
          d.y=p+0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 2) {
          d.x=p-0.866*n;
          d.y=p-0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 14) {
          d.x=p+0.866*n;
          d.y=p+0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 11) {
          d.x=p+0.866*n;
          d.y=p-0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 23) {
          d.x=p-0.43*0.866*n;
          d.y=p+0.43*0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 3) {
          d.x=p-0.43*0.866*n;
          d.y=p-0.43*0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else if (d.name === 15) {
          d.x=p+0.43*0.866*n;
          d.y=p+0.43*0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       } else {
          d.x=p+0.43*0.866*n;
          d.y=p-0.43*0.5*n;
          return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
       }   
     } else {
       return "translate(" + Math.max(4, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
     }
  });

    this.link.attr("x1", function(d) {  return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });    

};

CodeFlower.prototype.cleanup = function() {
  this.update([]);
  this.force.stop();

};