import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY; // Ensure your .env file contains API_KEY=your_actual_key

type EAInput = {
    id: number | string;
    data: {
        chid: string;
    };
};

type EAOutput = {
    jobRunId: number | string;
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
    res.send("External adapter says hello");
});

app.post("/", async (req: Request, res: Response) => {
    const eaInputData: EAInput = req.body;
    console.log("Request data received:", eaInputData);

    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${eaInputData.data.chid}&key=${apiKey}`;

    let eaResponse: EAOutput = {
        jobRunId: eaInputData.id,
        data: {},
        statusCode: 0,
    };

    try {
        const apiResponse: AxiosResponse<YouTubeApiResponse> = await axios.get(url);

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
