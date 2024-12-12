const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");


const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory where the EJS templates will be located (optional, default is "views" folder)
app.set('views', path.join(__dirname, 'views'));

// Array to store form submissions
const submissions = [];

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS)
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, 'index.html'))
);

// Serve the test page
app.get('/Test', (req, res) => 
    res.sendFile(path.join(__dirname, 'test.html'))
);

app.get('/datascience', (req, res) => 
    res.sendFile(path.join(__dirname, 'ds.html'))
);

app.get('/artificialintelligence', (req, res) => 
    res.sendFile(path.join(__dirname, 'ai.html'))
);

app.get('/webdevelopment', (req, res) => 
    res.sendFile(path.join(__dirname, 'webdev.html'))
);

app.get('/softwaredevelopment', (req, res) => 
    res.sendFile(path.join(__dirname, 'softwaredev.html'))
);

app.get('/webdesign', (req, res) => 
    res.sendFile(path.join(__dirname, 'webdes.html'))
);

// Endpoint to evaluate form data and call Gemini AI
app.post('/evaluate', async (req, res) => {
    const formData = req.body;

    // Store form data in an array
    submissions.push(formData);

    // Initialize a dictionary to count occurrences of each key
    const keyCounts = {};
    let field_of_interest = '';
    let details = '';
    const knownTechnologies = formData.known_technologies
    // Count occurrences of each key from formData
    for (let key in formData) {
        if (formData.hasOwnProperty(key)) {
            const value = formData[key];
            if (!keyCounts[value]) {
                keyCounts[value] = 0;
            }
            keyCounts[value]++;
        }
    }

    // Find keys with the highest and second-highest counts
    let maxKey = '';
    let secondMaxKey = '';
    let maxCount = 0;
    let secondMaxCount = 0;

    for (let key in keyCounts) {
        if (keyCounts.hasOwnProperty(key)) {
            if (keyCounts[key] > maxCount) {
                secondMaxKey = maxKey;
                secondMaxCount = maxCount;
                maxKey = key;
                maxCount = keyCounts[key];
            } else if (keyCounts[key] > secondMaxCount) {
                secondMaxKey = key;
                secondMaxCount = keyCounts[key];
            }
        }
    }

    // Debugging to ensure maxKey and secondMaxKey are set properly
    console.log(`Max Key: ${maxKey}, Count: ${maxCount}`);
    console.log(`Second Max Key: ${secondMaxKey}, Count: ${secondMaxCount}`);

    // If the maxKey is 'no', use the second-highest key
    if (maxKey === 'no') {
        maxKey = secondMaxKey;
    }

    // Set field of interest and details based on maxKey
    if (maxKey === 'data_science') {
        field_of_interest = 'Data Science';
        details = "Data science is a multidisciplinary field that uses statistical methods...";
    } else if (maxKey === 'web_dev') {
        field_of_interest = 'Web Development';
        details = "Web development involves building and maintaining websites...";
    } else if (maxKey === 'software_dev') {
        field_of_interest = 'Software Development';
        details = "Software development is the process of designing and maintaining applications...";
    } else if (maxKey === 'web_design') {
        field_of_interest = 'Web Design';
        details = "Web designing is the process of creating visually appealing layouts for websites...";
    } else if (maxKey === 'ai_engineer') {
        field_of_interest = 'AI Engineer';
        details = "AI (Artificial Intelligence) refers to developing computer systems capable of tasks...";
    } else {
        console.log("No matching domain found");
        return res.status(400).send('Unable to determine your domain of interest.');
    }


try{
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `Provide an educational roadmap for ${field_of_interest} by considering the already known technoligies ${knownTechnologies} with free resources available in a html file format.
Make it look Fun and easy to understand and engaging to read. 
provide the free resources in a simple dark green colour .
dont include any explanation of code or how to use the code or anything related to the code.`;;


const result = await model.generateContent(prompt);
console.log(result.response.text());
res.send(result.response.text());
}
catch(error){
console.error('Error calling Gemini API:', error.message);
res.status(500).send('Error generating personalized roadmap.');

}});

// Starting server
app.listen(port, () => 
    console.log(`Example app listening on port ${port}!`)
);

