This is a thin wrapper around puppeteer, which gives a clean command line interface for creating PDFs of web pages using headless chrome.

It is meant to basically be a drop-in replacement for wkhtmltopdf or other command line HTML to PDF generators. It seems to generate PDFs essentially identical to what is printed from Chrome itself, and since the chromium team plans on keeping up headless chrome, this seems to be a good option that will stay stable into the future (unlike many PDF creation tools, which unfortunately, are difficult to maintain).

Once installed, simple command line usage is:

chromehtml2pdf --out=out.pdf https://wikipedia.org

to generate a PDF of that web page.

For local files use:

chromehtml2pdf --out=out.pdf file:///path/to/file/file.htm

There are a number of optional arguments for how to print (margins, page sizes, orientation, header/footer, etc.). To see all of the options, once installed type

chromehtml2pdf --help

This has been tested on Linux Ubuntu ^14.04.

Permissions issues:

When installing using npm install -g, I noticed that the chrome executables that come packaged with puppeteer are not executable by users who did not install it. You will notice this as an EACCES error (if it happens to you).

If you want something that can be used for all users on a system, then you can:

1) Pass --executablePath with some path to chrome/chromium that all users can run.

2) Change the permissions of the chrome installation that is in puppeteer. Currently, this is stored in <installation dir>/node_modules/puppeteer/.local-chromium/.

