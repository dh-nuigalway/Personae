// Avoid `console` errors in browsers that lack a console.


// Place any jQuery/helper plugins in here.
// 



aa.barchart = function(element, data, options)
{
 
    if(typeof options.margin == 'undefined' ){
        options.margin = {
            top: 12,
            right: 20,
            left: 40,
            bottom: 70
        };
    }

    var display_bar_labels = false;
    var bar_label_suffix = '';
    if(typeof options.bar_labels !== 'undefined'){
        display_bar_labels = options.bar_labels;
    }
    if(typeof options.bar_label_suffix !== 'undefined'){
        bar_label_suffix = options.bar_label_suffix;
    }

    if(typeof options.maxValue == 'undefined'){
        maxValue = d3.max(data, function(d){return +d.total_count;});
    }else{
        maxValue = options.maxValue;
    }

    options.width = (options.width - options.margin.left) - options.margin.right;

    var vis = d3.select(element )
            .append("svg")
              .attr("width", options.width + options.margin.left + options.margin.right)
              .attr("height", options.height + options.margin.top + options.margin.bottom)
              .append("g")
              .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");;


        var yAxisLabels = d3.set(data.map(function(d) { return d.variable_name; })).values();
        
    
        var y = d3.scaleOrdinal()
            // .rangeRoundBands([0, options.height], .1)
            .domain(yAxisLabels);

        var formatyAxis = d3.format('.0f');


         // line number scale
        var x = d3.scaleLinear()
                .range([0, options.width])
                .domain([0, maxValue]);

        // Axis
        var xAxis = d3.axisLeft(x)
                    .ticks(10)
                    .tickPadding(5);


        // var x = d3.scale.linear()
        //         .range([0, options.width])
        //         .domain([0, maxValue]);        
        
        // var yAxis = d3.svg.axis()
        //     .orient("left")
        //     .scale(y);
        
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5);




        if(options.hide_y_axis !== true){
            // Add X axis
            vis.append("g")
                  .attr("class", "y axis")                
                  .call(yAxis)
                  .selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em");
        }

        var div = d3.select("body").append("div")   
                    .attr("class", "tooltip")               
                    .style("opacity", 0);

        // add bars
        
        vis.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")
                .append("rect")
                .attr("class", function(d){
                    if(d.variable_name.toLowerCase() == 'galway'){
                        return "bar highlight";
                    }
                   return "bar"; })
                .attr("y", function(d) { return y(d.variable_name); })
                .attr("x", 0)
                .attr("width", function(d) {  return  x(+d.total_count); })
                .attr("height", y.rangeBand())
                .on("mouseover", function(d) {      
                    div.transition()        
                        .duration(200)      
                        .style("opacity", .95);      
                    div .html(function(){
                        return '<strong>' + d.variable_name + '</strong>: ' + d.total_count + bar_label_suffix;
                        
                    })  
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");    
                    })                  
                .on("mouseout", function(d) {       
                    div.transition()        
                        .duration(500)      
                        .style("opacity", 0);   
                });

        if(display_bar_labels){

            vis.selectAll(".bar g")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'bar-label')
                    .attr('y', function(d) {  return y(d.variable_name) + (y.rangeBand() / 1.75); })
                    .attr('x', function(d) {  
                        var val = x(+d.total_count);
                        if(val > 60){
                            return val - 35;
                        }
                        return val + 3;
                    })
                    .text(function(d){
                        return d.total_count + bar_label_suffix;
                    })
                    .style('fill', function(d){
                        var val = x(+d.total_count);
                        if(val > 60){
                            return '#fff';
                        }
                        return '#444';
                    })
                    .style('font', '10px sans-serif');
        }

};