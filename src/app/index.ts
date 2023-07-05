import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import {
    JsonListKeysTool,
    JsonGetValueTool,
    RequestsGetTool,
} from "langchain/tools";
import { BigQuery } from "@google-cloud/bigquery";
import { buildSqlQuery } from "./tools/buildSQL";
import { BigQueryTool } from "./tools/BigQueryTool";
import dotenv from 'dotenv';

dotenv.config();

import * as path from 'path';

const filePath = path.resolve(__dirname, '../../../../../everipedia.json');


const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY || '',
    modelName: "gpt-3.5-turbo",
});

class CustomRequestGetTool extends RequestsGetTool {
    description =
        "An api request proxy, Use this when you need to get specific content from an api. Input should be a url mentioned before.";
}

async function main() {
    const tools = [
        /* await AIPluginTool.fromPluginUrl(
          "https://plugin-ai.vercel.app/.well-known/ai-plugin.json"
        ),
        new CustomRequestGetTool(),*/
        new BigQueryTool(),
    ];


    const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "zero-shot-react-description",
        verbose: true,
        maxIterations: 2, // Only fixed iterations are allowed so agent don't go crazy
    });

    const inputArgument = "list of top 10 ethereum addresses ordered by balance";
    const sqlQuery = await buildSqlQuery(inputArgument).catch((error) => {
        console.error("Error building SQL query:", error);
    });
    console.log(sqlQuery)

    const bigquery = new BigQuery({
        projectId: "nebula-306510",
        keyFilename: filePath,
    });
    try {
        const options = {
            query: sqlQuery,
            location: "US",
        };
        const rows = await bigquery.query(options);
        // return rows;
    } catch (error) {
        console.error("Error running query:", error);
    }

    // const result = await executor.call({
    //     input: sqlQuery,
    // });

    console.log(`🗿 Output: ${rows}`);
}

main();


// "list the token transfers from 0xcd65cd5911ebf35c9cc2897358dae30a378d851e Ethereum address, convert to simple list",
// "list of top 10 ethereum addresses ordered by balance. convert to simple list",
//  "list of unique smart contract bytecodes, convert to simple list",
// "number of ethereum addresses with more than 1 eth",
