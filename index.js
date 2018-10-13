// Make sure that the operator is concious and has inputed a file.
if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
}

// Read the file
var fs = require('fs');
var filename = process.argv[2];

fs.readFile(filename, 'utf8', function (err, data) {
    if (err) throw err;


    //create a object containing all the lines of the .mml file
    var lines = data.split("\r\n");


    //count the amount of sections
    var sectiontotal = 0;
    lines.forEach(element => {
        if (element.startsWith("[")) {
            sectiontotal++;
        }
    });
    sectiontotal = sectiontotal - 2


    //create a new array with the section data stored within
    var sectioncount = 0;
    var newpush = "";
    var sectionarr = [];
    lines.forEach(element => {
        if (element.startsWith("[")) {
            sectioncount++;
            if (sectioncount > 1) {
                sectionarr.push(newpush)
                newpush = "";
                //newpush = element + "\r\n"
            }
        } else {
            if (sectioncount > 1 && !element.startsWith("//") && element != "") {
                newpush += element.substr(11) + "\r\n"
            }
        }
    });
    sectionarr.shift();


    //create a singular xml string to be written to a file
    var xmlstring = "";
    var arrcount = 0;
    sectionarr.unshift("<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<ms2>\r\n	<melody>\r\n		<![CDATA[\r\n");
    for (i = 0; i < sectiontotal - 1; i++) {
        arrcount++;
        var insertposition = arrcount * 2;
        if (i < 1) {
            sectionarr.splice(insertposition, 0, "\r\n]]>\r\n</melody>\r\n	<chord index=\"" + arrcount + "\">\r\n		<![CDATA[\r\n")
        } else {
            sectionarr.splice(insertposition, 0, "\r\n]]>\r\n</chord>\r\n	<chord index=\"" + arrcount + "\">\r\n		<![CDATA[\r\n")
        }

    }
    sectionarr.push("\r\n]]>\r\n</chord>\r\n</ms2>")
    xmlstring = sectionarr.join("")


    //get file name (This is a mess I know)
    var filenamearr = filename.split("\\")
    var filenamewithoutanydir = filenamearr[filenamearr.length - 1].split(".")[0];
    var actualfilename = filenamewithoutanydir.substring(0, filename.length - 4) + ".ms2mml"

    
    //save file.
    fs.writeFile(__dirname + "/" + actualfilename, xmlstring, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log(actualfilename + " was saved!");
    });
});