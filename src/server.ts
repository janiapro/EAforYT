import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY;

type EAInput = {
    id: number | string;
    data: {
        chid: string;
        key: string;
    };
};

type EAOutput = {
    jobRunId: string | number;
    statusCode: number;
    data: {
        result?: {
            id: string;
            statistics: {
                subscriberCount: string;
            };
        };
    };
    error?: string;
};

// YouTube API Response Type
type YouTubeApiResponse = {
    kind: string;
    etag: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: {
        kind: string;
        etag: string;
        id: string;
        statistics: {
            subscriberCount: string;
        };
    }[];
};

const PORT = process.env.PORT || 8080;
const app: Express = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send("External adapter says yellow");
});

app.post("/", async (req: Request, res: Response) => {
    const eaInputData: EAInput = req.body;
    console.log("Request data received:", eaInputData);

    // Construct the URL with the API key as a query parameter
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${eaInputData.data.chid}&key=${apiKey}`;

    // Construct EA's response
    let eaResponse: EAOutput = {
        data: {},
        jobRunId: eaInputData.id,
        statusCode: 0,
    };

    try {
        // Make the request with axios
        const apiResponse: AxiosResponse<YouTubeApiResponse> = await axios.get(url);

        // Check if the apiResponse has the expected structure
        if (apiResponse.data && apiResponse.data.items && apiResponse.data.items.length > 0) {
            const channel = apiResponse.data.items[0];
            eaResponse.data.result = {
                id: channel.id,
                statistics: {
                    subscriberCount: channel.statistics.subscriberCount,
                },
            };
        }

        eaResponse.statusCode = apiResponse.status;
        console.log("Returned response", eaResponse);

        res.json(eaResponse);
    } catch (error: any) {
        console.log("API Response error", error);

        // Improve error handling by checking if error.response exists
        if (error.response) {
            eaResponse.error = error.message;
            eaResponse.statusCode = error.response.status;
        } else {
            eaResponse.error = "Internal Server Error";
            eaResponse.statusCode = 500;
        }

        res.json(eaResponse);
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});




/*import process from "process";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios, { AxiosResponse } from "axios";

type EAInput = {
    id: number | string;
    data: {
        chid: string;
        key: string; // Include API key in the input data
    };
};

type EAOutput = {
    jobRunId: string | number;
    statusCode: number;
    data: {
        result?: {
            items?: {
                id: string;
                statistics: {
                    subscriberCount: string;
                };
            }[];
        };
    };
    error?: string;
};

const PORT = process.env.PORT || 8080;
const app: Express = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send("External adapter says yellow");
});

app.post("/", async (req: Request, res: Response) => {
    const eaInputData: EAInput = req.body;
    console.log("Request data received:", eaInputData);

    // Construct the URL with the API key as a query parameter
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${eaInputData.data.chid}&key=${eaInputData.data.key}`;

    // Construct EA's response
    let eaResponse: EAOutput = {
        data: {},
        jobRunId: eaInputData.id,
        statusCode: 0,
    };

    try {
        // Make the request with axios
        const apiResponse: AxiosResponse = await axios.get(url);

        // Check if the apiResponse has the expected structure
        if (apiResponse.data) {
            eaResponse.data = { result: apiResponse.data };
        }

        eaResponse.statusCode = apiResponse.status;
        console.log("Returned response", eaResponse);

        res.json(eaResponse);
    } catch (error: any) {
        console.log("API Response error", error);

        // Improve error handling by checking if error.response exists
        if (error.response) {
            eaResponse.error = error.message;
            eaResponse.statusCode = error.response.status;
        } else {
            eaResponse.error = "Internal Server Error";
            eaResponse.statusCode = 500;
        }

        res.json(eaResponse);
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
*/