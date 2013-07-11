#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
   var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

// accepts a file path and returns the file html string
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlUrl = function(url) {
    return cheerio.load(url);
};

// accepts a url and returns the html string
var restlerHtmlUrl = function(htmlurl) {
    rest.get(htmlurl).on('complete', function(result) {
        if (result instanceof Error) {
            console.log('Error: ' + result.message);
            process.exit(1); 
        } else {
            return result;
        }
    });
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlString = function(htmlstring, checksfile) {
    $ = htmlstring;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    //Workaround for commander.js issue
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var finishup = function(checkJson) {
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url_file>', 'URL to index.html')
        .parse(process.argv);

    if (program.file) {
        console.log('-u: ' + program.url);
        console.log('-f: ' + program.file);
        var htmlstring = cheerioHtmlFile(program.file);
        console.log('htmlstring: ' + htmlstring);
        var checkJson = checkHtmlString(htmlstring, program.checks);
        finishup(checkJson);

    } else if (program.url) {
        console.log('-u: ' + program.url);

        var getHtml = function(response, status) {
            if (response instanceof Error) {
                console.log('Error: ' + response.message);
                process.exit(1);
            } else {
                //console.log('Response: ' + response);
                var htmlstring = cheerioHtmlUrl(response);
                var checkJson = checkHtmlString(htmlstring, program.checks);
                finishup(checkJson);
            }
        };
        rest.get(program.url).on('complete', getHtml);

        //var htmlString = rest.get(program.url).on('complete', getHtml);
        //var checkJson = checkHtmlString(htmlstring, program.checks);
        //finishup(checkJson);
    } else {
        process.exit(1);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrl = checkUrl;
}

