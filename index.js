const core = require('@actions/core');
const puppeteer = require('puppeteer');
const Path = require('path');
const fs = require('fs');

// Puppeteer configuration
const configuration = {
    headless: true, // true: headless mode, false: display browser
    defaultViewport: {
        width: 1600,
        height: 1200
    },
    args: [
        '--no-sandbox', // Avoid the impact of security restrictions (for CI environments)    
        '--disable-setuid-sandbox'
    ]
};

const url = 'https://developer.apple.com/app-store/review/guidelines';
const filePath = 'html/guidelines.html';

(async () => {
    try {
        const browser = await puppeteer.launch(configuration);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const stream = await page.$eval(
            'main',
            el => el.innerHTML.replace(/\t/g, '')
        );
        await browser.close();
        write(filePath, stream);
    } catch (error) {
        core.setFailed(`Scraping failed with error ${error}`);
    }
})();

function write(filePath, stream) {
    try {
        fs.writeFileSync(Path.join(__dirname, filePath), stream, { flag: 'w+' });
    } catch(error) {
        core.setFailed(`Creating file failed with error ${error}`);
    }
}