#Personae - A Character-Visualisation Tool for Dramatic Texts

Submitted for the [NVS Challenge, 2016](https://nvs.commons.mla.org/2015/10/14/the-new-variorum-shakespeare-digital-challenge/) - July, 2016

Created by [David Kelly](http://www.davidkelly.ie), [Justin Tonra](http://www.nuigalway.ie/our-research/people/humanities/justintonra) and [Lindsay Ann Reid](http://www.nuigalway.ie/our-research/people/humanities/lindsayreid) at the [Moore Institute](http://www.nuigalway.ie/mooreinstitute), [NUI Galway](http://www.nuigalway.ie).

##Objective

The aim of these visualisations is to use the [XML files from the New Variorum Shakespeare edition](https://github.com/mlaa/nvs-challenge) of The Comedy of Errors to create a resource for exploring patterns of speeches by and mentions of characters in Shakespeare’s work. Visualising the frequency, extent, and position of dialogue relating to a particular character presents users with a simple and immediate measure of that character’s prominence within the play. The tool enables users to select and visualise individual characters’ involvement, producing a novel means of exploring large-scale structural, narrative, or character-focused patterns within the text.

See a live demo and read about the development rationale at [http://www.davidkelly.ie/projects/personae](http://www.davidkelly.ie/projects/personae)


##Development Overview

The play-text XML is parsed using Python to extract a set of JSON files. These are used in a set of [D3.js](http://d3js.org)-based visualisations on the site's front-end.

###Usage

Here are some instructions if you want to build the visualisations from scratch:

####Backend

The Python script to process the XML relies on [lxml](http://lxml.de). The `data-processing/input` directory contains the [NVS repository files](https://github.com/mlaa/nvs-challenge).

The default play to process is _The Comedy of Errors_ - you can change this to _The Winter's Tale_ by editing the `play_prefix` variable at the top of the `data-processing/personae.py` file.

Running `python personae.py` in `data-processing/` will output a set of JSON files to `frontend/app/data`. It will also output a `.csv` file to `data-processing/output` containing a count of unique `<name></name>`s found, should you wish to identify locations to geo-code (this isn't handled by the software).

####Front-end requirements

The front-end of the site uses D3 (v4.1.1) for data visualisation, Leaflet.js for mapping, as well as Underscore and Bootstrap (v3.3.6) (LESS).

Building the front-end depends on [Grunt](http://gruntjs.com) and [Bower](https://bower.io/).

Assuming these are installed, to install the project requirements run: 

    
    npm install
    bower install
    

To build a production version of the front-end, run:


    grunt


...this will output the production files to `frontend/personae/`.

To serve a preview of the front-end at http://localhost:9000/, run:


    grunt serve

...this will automatically open the preview site in your browser.


##Issues or Contributions

Bug fixes or suggested improvements are welcome via the issues section, or as a pull-request.
