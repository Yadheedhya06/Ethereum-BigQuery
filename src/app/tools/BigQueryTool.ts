import { BigQuery } from "@google-cloud/bigquery";
import { Tool } from "langchain/tools";
import * as path from 'path';

const filePath = path.resolve(__dirname, '../../../../../../everipedia.json');

export class BigQueryTool extends Tool {
    name = "BigQuery";
    description = 
                'A tool to query bigquery ethereum data. Input should be a sql query. Output is a json array of rows'
    async run(input: string) {
        const bigquery = new BigQuery({
            projectId: "nebula-306510",
            keyFilename: filePath,
        });
        try {
            const options = {
                query: input,
                location: "US",
            };
            const rows = await bigquery.query(options);
            return rows;
        } catch (error) {
            console.error("Error running query:", error);
        }
    }

    async _call(input: string) {
        // substring to remove the first 3 letters and last 3 letters
        const query = input
            .substring(3, input.length - 3)
            .replace("\n", " ")
            .trim(); // removing ```
        const rows = await this.run(query);
        return JSON.stringify(rows);
    }
}



 'You are a helpful assistant that buildes SQL quries by carefully observing Ethereum BigQuery database structure. The database structure is as follows -- database name is bigquery-public-data.crypto_ethereum and it has the following tables: \r\n\r\n1. crypto_ethereum.transactions\r\nThe transactions table has the normal Ethereum transactions, and if you need to find the internal transactions, you need to query the trace table.\r\n\r\nInternal transactions are not actually considered transactions, as they are not included directly in the blockchain. Instead can only be seen as a byproduct of having tracing on.\r\n\r\n2. crypto_ethereum.contracts\r\nNote \u2014 Don\u2019t have any unique key on contracts table\r\n\r\nContracts & Transactions\r\n\r\ncontracts.address can be fond transactions.to_address or transactions.receipt_contract_address.\r\n\r\ntransactions.to_address - Address of the receiver. null when its a contract creation transaction.\r\ntransactions.receipt_contract_address - The contract address created, if the transaction was a contract creation, otherwise null.\r\nJoining Contracts & Transactions\r\n\r\nYou must use a composite foreign key when joining contracts & transactions.\r\n\r\n"crypto_ethereum.transactions".("block_hash", "to_address") < "bigquery-public-data:crypto_ethereum.contracts".("block_hash", "address")\r\nOR\r\n"bigquery-public-data:crypto_ethereum.transactions".("block_hash", "receipt_contract_address") < "bigquery-public-data:crypto_ethereum.contracts".("block_hash", "address")\r\nContracts & Trace\r\n\r\nTrace.from_address and Trace.to_address can both have contract.address\r\n\r\n3. crypto_ethereum.traces\r\nLearn more about tracing in Ethereum https://openethereum.github.io/JSONRPC-trace-module, the JSONRPC-trace-module is used to populates table crypto_ethereum.traces.\r\n\r\nInternal transactions are not actually considered transactions, as they are not included directly in the blockchain. Instead can only be seen as a byproduct of having tracing on\r\n\r\n3. crypto_ethereum.amended_tokens\r\nToken amended with data from CSV.\r\n\r\n\r\n5. crypto_ethereum.token_transfers\r\nThe most popular type of transaction on the Ethereum blockchain invokes a contract of type ERC20 to perform a transfer operation, moving some number of tokens from one 20-byte address to another 20-byte address. This table contains the subset of those transactions and has further processed and denormalized the data to make it easier to consume for analysis of token transfer events.\r\n\r\n6. crypto_ethereum.logs\r\nSimilar to the token_transfers table, the logs table contains data for smart contract events. However, it contains all log data, not only ERC20 token transfers. This table is generally useful for reporting on any logged event type on the Ethereum blockchain.\r\n\r\n7. crypto_ethereum.balances\r\nThis table contains Ether balances of all addresses, updated daily. fields are address and eth_balance';
// `This tool is designed for querying Ethereum data on Google BigQuery. The input for this tool must be a SQL query string. After executing the SQL query, the tool will output the results as a JSON array of rows. These rows are composed of the information pulled from the specific tables in the BigQuery dataset named 'bigquery-public-data.crypto_ethereum'.

//     This dataset consists of seven main tables:
//     1. crypto_ethereum.transactions
//     2. crypto_ethereum.contracts
//     3. crypto_ethereum.traces
//     4. crypto_ethereum.amended_tokens
//     5. crypto_ethereum.token_transfers
//     6. crypto_ethereum.logs
//     7. crypto_ethereum.balances

//     Each table houses distinct sets of Ethereum data, with tables such as transactions and contracts containing details about Ethereum transactions and smart contracts respectively, and others like balances providing daily updated Ether balances of all Ethereum addresses.

//     Please formulate your SQL queries keeping in mind the unique data each of these tables holds. Ensure to follow the necessary joining conditions if data from multiple tables is needed.

//     Remember, the ultimate output will be a JSON array that lists the rows of data fetched by your SQL query.`

// `
//     This tool provides an interface to query Ethereum data stored in BigQuery. The expected input is a SQL query and the output will be a JSON array of rows, each of which represents a single record in the query's result set.
    
//     The database name is 'bigquery-public-data.crypto_ethereum', encompassing several tables:
    
//     1. 'crypto_ethereum.transactions' - This table contains regular Ethereum transactions. To find internal transactions, you need to query the 'trace' table. Internal transactions are not directly included in the blockchain and can only be observed when tracing is enabled.
    
//     2. 'crypto_ethereum.contracts' - This table doesn't have a unique key. The 'contracts.address' can be found in 'transactions.to_address' or 'transactions.receipt_contract_address'. When joining 'contracts' and 'transactions', a composite foreign key must be used.
    
//     3. 'crypto_ethereum.traces' - This table is populated using the JSONRPC-trace-module. 'Trace.from_address' and 'Trace.to_address' can both have 'contract.address'.
    
//     4. 'crypto_ethereum.amended_tokens' - This table contains token data amended with data from a CSV file.
    
//     5. 'crypto_ethereum.token_transfers' - This table has the subset of Ethereum transactions invoking an ERC20 contract for a transfer operation.
    
//     6. 'crypto_ethereum.logs' - This table contains all log data, not only ERC20 token transfers. 
    
//     7. 'crypto_ethereum.balances' - This table contains daily Ether balances of all addresses.
    
//     Note that the output JSON array represents the result set of your input SQL query.`;