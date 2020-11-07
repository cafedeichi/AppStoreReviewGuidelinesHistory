const core = require('@actions/core');
const Nightmare = require('nightmare');
const Path = require('path');
const cheerio = require('cheerio');
const fs = require('fs');

const nightmare = Nightmare({
    show: false,
    width: 1600,
    height: 1200
});
const url = 'https://developer.apple.com/app-store/review/guidelines';
const filePath = 'html/guidelines.html';

nightmare
    .goto(url)
    .wait('body')
    .evaluate(() => document.querySelector('body').innerHTML)
    .end()
    .then( response => {
        write(filePath, getData(response));
    }).catch(error => {
        core.setFailed(`Data Fetching failed with error ${error}`);
    });

function getData(html) {
    try {
        const $ = cheerio.load(html);
        return $(`main`).html().replace(/\t/g, '');
    } catch(error) {
        core.setFailed(`Scraping failed with error ${error}`);
    }
}

function write(filePath, stream) {
    try {
        fs.writeFileSync(Path.join(__dirname, filePath), stream, { flag: 'w+' });
    } catch(error) {
        core.setFailed(`Creating file failed with error ${error}`);
    }
}