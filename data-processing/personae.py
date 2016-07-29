# -------------------------------------------
#       Personae - A Character-Visualisation Tool for Dramatic Texts
#       
#       NVS Challenge - 2016
#       
#       Extract data from TEI XML markup of 
#           - The Comedy of Errors 
#           - The Winter's Tale
#
#       suitable for use in front-end data
#       visualisation
# 
# Author: David Kelly | @davkell 
# Author URL: http://www.davidkelly.ie 
# Date: 12/07/16
# -------------------------------------------

from lxml import etree
import json
import operator
import csv
import codecs

# Which play are you interested in taking data from?
# Can be 'coe' or 'wt'
play_prefix = 'coe' 


xml_input_file = 'input/xml/'+ play_prefix +'/'+ play_prefix +'_playtext.xml'

# Output JSON files are put in the frontend data 
# directory for use in web-based visualisation
people_json_file = '../frontend/app/data/'+ play_prefix +'-people.json'
metrics_json_file = '../frontend/app/data/'+ play_prefix +'-metrics.json'
castlist_json_file = '../frontend/app/data/'+ play_prefix +'-castlist.json'
scene_json_file = '../frontend/app/data/'+ play_prefix +'-scenes.json'

# CSV file for manual intervention on identifying Geographic data
name_count_output_csv_file = 'output/'+ play_prefix +'-name-data.csv'


namespaces = {'ns':'http://www.mla.org/NVSns'}


# --------------------------------------------------
#   Extract the acts, stage instructions, 
#   speakers and mentions from the XML file. 
#   
#   The heirarchy created is in the form: 
#        - Act
#           - Stage Enter
#               - People
#           - Speaker
#               - Mentioned
#           - Stage Exit
#                - People
#   
#   Output as a JSON file.
# --------------------------------------------------
def extract_people():
    # hold play data in the form [{act: n, data[]}, ...]
    play_data = []

    acts = root.findall("*//ns:div[@type='act']", namespaces=namespaces)

    for act in acts:

        # holds play segments, broken into acts
        play = {}
        play['act'] = act.attrib['n']
        play['data'] = []

        # Extract Stage Instructions
        stages = act.findall("*//ns:stage", namespaces=namespaces)        

        for stage in stages:
            temp = {}
            temp['people'] = []

            # Is there a preceding line number?
            try:
                temp['line'] = int(stage.xpath("preceding::ns:lb[@n]", namespaces=namespaces)[-1].get("n"))
            except IndexError:
                temp['line'] = None

            # Stage instruction type
            if 'enter' in stage.attrib['type']:
                temp['type'] = 'stage_enter'
            else:
                temp['type'] = 'stage_exit'
           

            # People in stage instructions...
            people = stage.findall("./ns:name", namespaces=namespaces)
            if people is not None and len(people) > 0:
                for person in people:
                    temp['people'].append(
                        {
                            'name': person.text
                        }
                    )

            play['data'].append(temp)

        # Extract the Speakers
        for sp in act.findall("*//ns:sp", namespaces=namespaces):
            temp = {}
            
            #speaker id
            temp['who_id'] = sp.attrib['who'].strip('#')
            temp['type']   = 'speaker'          # for use when filtering the data on the frontend

            try:
                temp['line'] = int(sp.xpath("preceding::ns:lb[@n]", namespaces=namespaces)[-1].get("n"))
            except IndexError:
                temp['line'] = None

            speaker = sp.find('./ns:speaker', namespaces=namespaces)
            if speaker is not None:
                # Speaker's name
                temp['name'] = speaker.text
                
            # What names do they mention when speaking?
            mentions = sp.findall("*//ns:name", namespaces=namespaces)
            if mentions is not None and len(mentions) > 0:
                temp['mentions'] = []
                for person in mentions:
                    try:
                        line = int(person.xpath("preceding::ns:lb[@n]", namespaces=namespaces)[-1].get("n"))
                    except IndexError:
                        line = None
                    
                    temp['mentions'].append({'name': person.text, 'line': line})


            play['data'].append(temp)
        
        play_data.append(play)

    # Output data as JSON
    with open(people_json_file, 'w') as outfile:
        json.dump(play_data, outfile, indent = 4)


# --------------------------------------------------
#   Output speaker metrics - these contain the number 
#   of times a character spoke, and the number of 
#   lines they spoke.
#   
#   Result is output as a JSON file
# --------------------------------------------------
def extract_metrics():
    data = []
    speakers = root.findall('*//ns:sp', namespaces=namespaces)
    # print 'Number of Speakers: ' + str(len(speakers))
    for s in speakers:

        temp = {}
        temp['person'] = s.attrib['who'].strip("#")
        line_count = s.xpath('count(.//ns:lb)', namespaces=namespaces)
        if( line_count == 0):
            line_count = 1
        temp['line_count'] = line_count

        try:
            temp['start_line'] = int(s.xpath("preceding::ns:lb[@n]", namespaces=namespaces)[-1].get("n"))
        except IndexError:
            temp['start_line'] = None

        data.append(temp)

    with open(metrics_json_file, 'w') as outfile:
        json.dump(data, outfile, indent = 4)


# --------------------------------------------------
#   Output <name> metrics - these contain a list 
#   of unique names in the XML, along with the number
#   of times they occurred. 
#   
#   Result is output as a CSV file
# --------------------------------------------------
def extract_names():
    data = []
    names = root.findall('*//ns:name', namespaces=namespaces)
    for name in names:
        data.append(name.text.encode('utf-8'))

    # print 'Number of names: ' + str(len(names))
    
    uniques = count_uniques(data)

    headers = ['origin', 'count']

    with open(name_count_output_csv_file, 'wb') as csvfile:
        writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        for row in uniques:
            writer.writerow(row)


# --------------------------------------------------
#   Output the cast list - this contains the xml:id
#   and the name of each character 
#   
#   Result is output as a JSON file
# --------------------------------------------------
def extract_cast_list():

    data = []
    cast = root.findall('*//ns:castList/*//ns:role', namespaces=namespaces)

    for c in cast:
        
        if c.text is None:
            name = c.attrib['{http://www.w3.org/XML/1998/namespace}id']
        else:
            name = ''.join(c.itertext())
        temp = {}

        temp['id'] = c.attrib['{http://www.w3.org/XML/1998/namespace}id']
        temp['name'] = name

        data.append(temp)

    with open(castlist_json_file, 'w') as outfile:
        json.dump(data, outfile, indent = 4)


# --------------------------------------------------
#   Output the Scene numbers - this contains the 
#   scene number, and the first line number in the 
#   scene. Used to create scene markers on the frontend
#   
#   Result is output as a JSON file
# --------------------------------------------------
def extract_scene_numbers():
    
    data = []
    scenes = root.findall("*//ns:div[@type='scene']", namespaces=namespaces)

    for scene in scenes:
        line = scene.find('ns:lb', namespaces=namespaces)
        tmp = {}
        
        tmp['scene'] = scene.attrib['n']
        tmp['line'] = int(line.attrib['n'])

        data.append(tmp)

        
    with open(scene_json_file, 'w') as outfile:
        json.dump(data, outfile, indent = 4)


# --------------------------------------------------
# Count unique occurrences of an item
# --------------------------------------------------
def count_uniques(data):    
    uniques = {location : data.count(location) for location in data }
    return sorted(uniques.items(), key=operator.itemgetter(1), reverse=True)



if __name__ == '__main__':

    tree = etree.parse(xml_input_file)
    root = tree.getroot()

    extract_people()
    extract_metrics()
    extract_names()
    extract_cast_list()
    extract_scene_numbers()

















