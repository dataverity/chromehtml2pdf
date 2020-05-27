#!/usr/bin/env node

// Load packages that we need
const c = require('commander');
const p = require('puppeteer-core');

function parseBoolean(val) {
  return (val && (val=='1' || val.toLowerCase()=='true'));
}

c
  .version('0.1.0')
  //.usage('[options] <file or website...>')
  .arguments('<file>')
  .option('-o, --out <n>', 'Output file name.')
  .option('-s, --no-sandbox', 'Disable chrome sandbox.')
  .option('-t, --timeout <a>', 'Specify a timeout (in milliseconds).  Defaults to 30 seconds, pass 0 to disable timeout.', parseInt, 30000)
  .option('-j, --disable-javascript', 'Whether to disable JavaScript on the page.  Defaults to enabled.')
  .option('-p, --executable-path <value>', 'If you don\'t want to use the chromium that is packaged with puppeteer, enter the full path to the executable you want here.')
  .option(' --landscape <true|false>','Whether or not to print in landscape mode. Defaults to false.', parseBoolean)
  .option(' --displayHeaderFooter <true|false>','Display header and footer. Defaults to false.', parseBoolean)
  .option(' --printBackground <true|false>','Print background graphics. Defaults to false.', parseBoolean)
  .option(' --scale <n>','Scale of the webpage rendering. Defaults to 1.', parseFloat)
  .option(' --width <n>','Paper width with units. Defaults to 8.5 inches.', parseFloat)
  .option(' --height <n>','Paper height with units. Defaults to 11 inches.', parseFloat)
  .option(' --format <value>', 'Format of page. This takes precedence over height/width. Options are Letter: 8.5in x 11in\n'+
    'Legal: 8.5in x 14in\n'+
    'Tabloid: 11in x 17in\n'+
    'Ledger: 17in x 11in\n'+
    'A0: 33.1in x 46.8in\n'+
    'A1: 23.4in x 33.1in\n'+
    'A2: 16.5in x 23.4in\n'+
    'A3: 11.7in x 16.5in\n'+
    'A4: 8.27in x 11.7in\n'+
    'A5: 5.83in x 8.27in\n'+
    'A6: 4.13in x 5.83in\n')
  .option(' --marginTop','Top margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --marginBottom','Bottom margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --marginLeft','Left margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --marginRight','Right margin in inches. Defaults to 1cm (~0.4 inches).', parseFloat)
  .option(' --pageRanges','Paper ranges to print, e.g., \'1-5, 8, 11-13\'. Defaults to the empty string, which means print all pages.')
  // not supported by puppeteer
  //.option(' --ignoreInvalidPageRanges','Whether to silently ignore invalid but successfully parsed page ranges, such as \'3-2\'. Defaults to false.')
  .option(' --headerTemplate','HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: - date - formatted print date - title - document title - url - document location - pageNumber - current page number - totalPages - total pages in the document For example, would generate span containing the title.')
  .option(' --footerTemplate','HTML template for the print footer. Should use the same format as the `headerTemplate`.')
  // not supported by puppeteer
  //.option(' --preferCSSPageSize','Whether or not to prefer page size as defined by css. Defaults to false, in which case the content will be scaled to fit the paper size.')
  .action(function(file, config) {
    console.log('Converting file: %s', file);

    if (!config.out) {
      console.log("You need to include a parameter --out to hold the output file name.");
      process.exit(1);
    }

    let pdfOptions = {
      path: config.out,
      scale: config.scale,
      displayHeaderFooter: config.displayHeaderFooter,
      headerTemplate: config.headerTemplate,
      footerTemplate: config.footerTemplate,
      printBackground: config.printBackground,
      landscape: config.landscape,
      pageRanges: config.pageRanges,
      format: config.format,
      width: config.width,
      height: config.height,
    };

    if (config.marginTop || config.marginRight || config.marginBottom || config.marginLeft) {
      pdfOptions.margin = {
        top: config.marginTop,
        right: config.marginRight,
        bottom: config.marginBottom,
        left: config.marginLeft
      };
    }

    // Get the page to create the PDF.
    (async () => {
      try{
        var launchConfig = {};
        if (!config.sandbox) {
          console.log('Warning: running chrome without sandbox');
          launchConfig.args = ['--no-sandbox', '--disable-setuid-sandbox'];
        }

        if (config.executablePath){
          console.log('Using chrome executable: '+config.executablePath);
          launchConfig.executablePath = config.executablePath;
        }

        const browser = await p.launch(launchConfig);
        const page = await browser.newPage();

        page.setJavaScriptEnabled((config.disableJavascript) ? false : true);

        await page.goto(file, {
          timeout: config.timeout,
          waitUntil: 'networkidle0'
        });

        await page.pdf(pdfOptions);
        await browser.close();
      }
      catch(e){
        console.log(e);
        process.exit(1);
      }
    })();
  })
  .parse(process.argv);

//console.log(process.argv);
