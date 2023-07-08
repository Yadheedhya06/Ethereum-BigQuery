const { PrismaClient } = require('@prisma/client');
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const main = async () => {
    try {
        const prisma = new PrismaClient();
        const loader = new TextLoader("./public/data/blockchair.md");
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 3000 });
        const docs = await loader.loadAndSplit(textSplitter);
        console.log('Document contents successfully split')
        console.log(`Number of documents: ${docs.length}`);
        const embeddings = new OpenAIEmbeddings();

        for (const doc of docs) {
            const embedding = await embeddings.embedQuery(doc.pageContent);
            const query =
                'INSERT INTO "Documentations" (name, content, embedding) VALUES ($1, $2, $3)'
            const values = ["Blockchair", doc.pageContent, embedding]
            await prisma.$executeRawUnsafe(query, ...values)
        }
// ioqeiohqpe
        console.log('embeddings generated and Documents table Updated');
    } catch (e) {
        console.log('Error while splitting document contents and generating embeddings:', e);
    }
};

try {
    main();
} catch (e) {
    console.log(e);
}
