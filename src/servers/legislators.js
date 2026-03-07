import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import express from 'express';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router(); // Create a new router instance

// "2026R1" began on Feb. 2, 2026.
const LEGISLATIVE_SESSION_CODE = "2026R1";



router.get("/legislators/:type", async (req, res) => {

    // If the important json file already exists skip all this below and return the json file
    let json;
    let fileExists = fs.existsSync(`./dist/data/legislators.json`);


    json = fileExists ? JSON.parse(fs.readFileSync(`./dist/data/legislators.json`, 'utf-8')) : await slowLoadData(LEGISLATIVE_SESSION_CODE);


    let filtered = json.filter(leg => leg.Chamber == (req.params.type == "senators" ? "S" : "H"));

    console.log(filtered);

    res.json(filtered.sort((a, b) => {
        return parseInt(a.DistrictNumber) - parseInt(b.DistrictNumber);
    }));
});



async function slowLoadData(session) {


    // With parser
    var parser = new xml2js.Parser({
        trim: false,          // Do not trim whitespaces
        explicitCharkey: true // Force _ key for text nodes
    });
    let legislators;
    let fileExists = fs.existsSync('./dist/data/legislators.xml');
    legislators = fileExists ? fs.readFileSync('./dist/data/legislators.xml', 'utf-8') : await fetch("https://api.oregonlegislature.gov/odata/ODataService.svc/Legislators").then(res => res.text());
    let result = await parser.parseStringPromise(legislators);
    // res.json(result);




    let all = result.feed.entry.map(leg => {
        let content = leg.content[0];
        let properties = content["m:properties"][0];

        if (!properties) return {};
        // console.log(properties);

        let webSiteUrl = properties["d:WebSiteUrl"][0]._;
        // console.log("WebSiteUrl:", webSiteUrl)._;
        let legislatorCode = properties["d:LegislatorCode"][0]._;
        let firstName = properties["d:FirstName"][0]._;
        let lastName = properties["d:LastName"][0]._;
        let sessionKey = properties["d:SessionKey"][0]._;
        let districtNumber = properties["d:DistrictNumber"][0]._;
        let emailAddress = properties["d:EmailAddress"][0]._;
        let title = properties["d:Title"][0]._;
        let party = properties["d:Party"][0]._;
        let chamber = properties["d:Chamber"][0]._;



        // Compute the URL to the legislator's jpg image.
        let codeParts = legislatorCode.split(" ");
        let type = codeParts.shift();
        let code = codeParts.join();
        code = code.replace(/\,/g, "");
        code = webSiteUrl && webSiteUrl.split("/").pop();


        // Build the URL.

        let parts = ["https://www.oregonlegislature.gov"];
        parts = ["https://www.oregonlegislature.gov", code, "PublishingImages/member_photo.jpg"];


        let imageUrl = parts.join("/");

        return {
            FirstName: firstName,
            LastName: lastName,
            SessionKey: sessionKey,
            DistrictNumber: districtNumber,
            EmailAddress: emailAddress,
            Title: title,
            Party: party,
            Chamber: chamber,
            ImageUrl: imageUrl,
            WebSiteUrl: webSiteUrl
        };

    });


    // At least get current session legislators.
    let filtered = all.filter((leg) => leg.SessionKey.indexOf(session) !== -1);


    // Save the fetched data to a local file for future use if it doesn't already exist
    if (!fileExists)
    {
        fs.writeFileSync('./dist/data/legislators.json', JSON.stringify(filtered), 'utf-8');
    }

    if (!fileExists)
    {
        // Save the fetched data to a local file for future use
        fs.writeFileSync('./dist/data/legislators.xml', legislators, 'utf-8');
    }


    return filtered;
}

router.get("/legislators", async (req, res) => {

    const legislators = await fetch("https://api.oregonlegislature.gov/odata/ODataService.svc/Legislators").then(res => res.text());
    // With parser
    var parser = new xml2js.Parser(/* options */);
    let result = await parser.parseStringPromise(legislators);
    res.json(result);
});



export default router;
