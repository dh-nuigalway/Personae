/* global d3, d3Kit, _ , console */

/**
 * Personæ  
 * 
 * Data visualisation of Shakespeare's plays for the NVS challenge, 2016
 *
 * @author  David Kelly - http://www.davidkelly.ie | http://twitter.com/davkell
 * @date 29 July, 2016 
 */

var Personae = {

    playTitle: '',          // Title the vis

    castList: null,         // json castlist from server

    playData: null,         // json play data from server

    metricsData: null,      // json character line-count metrics from server

    sceneData: null,        // json scene numbers

    circleScale: null,      // d3.scale for circles

    personColour: d3.scaleOrdinal(d3.schemeCategory20c),

    personColourInteractive: d3.scaleOrdinal(d3.schemeCategory20),


    // deal with multiple names
    colourName: function(name)
    {
        // need a switch to resolve multiple 
        // names

        return Personae.personColour(name);
    },

    // Avoids colour clashes between the earlier
    // iteration of the visualisation, and the 
    // production version (this is for the production
    // version)
    colorNameInteractive: function(name)
    {
        return Personae.personColourInteractive(name);
    },

    /**
     * Map locations 
     * @version 0.2     
     */
    mapLocations: function(locationData, element)
    {
        if(_.isUndefined(element)){
            element = 'location-map';  
        } 

        if($('#'+ element).length <= 0){
            return;
        }

        var circleScale = d3.scaleLinear()
            .domain([1, d3.max(locationData, function(d){return +d.number_mentions; })])
            .range([4, 15]);

        var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', { 
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
            });  

        var map = L.map(element, { 
            scrollWheelZoom: false, 
            center: [53.42278, -7.93722], 
            zoom: 2 
        });  

        map.addLayer(layer);

        locationData.forEach(function(item){

            var html = '<h4>' + item.name + '</h4>';
                html += '<p><strong>Number of mentions: ' + item.number_mentions + '</strong></p>';                

            var circle = L.circleMarker([item.latitude, item.longitude], {                
                radius: circleScale(item.number_mentions),
                color: '#fff',
                weight: 1,
                fillColor: '#2c73a6',
                fillOpacity: .8
            })
            .bindPopup(html, {className: 'bnbPopup'})
            .addTo(map);

        });

    },

    /**
     * Return a speaker's full name from the cast list,
     * based on their ID
     * @param string who_id - xml identifier for a speaker
     */
    getFullName: function(who_id)
    {
        var person = _.findWhere(Personae.castList, { id: who_id });    
        return person.name;
    },

    /**
     * Produce the Final Interactive visualisation with 
     * Speakers & Mentions 
     * 
     * @param  string element - id of target element [optional]     
     * @version  1.0
     */
    drawTimelineMentionsCircle: function(element)
    {

        if(_.isUndefined(element)){
            element = 'mentions-timeline-circle';  
        } 

        if($('#'+ element).length <= 0){
            return;
        }

        // Set up dimensions
        var margin = {top: 20, right: 40, bottom: 40, left: 20},
            width = $('#'+ element).width() - margin.left - margin.right,
            height = $('#'+ element).height() - margin.top - margin.bottom;

            // helps keep full vis visible on
            // relatively small (laptop-size) screens
            if(width > height){
                width = height;
            }

            radiusOuter = (width / 2) - 50 ,        // outermost boundary circle 
            radiusOuterLabel = radiusOuter - 50,    // positioning of act labels
            radiusOuterScene = radiusOuter - 25,    // positioning of scene labels
            radiusSpeakers = (radiusOuter - 60),    // speaker circle
            radiusMentions = (radiusSpeakers - 80), // mentions circle

            cx = (width / 2 ) + margin.left,        // common center for all circles
            cy = (height / 2) + (margin.top * 1.5);


        var dataOuter = [];
        var dataInner = [];
        var dataMentions = [];

        // Extract Act data
        _.each(Personae.playData, function(value, key){
            var tmp = {
                'act': value.act,
                'start_line': value.data[0].line,
                'end_line': value.data[ value.data.length - 1].line
            };

            dataOuter.push(tmp);

            _.each(value.data, function(v){
                dataInner.push(v);
            });
        });        

        // A way to convert line-numbers to an angle
        // -> used to position markers around the various
        // circles
        var circleScale = d3.scaleLinear()
            .domain([1, d3.max(dataOuter, function(d){return +d.end_line; })])
            .range([0, 360]);

        // make it useful beyond this function
        Personae.circleScale = circleScale;


        // Create the SVG wrapper
        var vis = d3.select('#'+ element).append('svg')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        // Create holder for the speaker -> name 
        // connection lines (keeps them below the other
        // elements)
        vis.append('g')
            .attr('id', 'connections');


        // Line generation function
        var line = d3.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; });
        

        // ------------------------------------------
        //   Act Marker Labels
        // ------------------------------------------
        // Wrapper for Act markers
        vis.selectAll('.actMarkers')
                .append('g')
                .attr('class', 'actMarkers')

        // Add 
        _.each(dataOuter, function(actValue){
            
            // Calculate x,y coordinates for the lines
            // that mark out the acts
            actValue['line_data'] = [
                [
                    cx + (radiusOuter * Math.sin( Math.floor(circleScale(+actValue['start_line'])) * (Math.PI / 180) )),
                    cy - (radiusOuter * Math.cos( Math.floor(circleScale(+actValue['start_line'])) * (Math.PI / 180) ))
                ],[
                    cx + (radiusOuterLabel * Math.sin( Math.floor(circleScale(+actValue['start_line'])) * (Math.PI / 180) )),
                    cy - (radiusOuterLabel * Math.cos( Math.floor(circleScale(+actValue['start_line'])) * (Math.PI / 180) ))
                ]
            ];

            vis.append('path')                
                .data([actValue])
                    .attr('class', 'actMarker')
                    .attr('d', function(d){ 
                        return line(d.line_data); 
                    })
                    .style("stroke-width", 2)
                    .style("stroke", "#ddd")
                    .style("fill", "none");
                        
        });

        // ------------------------------------------
        //   Scene Marker Labels
        // ------------------------------------------

        // Don't display scene markers for 1st scenes (they
        // overlay on Act markers)
        Personae.sceneData = _.reject(Personae.sceneData, function(value){
            return value.scene === '1';
        });

        
        // calculate and add scene marker lines
        _.each(Personae.sceneData, function(scene){
           
            scene['line_data'] = [
                [
                    cx + (radiusOuterScene * Math.sin( Math.floor(circleScale(+scene.line)) * (Math.PI / 180) )),
                    cy - (radiusOuterScene * Math.cos( Math.floor(circleScale(+scene.line)) * (Math.PI / 180) ))
                ],[
                    cx + (radiusOuterLabel * Math.sin( Math.floor(circleScale(+scene.line)) * (Math.PI / 180) )),
                    cy - (radiusOuterLabel * Math.cos( Math.floor(circleScale(+scene.line)) * (Math.PI / 180) ))
                ]
            ];

            vis.append('path')                
                .data([scene])
                    .attr('class', 'sceneMarker')
                    .attr('d', function(d){ 
                        return line(d.line_data); 
                    })
                    .style("stroke-width", 2)
                    .style("stroke", "#eee")
                    .style("fill", "none");           
        });

        // Scene Labels
        vis.selectAll('g.column-label-set')
            .attr('class', 'column-label-set')
            .data(Personae.sceneData)
                .enter()
                .append('text')
                    .attr('transform', function(d, i){
                        return 'translate(' + (cx + ((radiusOuterScene + 20) * Math.sin( Math.floor(circleScale(d.line)) * (Math.PI / 180) ))) + ', '+ (cy - ((radiusOuterScene + 20) * Math.cos( Math.floor(circleScale(d.line)) * (Math.PI / 180)))) + ')';                
                    }) 
                    .attr('class', 'column-label scene')
                    .attr('text-anchor', 'middle')
                    .text(function(d){
                        return 'S. ' + d.scene
                    });  


        // Act Labels
        vis.selectAll('g.column-label-set')
            .attr('class', 'column-label-set')
            .data(dataOuter)
                .enter()
                .append('text')
                    .attr('transform', function(d, i){
                        return 'translate(' + (cx + ((radiusOuter + 20) * Math.sin( Math.floor(circleScale(d.start_line)) * (Math.PI / 180) ))) + ', '+ (cy - ((radiusOuter + 20) * Math.cos( Math.floor(circleScale(d.start_line)) * (Math.PI / 180)))) + ')';                
                    }) 
                    .attr('class', 'column-label')
                    .attr('text-anchor', 'middle')
                    .text(function(d){
                        return 'Act ' + d.act
                    });     



        // ------------------------------------------
        //   Speakers
        // ------------------------------------------
        
        // Inner Circle (Speakers)
        vis.append('g')
              .selectAll("g")
                .data([1])
                .enter()
                    .append('circle')
                    .attr('class', 'innerCircle')
                    .attr('r', radiusSpeakers)
                    .attr('cx', cx)
                    .attr('cy', cy);
        
        // Extract Speaker Data
        var speakers = _.filter(dataInner, function(value){
            return value.type === 'speaker';
        });

        // set up tooltip for use with speakers
        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return Personae.getFullName(d.who_id) + ' ('+ d.name + ') <br/> <small>Line number:' + d.line + '</small>'; });        

        // Add Speaker Markers
        vis.append('g')
            .selectAll('.speakerMarkers')
            .attr('class', 'speakerMarkers')
                .data(speakers)
                .enter().append('circle')
                    .attr('class', function(d){
                        return 'speaker ' + d.who_id;
                    })
                    .attr('r', '5')
                    .attr('cx', function(d){
                        return cx + (radiusSpeakers * Math.sin( Math.floor(circleScale(d.line)) * (Math.PI / 180) ));
                    })
                    .attr('cy', function(d){
                        return cy - (radiusSpeakers * Math.cos( Math.floor(circleScale(d.line)) * (Math.PI / 180) ));
                    })
                    .attr('id', function(d){
                        // this will be matched with a class on 
                        // mentions, which allows the connecting lines
                        // to be drawn
                        return d.who_id + '_' + d.line;     
                    })
                    .style('fill', '#ddd')
                    .style("stroke-width", 1)
                    .style("stroke", "#fff")
                    .on('mouseover', function(d){
                        tip.show(d); 
                    })
                    .on('mouseout', function(d){
                        tip.hide(d);                         
                    });                  


        // ------------------------------------------
        //   Mentions
        // ------------------------------------------
        
        // Mentions (inner) Circle
        vis.append('g')
          .selectAll("g")
            .data([1])
            .enter()
                .append('circle')
                .attr('class', 'mentionsCircle')
                .attr('r', radiusMentions)
                .attr('cx', cx)
                .attr('cy', cy);

        // Mentions Markers
        var mentions = [];
        _.each(speakers, function(value, key){
            
            // Find who each speaker mentions
            _.each(value.mentions, function(mention){
            
                var temp = {};
                temp['parent_line'] = value.line;
                temp['parent']  = value.who_id;
                temp['line']    = mention.line;
                temp['name']    = mention.name;

                mentions.push(temp);
            });
        });

        // Tooltip setup for Name mentions
        var mention_tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.name + ' (by '+ Personae.getFullName(d.parent) + ') <br/> <small>Line number:' + d.line + '</small>'; });

        // Add Mention Markers
        vis.append('g')
            .selectAll('.mentionMarkers')
            .attr('class', 'mentionMarkers')
                .data(mentions)
                .enter().append('circle')
                    .attr('class', function(d){
                        return 'mention parent_' + d.parent + ' ' + d.parent + '_' + d.parent_line;
                    })
                    .attr('r', '5')
                    .attr('cx', function(d){
                        return cx + (radiusMentions * Math.sin( Math.floor(circleScale(d.line)) * (Math.PI / 180) ));
                    })
                    .attr('cy', function(d){
                        return cy - (radiusMentions * Math.cos( Math.floor(circleScale(d.line)) * (Math.PI / 180) ));
                    })
                    .style('fill', '#ddd')
                    .style("stroke-width", 1)
                    .style("stroke", "#fff")
                    .on('mouseover', function(d){
                        mention_tip.show(d); 
                    })
                    .on('mouseout', function(d){
                        mention_tip.hide(d); 
                    });                  

        // Initialise tooltips
        vis.call(tip);
        vis.call(mention_tip);


        // ----------------------------------
        //  Assorted Visualisation Labels 
        // ----------------------------------
        vis.append('g')
            .attr('id', 'misc-labels');

        // Speaker ring label
        vis.select('#misc-labels')
                .append('text')
                    .attr('transform', function(d, i){
                        return 'translate(' + (cx) + ',' + (cy - (radiusSpeakers * Math.cos( Math.floor(circleScale(0)) * (Math.PI / 180) )) + 20) +')' ;                
                    }) 
                    .attr('class', 'vis-label')
                    .attr('text-anchor', 'middle')
                    .text(function(d){
                        return 'Speakers';
                    });    

        // Mentions ring label
        vis.select('#misc-labels')
                .append('text')
                    .attr('transform', function(d, i){
                        return 'translate(' + (cx) + ',' + (cy - (radiusMentions * Math.cos( Math.floor(circleScale(0)) * (Math.PI / 180) )) + 30) +')' ;                
                    })
                    .attr('class', 'vis-label')
                    .attr('text-anchor', 'middle')
                    .text(function(d){
                        return 'Names mentioned';
                    });     

        // Visualisation Title (goes in the middle of the viz)
        vis.append('text')
            .attr('class', 'vis-title')
            .attr('transform', function(d, i){
                return 'translate(' + cx + ',' + cy  +')';                
            })
            .attr('text-anchor', 'middle')
            .text(Personae.playTitle)

        // Viz sub-title
        vis.append('text')
            .attr('class', 'vis-sub-title')
            .attr('transform', function(d, i){
                return 'translate(' + cx + ',' + (cy + 30)  +')';                
            })
            .attr('text-anchor', 'middle')
            .text('Text Visualisation of Speakers')

    },

    /**
     * Handle the checkbox interaction => when one/more characters
     * are selected, highlight them, and connect any
     * mentions on the inner ring with a line
     * 
     * @param  {array} selected - ids of characters selected
     * @param  {string} element - element id of viz wrapper
     */
    activateSpeakers: function(selected, element)
    {
        if(_.isUndefined(element)){
            element = 'mentions-timeline-circle';  
        } 

        if($('#'+ element).length <= 0){
            return;
        }

        // ------------------------------------------
        //  Yes...repeating this is not at all good 
        // ------------------------------------------
        var margin = {top: 20, right: 40, bottom: 40, left: 20},
            width = $('#'+ element).width() - margin.left - margin.right,
            height = $('#'+ element).height() - margin.top - margin.bottom;

            if(width > height){
                width = height;
            }

            radiusOuter = (width / 2) - 50 ,
            radiusOuterLabel = radiusOuter - 50,
            radiusOuterScene = radiusOuter - 25,
            radiusSpeakers = (radiusOuter - 60),
            radiusMentions = (radiusSpeakers - 80), 

            cx = (width / 2 ) + margin.left,
            cy = (height / 2) + (margin.top * 1.5);

        // ----------------------------------------

        // line generation (curve isn't working...)                
        var line = d3.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; })
                    .curve(d3.curveCatmullRom.alpha(0.9));

        // identify the vis
        vis = d3.select('#' + element + ' svg');

        // empty any existing connections
        vis.selectAll('path.speakerMentionConnection').remove();
        
        // Show / hide ring lables depending on if
        // user has interacted with the checkboxes
        if(selected.length > 0){
            vis.selectAll('#misc-labels')
                .attr('style', 'opacity:0');
        }else{
            vis.selectAll('#misc-labels')
                .attr('style', 'opacity:1');
        }

        // Initialise all speaker & mention markers
        vis.selectAll('.speaker')
                    .style('fill', '#ddd')
                    .attr('r', 5);

        vis.selectAll('.mention')
                    .style('fill', '#ddd')
                    .attr('r', 5);


        // Loop each character selected, colour them in, 
        // then loop their mentions colour them in, and
        // draw connecting lines from one to the other
        _.each(selected, function(character){
            
            var speakers = vis.selectAll('.speaker.'+ character)
                speakers.style('fill', Personae.colorNameInteractive(character))
                        .attr('r', 8);
            
        
            speakers.each(function(d){

                // only want ones with mentions
                if(!_.isUndefined(d.mentions)){
                    
                    // speaker location
                    var origin_x = cx + (radiusSpeakers * Math.sin( Math.floor(Personae.circleScale(+d.line)) * (Math.PI / 180) ));
                    var origin_y = cy - (radiusSpeakers * Math.cos( Math.floor(Personae.circleScale(+d.line)) * (Math.PI / 180) ));

                    var linkedMentions = vis.selectAll('.' + d.who_id + '_' + d.line);

                    linkedMentions.style('fill', '#bbb')
                        .attr('r', 8);

                    // identify & connect each mention location
                    linkedMentions.each(function(l){
                        var connection_lines = {};

                        connection_lines['line_data'] = [
                            [origin_x, origin_y],
                            [
                                cx + (radiusMentions * Math.sin( Math.floor(Personae.circleScale(+l.line)) * (Math.PI / 180) )),
                                cy - (radiusMentions * Math.cos( Math.floor(Personae.circleScale(+l.line)) * (Math.PI / 180) ))
                            ]
                        ];

                        vis.select('#connections')                            
                            .append('path')                
                            .data([connection_lines])
                                .attr('class', 'speakerMentionConnection')
                                .attr('d', function(d){ 
                                    return line(d.line_data); 
                                })
                                .style("stroke-width", 1)
                                .style("stroke", "#bbb")
                                .style("fill", "none");  
                    });
        
                }
            });

        });

    },

    /**
     * Static timeline circle that focuses specifically
     * on the Twins in COE (=> not reusable, included for 
     * illustrative purposes)
     * 
     * @param  {string} element [description]     
     */
    drawTimelineCircle: function(element)
    {

        if(_.isUndefined(element)){
            element = 'full-timeline-circle';  
        } 

        if($('#'+ element).length <= 0){
            return;
        }

        var margin = {top: 20, right: 40, bottom: 40, left: 20},
            width = $('#'+ element).width() - margin.left - margin.right,
            height = $('#'+ element).height() - margin.top - margin.bottom;
            
            // if(width > height){
            //     width = height;
            // }

            radiusOuter = (width / 2) - 200 ,
            radiusInner = (radiusOuter - 100)
            cx = (width / 2 ) + margin.left,
            cy = (height / 2) + (margin.top * 4);


        var dataOuter = [];
        var dataInner = [];


        _.each(Personae.playData, function(value, key){
            var tmp = {
                'act': value.act,
                'start_line': value.data[0].line,
                'end_line': value.data[ value.data.length - 1].line
            };
            dataOuter.push(tmp);

            _.each(value.data, function(v){
                dataInner.push(v);
            });
        });
        


        var circleScale = d3.scaleLinear()
            .domain([0, d3.max(dataOuter, function(d){return +d.end_line; })])
            .range([0, 360]);


        var vis = d3.select('#'+ element).append('svg')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);


        vis.append('g')
          .selectAll("g")
            .data([1])
            .enter()
                .append('circle')
                .attr('class', 'outerCircle')
                .attr('r', radiusOuter)
                .attr('cx', cx)
                .attr('cy', cy); 
        

        vis.append('g')
            .selectAll('.actMarkers')
            .attr('class', 'actMarkers')
            .data(dataOuter)
            .enter().append('circle')
                .attr('class', 'actMarker')
                    .attr('r', 5)
                    .attr('cx', function(d){
                        return cx + (radiusOuter * Math.sin( Math.floor(circleScale(d.start_line)) * (Math.PI / 180) ));
                    })
                    .attr('cy', function(d){
                        return cy - (radiusOuter * Math.cos( Math.floor(circleScale(d.start_line)) * (Math.PI / 180) ));
                    })
                    .attr('style', '')
                    .attr('fill', '#f60');


        vis.selectAll('g.column-label-set')
            .attr('class', 'column-label-set')
            // .attr('transform', 'translate('+ 0 +',' + (verticalOffset / 2) + ')')
            .data(dataOuter)
                .enter()
                .append('text')
                    .attr('transform', function(d, i){
                        return 'translate(' + (cx + ((radiusOuter + 20) * Math.sin( Math.floor(circleScale(d.start_line)) * (Math.PI / 180) ))) + ', '+ (cy - ((radiusOuter + 20) * Math.cos( Math.floor(circleScale(d.start_line)) * (Math.PI / 180)))) + ')';                
                    }) 
                    .attr('class', 'column-label')
                    .attr('text-anchor', 'middle')
                    .text(function(d){
                        return 'Act ' + d.act
                    });     

        vis.append('g')
             // .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')                
                  .selectAll("g")
                    .data([1])
                    .enter()
                        .append('circle')
                        .attr('class', 'innerCircle')
                        .attr('r', radiusInner)
                        .attr('cx', cx)
                        .attr('cy', cy);


        var speakers = _.filter(dataInner, function(value){
            
            return value.type === 'speaker';
        
        });

        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.who_id + ' ('+ d.name + ') <br/> <small>Line number:' + d.line + '</small>'; });

        vis.append('g')
            .selectAll('.speakerMarkers')
            .attr('class', 'speakerMarkers')
                .data(speakers)
                .enter().append('circle')
                    .attr('class', 'speaker')
                    .attr('r', '5')
                    .attr('cx', function(d){
                        return cx + (radiusInner * Math.sin( Math.floor(circleScale(d.line)) * (Math.PI / 180) ));
                    })
                    .attr('cy', function(d){
                        return cy - (radiusInner * Math.cos( Math.floor(circleScale(d.line)) * (Math.PI / 180) ));
                    })
                    .attr('fill', function(d){
                        var colour;
                        switch(d.who_id){
                            case 'Antipholus_Ephesus':
                                colour = 'steelblue';
                                break;
                            case 'Antipholus_Syracuse':
                                colour = 'green';
                                break;
                            case 'Dromio_Ephesus':
                                colour = 'yellow';
                                break;
                            case 'Dromio_Syracuse':
                                colour = '#f60';
                                break;
                            default:
                                colour = '#eee';
                        }

                        return colour;
                    })
                    .on('mouseover', function(d){
                        tip.show(d); 
                        // mouseoverC(d);
                    })
                    .on('mouseout', function(d){
                        tip.hide(d); 
                        // mouseoutC(d);
                    });                  

        var legendData = [{
                speaker: 'Antipholus_Ephesus',
                colour: 'steelblue'
            },
            {
                speaker: 'Antipholus_Syracuse',
                colour: 'green'
            },
            {
                speaker: 'Dromio_Ephesus',
                colour: 'yellow'
            },
            {
                speaker: 'Dromio_Syracuse',
                colour: '#f60'
            }];

        vis.selectAll('.legend')
            .append('g')
            .attr('class','legend')
            // .selectAll('g.legend')
            .attr('transform', 'translate(10,0)')
            .data(legendData)
            .enter().append('rect')
                .attr('class', 'legend-entry')
                .attr('fill', function(d){
                    return d.colour;
                })
                .attr('width', 10)
                .attr('height', 10)
                .attr('x', 0)
                .attr('y', function(d, i){
                    return (i + 10) * 15;
                });

        vis.selectAll('.legend')
            .append('g')
                .attr('class', 'legend-entries')       
                .attr('transform', 'translate(10,0)')     
            .data(legendData)
            .enter().append('text')
                .attr('x', 20)
                .attr('y', function(d, i){
                    return (i + 10) * 16;
                })
                .text(function(d){
                    return d.speaker;
                })
                    .attr('font-size', '10');



        vis.call(tip);

        function mouseoverC(el) {
            console.log(el);
            d3.select(el).transition()
                .duration(750)
                .attr("r", function(d){
                    console.log(d);
                    return d.radius*3
                });
        }

        //hover opposite, to bring back to its original state 
        function mouseoutC(el) {
            d3.select(el).transition()
                .duration(750)
            .attr("r", function(d){return d.radius});
        }

    },

    /**
     * Act delimited non-interactive timeline showing
     * characters stage entry, speaking, mentions and 
     * stage exit. 
     *
     * This is controlled via the jQuery code for Tab 
     * Selection -> the selected tab passes in an act
     * number, which re-draws the timeline
     *
     * -> included for illustrative purposes only
     * 
     * @param  {string} element    
     * @param  {string} act_number 
     */
    drawTimeline: function(element, act_number)
    {

        if($('#'+ element).length <= 0){
            return;
        }

        $('#'+ element).empty();

        var act = _.findWhere(Personae.playData, {act: act_number});
        
        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.name; });

        var line_numbers,
            stage_enterances = [],
            speaker_list = [],
            mentions = [],
            stage_exit = [],
            column_labels = ['Line Number', 'Stage Entrance', 'Speaker', 'Mentions', 'Stage Exit'];


        
        var margin = {top: 20, right: 80, bottom: 30, left: 20},
            width = $('#'+ element).width() - margin.left - margin.right,
            height = $('#'+ element).height() - margin.top - margin.bottom;

            var axisPlacement = 20;
            var colPlacements = (width - axisPlacement) / 4,
            offset = -10,
            verticalOffset = 70;


        var act_chart = d3.select('#'+ element).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var lines = _.pluck(act.data, 'line');
        
        // person colours
        

        // line number scale
        var linesScale = d3.scaleLinear()
                .domain([d3.min(lines), d3.max(lines)])
                .range([0, height - 20 ]);

        // Axis
        var axis = d3.axisLeft(linesScale)
                    .ticks(10)
                    .tickPadding(5);
        

        // -------------------------------------------
        //  Column Headings 
        // -------------------------------------------
        act_chart.selectAll('g.column-label-set')
            .attr('class', 'column-label-set')
            .attr('transform', 'translate('+ 0 +',' + (verticalOffset / 2) + ')')
            .data(column_labels)
                .enter()
                .append('text')
                    .attr('transform', function(d, i){
                        return 'translate(' + (colPlacements * i) + ', '+ (verticalOffset / 2) + ')';                
                    }) 
                    .attr('class', 'column-label')
                    .text(function(d){
                        return d;
                    });     


        // Append Axis
        act_chart.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate('+ axisPlacement +',' + verticalOffset + ')')
                .call(axis);


        // -------------------------------------------
        //  Stage entrances 
        // -------------------------------------------
            var ent_list = _.filter(act.data, function(value){
                return value.type === 'stage_enter';
            });

            var line_number;

            // Need single dim Array for d3 [{person: .. , line: }]
            if( _.isArray(ent_list)){

                _.each(ent_list, function(listing, key, list){
                    
                    line_number = +listing.line;
                    offset = -10;

                    _.each(listing.people, function(value, key, list){
                        stage_enterances.push({
                            line: line_number,
                            horizOffset: (offset += 10),
                            name: value.name
                        });
                    });
                });

            }else{
                line_number = +ent_list.line;
                
                _.each(ent_list.people, function(value, key, list){
                
                    stage_enterances.push({
                        line: line_number,
                        horizOffset: (offset += 10),
                        name: value.name
                    });
                });

            }

            // console.log(stage_enterances);
            
            act_chart.selectAll('g.enterances')
                        // .append('g')
                        .attr('class', 'stage_enterance')
                        .attr('transform', 'translate(' + (colPlacements + axisPlacement) +','+ verticalOffset +')')
                        .text('Stage Enter')
                            .attr('class', 'col-label')
                    .data(stage_enterances)
                        .enter().append('circle')
                            .attr('class', 'person')
                            .style('fill', function(d){
                                return Personae.colourName(d.name);
                            })
                            .attr('title', function(d){
                                return d.name;
                            })
                            .attr('r', 5)
                            .attr('cx', function(d){
                                return (colPlacements + 50) + d.horizOffset;
                            })
                            .attr('cy', function(d){
                                return linesScale(+d.line) + verticalOffset;
                            })
                            .on('mouseover', tip.show)
                            .on('mouseout', tip.hide);   


        //------------------------------
        //      Speakers
        //------------------------------
            speaker_list = _.filter(act.data, function(value){
                return value.type === 'speaker';
            });
            // console.log(speaker_list);


            act_chart.selectAll('g.speakers')
                // .append('g')
                .attr('class', 'speakers')
                .attr('transform', 'translate(' + ((colPlacements * 2 ) + axisPlacement) +','+ verticalOffset +')')
            .data(speaker_list)
                .enter().append('circle')
                    .attr('class', 'speaker')
                    .style('fill', function(d){
                        return Personae.colourName(d.name);
                    })
                    .attr('title', function(d){
                        return d.name;
                    })
                    .attr('r', 5)
                    .attr('cx', function(d){
                        return ((colPlacements * 2) + 50);
                    })
                    .attr('cy', function(d){
                        return linesScale(+d.line) + verticalOffset;
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);   


        //------------------------------
        //      Mentions
        //------------------------------
            _.each(speaker_list, function(speaker){
                
                _.each(speaker.mentions, function(person){
                
                    mentions.push({
                        line: person.line,
                        name: person.name,
                        mentioned_by: speaker.who_id
                    });
                });
                
            
            });
            // console.log(mentions);
             act_chart.selectAll('g.mentions')
                // .append('g')
                .attr('class', 'mention')
                .attr('transform', 'translate(' + ((colPlacements * 3) + axisPlacement) +','+ verticalOffset +')')
            .data(mentions)
                .enter().append('circle')
                    .attr('class', 'mention')
                    .style('fill', function(d){
                        return Personae.colourName(d.name);
                    })
                    .attr('title', function(d){
                        return d.name + '(by )' + d.who_id;
                    })
                    .attr('r', 5)
                    .attr('cx', function(d){
                        return ((colPlacements * 3) + 50);
                    })
                    .attr('cy', function(d){
                        return linesScale(+d.line) + verticalOffset;
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);   


        // ------------------------------------
        //     Stage Exit
        // ------------------------------------
            
            var stage_exit_full = _.filter(act.data, function(value){
                return value.type === 'stage_exit';
            });

            // console.log(stage_exit_full);
            _.each(stage_exit_full, function(listing, key, list){
                    
                line_number = +listing.line;
                offset = -10;

                _.each(listing.people, function(value, key, list){
                    stage_exit.push({
                        line: line_number,
                        horizOffset: (offset += 10),
                        name: value.name
                    });
                });

            });

            // console.log(stage_exit);

            act_chart.selectAll('g.exit')
                .attr('class', 'stage_exit')
                .attr('transform', 'translate(' + ((colPlacements * 4) + axisPlacement) +','+ verticalOffset +')')
            .data(stage_exit)
                .enter().append('circle')
                    .attr('class', 'person')
                    .style('fill', function(d){
                        return Personae.colourName(d.name);
                    })
                    .attr('title', function(d){
                        return d.name;
                    })
                    .attr('r', 5)
                    .attr('cx', function(d){
                        return ((colPlacements * 4) + 50) + d.horizOffset;
                    })
                    .attr('cy', function(d){
                        return linesScale(+d.line) + verticalOffset;
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);   


            act_chart.call(tip);

    },

    /**
     * Control function for the type of chart
     * we're going to draw (speaking | lines)
     * 
     * @param  {string} type [description]
     */
    chart: function(type)
    {
        if(_.isUndefined(type) || type === 'speaking'){
            Personae.speakingChart();
        }else{
            Personae.lineCountChart();
        }
    },

    /**
     * Format the data for the line-count chart (i.e.
     * how many lines a character speaks) and pass
     * it off to be drawn
     */
    lineCountChart: function()
    {
        // group metrics by person's name
        var groupByName = _.groupBy(Personae.metricsData, function(value){
            return value.person;
        });

        var data = [],
            dataUnsorted = [];

        _.each(groupByName, function(value, key){
            
            // total the number of lines they have
            var count = _.reduce(value, function(memo, v){
                return memo + v.line_count;
            }, 0);

            dataUnsorted.push({
                'variable_name': key,
                'total_count': +count,
                'data': value
            });
        });
        
        data = _.sortBy(dataUnsorted, 'total_count').reverse();

        Personae.drawChart(data, 'The number of lines each character speaks');
    },

    /**
     * Format the data for the Speaking chart (i.e.
     * how many times a character speaks) and pass
     * it off to be drawn
     */
    speakingChart: function()
    {
        var groupByName = _.groupBy(Personae.metricsData, function(value){
            return value.person;
        });

        var data = [],
            dataUnsorted = [];    

        _.each(groupByName, function(value, key){
            
            dataUnsorted.push({
                'variable_name': key,
                'total_count': +value.length,
                'data': value
            });
        });
        
        data = _.sortBy(dataUnsorted, 'total_count').reverse();

        Personae.drawChart(data, 'The number of times each character speaks');
    },

    /**
     * Draw the column chart for speakers.
     * 
     * @param  {array} data 
     * @param  {string} title 
     */
    drawChart: function(data, title)
    {
        var element = 'speakers-volume';

        var margin = {top: 20, right: 80, bottom: 140, left: 60},
            width = $('#'+ element).width() - margin.left - margin.right,
            height = $('#'+ element).height() - margin.top - margin.bottom;

        d3.select('#'+ element + ' svg').remove();

        var vis = d3.select('#'+ element).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('style', 'position:relative;')
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // line number scale
        var xScale = d3.scaleLinear()
                .domain([d3.max(data, function(d){ return +d.total_count; }), d3.min(data, function(d){ return +d.total_count; })])
                .range([0, height ]);
        
        var yScale = d3.scaleBand()            
                .domain(d3.set(data.map(function(d){return d.variable_name; })).values())
                .range([0, width]);
        
        // Axis
        var xAxis = d3.axisLeft(xScale)
                    .ticks(10)
                    .tickPadding(5);
                    
        var yAxis = d3.axisBottom(yScale)
                    .tickPadding(5);

        vis.append('g')
                .attr('class', 'axis x')
                .call(xAxis);

        vis.append('g')
                .attr('class', 'axis y')
                .attr('transform', 'translate(0,' + (height) + ')')                
                .call(yAxis)
                    .selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-45)" 
                        }
                    );;

        var div = d3.select("body").append("div")   
                    .attr("class", "tooltip")               
                    .style("opacity", 0);


        vis.selectAll('.bar')            
            .data(data)
            .enter().append('g')
                .append('rect')
                .attr('class', 'bar')
                .attr('x', function(d){ return yScale( d.variable_name); })
                .attr('y', function(d){ return xScale(+d.total_count); })
                .attr('height', function(d){ return height - xScale(d.total_count); })
                .attr('width', yScale.bandwidth())
                    .attr('fill', '#ddd')
                    .style('stroke', '#fff')
                    .on("mouseover", function(d) {      
                        div.transition()        
                            .duration(200)      
                            .style("opacity", .9);     
                        div .html( Personae.getFullName( d.variable_name) + ": "  + d.total_count)  
                            .style("left", (d3.event.pageX) + "px")     
                            .style("top", (d3.event.pageY - 28) + "px");    
                        })                  
                    .on("mouseout", function(d) {       
                        div.transition()        
                            .duration(500)       
                            .style("opacity", 0);   
                    });

         vis.selectAll(".bar g")
            .data(data)
            .enter()
            .append("text")
                .attr("y", function(d) { return xScale(+d.total_count) - 8; })
                .attr("x",  function(d) { return yScale(d.variable_name) + (yScale.bandwidth() / 3); })
                .attr("dy", ".35em")
            .text(function(d) { 
                return d.total_count;
            })
            .style("font-size", "11px")
            .style('fill', '#999');


        // labels
        vis.append('g')
            .attr('id', 'misc-labels');

         vis.select('#misc-labels')
                .append('text')
                    .attr('transform', function(d, i){
                        return 'translate(' + (width / 2) + ', ' + 0 +')' ;                
                    }) 
                    .attr('class', 'vis-label')
                    .attr('text-anchor', 'middle')
                    .text(title); 
    }
    

};

$(document).ready(function(){

    'use strict';
    
    $('#act-tabs a').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    });

    // Trigger Vis Update on tab change
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      
       var el = $(e.target).data('visactive');
       var act_number = '' + $(e.target).data('act');
       Personae.drawTimeline(el, act_number);
    });

    // Interaction on checkboxes
    $('#speaker-list').on('change', 'input:checkbox.speaker-filter', function(e){
        
        var selected = [];
        $('#speaker-list input:checked').each(function() {
            selected.push($(this).attr('value'));
        });
        
        Personae.activateSpeakers(selected);
    });

    // Toggle switch on checkboxes
    $('#speaker-list').on('click', 'a#toggle-filters', function(e){
        
        e.preventDefault();

        var selected = [];
        $('#speaker-list input:checked').each(function() {
            selected.push($(this).attr('value'));
        });
        console.log(selected);
        if(selected.length > 0){            
            $('input:checkbox.speaker-filter').prop('checked', false);
            Personae.activateSpeakers([]);
        }else{
            $('input:checkbox.speaker-filter').prop('checked', true);
            selected = [];
            $('#speaker-list input:checked').each(function() {
                selected.push($(this).attr('value'));
            });
            Personae.activateSpeakers(selected);
        }
    });

    // Switch between column chart types
    $('#speaker-chart-selection a').on('click', function(e){
        e.preventDefault();

        $('#speaker-chart-selection li').removeClass('active');
        $(this).parent('li').addClass('active');

        Personae.chart($(this).attr('id'));

    });

   

});

