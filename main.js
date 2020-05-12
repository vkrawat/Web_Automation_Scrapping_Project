let puppeteer = require("puppeteer");
let fs = require("fs");
let cFile = process.argv[2];


(async function () {

    try {
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"]
        });

        let tabs = await browser.pages();
        let tab = tabs[0];

        await tab.goto("https://www.google.com", { waitUntil: "networkidle2" });
        await tab.waitForSelector("input[type=text]");
        await tab.type("input[type=text]", "goodmorningquotes.com positive thoughts", { delay: 120 });
        await tab.keyboard.press("Enter");

        await tab.waitFor(1000);


        await tab.goto("https://www.goodmorningquote.com/positive-thoughts/", { waitUntil: "load", timeout: 0 });


        var result = await tab.evaluate(() => {
            let result = []
            let titleNodeList = document.querySelectorAll("h3");
            for (var i = 0; i < 10; i++) {
                let s = titleNodeList[i].innerText;
                if (s[1] === '.')
                    result[i] = s.substring(3)
                else
                    result[i] = s.substring(4)

            }
            return result
        })


        // console.log(result);

        await fs.writeFile(

            'result.json',

            JSON.stringify(result),

            function (err) {
                if (err) {
                    console.error('Crap happens');
                }
            }
        );

        console.log("data scrapped")

        await tab.goto("https://www.google.com", { waitUntil: "networkidle2" });
        await tab.waitForSelector("input[type=text]");
        await tab.type("input[type=text]", "pixabay.com nature pics", { delay: 120 });
        await tab.keyboard.press("Enter");

        await tab.waitFor(1000);

        await imagesScrapper(tab,0);
        console.log("images scrapped")

        let data = await fs.promises.readFile(cFile);
        let { url, pwd, user } = JSON.parse(data);

        await tab.goto("https://www.google.com", { waitUntil: "networkidle2" });
        await tab.waitForSelector("input[type=text]");
        await tab.type("input[type=text]", "twitter login", { delay: 120 });
        await tab.keyboard.press("Enter");

        await tab.waitFor(1000);

        await tab.goto(url, { waitUntil: "networkidle2" });
        await tab.waitForSelector("input[type=text]");
        await tab.type("input[type=text]", user, { delay: 120 });
        await tab.type("input[type=password]", pwd, { delay: 120 });

        await Promise.all([
            tab.click(".css-901oao.r-1awozwy.r-jwli3a.r-6koalj.r-18u37iz.r-16y2uox.r-1qd0xha.r-a023e6.r-vw2c0b.r-1777fci.r-eljoum.r-dnmrzs.r-bcqeeo.r-q4m81j.r-qvutc0"), tab.waitForNavigation({
                waitUntil: "networkidle2"
            })
        ])

        await twitter(tab, result, 0)
        console.log("Tweet has been posted successfully.");

    }
    catch (err) {
        console.log(err);
    }

})();


async function twitter(tab, result, indx) {
    if (indx == result.length) return;

    try {


        await tab.waitForSelector('.DraftEditor-editorContainer');
        await tab.click('.DraftEditor-editorContainer');


        await tab.keyboard.type(result[indx], { delay: 120 });

        // let [filechooser]=await Promise.all([
        //     // await tab.waitForFileChooser(),
        //     await tab.waitForSelector("input[type=file]"),
        //     await tab.click("input[type=file]"), tab.waitForNavigation({
        //         waitUntil: "networkidle2"
        //     })
        // ]);

        // await filechooser.accept(["C:/Users/vinod/Desktop/das.jpeg"]);
        let elementHandle = await tab.$("input[type=file]");
        await elementHandle.uploadFile('./photos/' + indx + '.jpeg');
        // await elementHandle.click()

        await tab.evaluate(async () => {
            await new Promise(function (resolve) {
                setTimeout(resolve, 2000)
            });
        });

        await tab.click(".css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-1n0xq6e.r-1vuscfd.r-1dhvaqw.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr"), tab.waitForNavigation({
            waitUntil: "networkidle2"
        })

        await tab.evaluate(async () => {
            await new Promise(function (resolve) {
                setTimeout(resolve, 20000)
            });
        });

        tab.reload();
        await twitter(tab, result, indx + 1)

    }
    catch (err) {
        // await tab.reload();
        // await twitter(tab, result, indx);
    }
};


async function imagesScrapper(tab, indx) {
    if (indx == 10) return;

    try {



        tab.goto("https://pixabay.com/images/search/natural/", { waitUntil: 'load', timeout: 0 })



        await tab.waitForSelector(".flex_grid.credits.search_results div a img");
        let images = await tab.$$(".flex_grid.credits.search_results div a img");

        let a = await tab.evaluate(async function (el) {

            return await el.getAttribute("src");
        }, images[indx]);


        let download = require('image-downloader')

        const options = {
            url: a,
            dest: './photos/' + indx + '.jpeg'
        }

        await download.image(options)
            .then(({ filename }) => {
                console.log('Saved to', filename)
            })
            .catch((err) => console.error(err));


        await imagesScrapper(tab, indx + 1);
    }
    catch (err) {
        console.log(err);
    }
};
