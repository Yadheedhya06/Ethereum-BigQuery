import { OpenAI } from "langchain/llms/openai";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const model = new OpenAI({
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY || '',
        modelName: "gpt-3.5-turbo",
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
            'You are a helpful assistant that buildes SQL quries by carefully observing Ethereum BigQuery database structure. The database structure is as follows -- database name is bigquery-public-data.crypto_ethereum and it has the following tables: \r\n\r\n1. crypto_ethereum.transactions\r\nThe transactions table has the normal Ethereum transactions, and if you need to find the internal transactions, you need to query the trace table.\r\n\r\nInternal transactions are not actually considered transactions, as they are not included directly in the blockchain. Instead can only be seen as a byproduct of having tracing on.\r\n\r\n2. crypto_ethereum.contracts\r\nNote \u2014 Don\u2019t have any unique key on contracts table\r\n\r\nContracts & Transactions\r\n\r\ncontracts.address can be fond transactions.to_address or transactions.receipt_contract_address.\r\n\r\ntransactions.to_address - Address of the receiver. null when its a contract creation transaction.\r\ntransactions.receipt_contract_address - The contract address created, if the transaction was a contract creation, otherwise null.\r\nJoining Contracts & Transactions\r\n\r\nYou must use a composite foreign key when joining contracts & transactions.\r\n\r\n"crypto_ethereum.transactions".("block_hash", "to_address") < "bigquery-public-data:crypto_ethereum.contracts".("block_hash", "address")\r\nOR\r\n"bigquery-public-data:crypto_ethereum.transactions".("block_hash", "receipt_contract_address") < "bigquery-public-data:crypto_ethereum.contracts".("block_hash", "address")\r\nContracts & Trace\r\n\r\nTrace.from_address and Trace.to_address can both have contract.address\r\n\r\n3. crypto_ethereum.traces\r\nLearn more about tracing in Ethereum https://openethereum.github.io/JSONRPC-trace-module, the JSONRPC-trace-module is used to populates table crypto_ethereum.traces.\r\n\r\nInternal transactions are not actually considered transactions, as they are not included directly in the blockchain. Instead can only be seen as a byproduct of having tracing on\r\n\r\n3. crypto_ethereum.amended_tokens\r\nToken amended with data from CSV.\r\n\r\n\r\n5. crypto_ethereum.token_transfers\r\nThe most popular type of transaction on the Ethereum blockchain invokes a contract of type ERC20 to perform a transfer operation, moving some number of tokens from one 20-byte address to another 20-byte address. This table contains the subset of those transactions and has further processed and denormalized the data to make it easier to consume for analysis of token transfer events.\r\n\r\n6. crypto_ethereum.logs\r\nSimilar to the token_transfers table, the logs table contains data for smart contract events. However, it contains all log data, not only ERC20 token transfers. This table is generally useful for reporting on any logged event type on the Ethereum blockchain.\r\n\r\n7. crypto_ethereum.balances\r\nThis table contains Ether balances of all addresses, updated daily. fields are address and eth_balance'
        ),
        HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);



    const chain = new LLMChain({ prompt: chatPrompt, llm: model });
    const response = await chain.call({ text: "number of ethereum addresses with more than 1 eth" });
    console.log({ response });
}


main();
