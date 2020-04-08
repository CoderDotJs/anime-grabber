'use strict';

const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

const searchURL = 'https://animeidhentai.com/search/';
const urlReg = /<a href="([^"]+)/;

function getHeaders() {
    return {
        'Referer': 'https://animeidhentai.com/',
        'User-Agent': 'Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
    }
}

async function search(query) {
    let searchResults = [];
    query = query.replace(' ', '+').toLowerCase();
    const search = `${searchURL}${query}`;
    const response = await cloudscraper.get(search, { headers: getHeaders() });
    const $ = cheerio.load(response);

    $('.movies-lst .hentai').each(function (ind, element) {
        const title = $(this).find('h2').text();
        const poster = $(this).find('img').attr('src');
        // Simply doing $(this).find('a') isn't working for some reason
        const [, url] = $(this).html().match(urlReg);
        searchResults.push({ title, url, poster });
    });

    return searchResults;
}

async function getAnime(url) {
    let episodes = [], page, $;
    if (!url.startsWith('https://animeidhentai.com/hentai/')) {
        page = await cloudscraper.get(url, { headers: getHeaders() });
        $ = cheerio.load(page);
        url = $('.entry-footer').find('a').last().attr('href');
    }
    page = await cloudscraper.get(url, { headers: getHeaders() });

    $ = cheerio.load(page);
    $('.hentai').each(function (ind, element) {
        const title = $(this).find('h2').text();
        const [, url] = $(this).html().match(urlReg);
        episodes.push({ title, url });
    });

    return episodes.reverse();
}

module.exports = {
    search,
    getAnime,
}