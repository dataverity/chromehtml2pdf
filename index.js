#!/usr/bin/env node

// Load packages that we need
const c = require('commander');
const p = require('puppeteer');

var args = {
    out: {
	pass: true,
	configName: 'path',
	desc: 'Output file name.'
    },
    executablePath: {
	desc: 'If you don\'t want to use the chromium that is packaged with puppeteer, enter the full path to the executable you want here.'
    },
    landscape: {
	pass: true,
	isBool: true,
	desc: 'Whether or not to print in landscape mode. Defaults to false.'
    },
    displayHeaderFooter: {
	pass: true,
	isBool: true,
	desc: 'Display header and footer. Defaults to false.'
    },
    printBackground: {
	pass: true,
	isBool: true,
	desc: 'Print background graphics. Defaults to false.'
    },
    scale: {
	pass: true,
	isFloat: true,
	desc: 'Scale of the webpage rendering. Defaults to 1.'
    },
    width: {
	pass: true,
	desc: 'Paper width with units. Defaults to 8.5in.'
    },
    height: {
	pass: true,
	desc: 'Paper height with units. Defaults to 11in.'
    },
    format: {
	pass: true,
	desc: 'Format of page. This takes precedence over height/width. Options are Letter: 8.5in x 11in\n'+
	'Legal: 8.5in x 14in\n'+
	'Tabloid: 11in x 17in\n'+
	'Ledger: 17in x 11in\n'+
	'A0: 33.1in x 46.8in\n'+
	'A1: 23.4in x 33.1in\n'+
	'A2: 16.5in x 23.4in\n'+
	'A3: 11.7in x 16.5in\n'+
	'A4: 8.27in x 11.7in\n'+
	'A5: 5.83in x 8.27in\n'+
	'A6: 4.13in x 5.83in\n'
    },
    marginTop: {
	desc: 'Top margin with units. Defaults to 1cm (~0.4 inches).'
    },
    marginBottom: {
	desc: 'Bottom margin with units. Defaults to 1cm (~0.4 inches).'
    },
    marginLeft: {
	desc: 'Left margin with units. Defaults to 1cm (~0.4 inches).'
    },
    marginRight: {
	desc: 'Right margin with units. Defaults to 1cm (~0.4 inches).'
    },
    pageRanges: {
	pass: true,
	desc: 'Paper ranges to print, e.g., \'1-5, 8, 11-13\'. Defaults to the empty string, which means print all pages.'
    },
    /* not supported by puppeteer
    ignoreInvalidPageRanges: {
	'Whether to silently ignore invalid but successfully parsed page ranges, such as \'3-2\'. Defaults to false.'
    },*/
    headerTemplate: {
	pass: true,
	desc: 'HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: date - formatted print date; title - document title; url - document location; pageNumber - current page number; totalPages - total pages in the document. For example, <span class="title"></span> would generate a span containing the title. Make sure margins are such that the header will fit on the page. You may also need to explicity use CSS to set the font-size.'
    },
    footerTemplate: {
	pass: true,
	desc: 'HTML template for the print footer. Should use the same format as the `headerTemplate`. See there for more information.'
    }/* not supported by puppeteer,    
    preferCSSPageSize: {
	'Whether or not to prefer page size as defined by css. Defaults to false, in which case the content will be scaled to fit the paper size.'
    }*/,
	delayBeforePrint: {
		desc: 'Delay in milliseconds after page load. Use it if you need for your scripts to finish.',
	}
};

c.arguments('<file>');
for(var i in args){
    c.option('--'+i+' <'+i+'>',args[i].desc);
}
c.action(function(file){

    console.log('Converting file: '+file);

    // Prepare the config object            
    var config = {};

    // Get the things that pass through.
    for(var i in args){
	var obj = args[i];
	if(obj.pass && c[i]){
	    var val = c[i];
	    if(obj.isFloat){
		val = parseFloat(val);
	    }
	    if(obj.isBool){
		val = (val=='1' || val.toLowerCase()=='true');
	    }
	    var outKey = obj.configName || i;
	    config[outKey] = val;
	    console.log(i+' = '+val);
	}
    }

    if(!config.path){
	console.log("You need to include a parameter --out to hold the output file name.");
	process.exit(1);
    }
    
    // Get the margins
    config.margin = {};
    if(c.marginTop){
	console.log('marginTop = '+c.marginTop);
	config.margin.top = c.marginTop
    }
    if(c.marginRight){
	console.log('marginRight = '+c.marginRight);
	config.margin.right = c.marginRight
    }
    if(c.marginBottom){
	console.log('marginBottom = '+c.marginBottom);
	config.margin.bottom = c.marginBottom
    }
    if(c.marginLeft){
	console.log('marginLeft = '+c.marginLeft);
	config.margin.left = c.marginLeft
    }

    function delay(time) {
		return new Promise(function(resolve) {
			setTimeout(resolve, time)
		});
	}

    // Get the page to create the PDF.
    (async () => {
	try{
	    var launchConfig = {};
	    if(c.executablePath){
		console.log('Using chrome executable: '+c.executablePath);
		launchConfig.executablePath = c.executablePath;
	    }
	    const browser = await p.launch(launchConfig);
	    const page = await browser.newPage();
	    await page.goto(file, {waitUntil: 'networkidle0',timeout:0});
		if (c.delayBeforePrint) {
			if (!isNaN(c.delayBeforePrint)) {
				console.log("Waiting " + parseInt(c.delayBeforePrint).toString() + " milliseconds")
				await delay(parseInt(c.delayBeforePrint))
			} else {
				console.log("Delay must be a integer number.")
			}
		}
	    await page.pdf(config);	
	    await browser.close();
	}
	catch(e){
	    console.log(e);
	    process.exit(1);
	}
    })();
    
}).parse(process.argv);

// console.log(process.argv);
