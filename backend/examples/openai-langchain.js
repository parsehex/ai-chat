import path from 'path';
import url from 'url';

const __dirname = path.resolve(
	url.fileURLToPath(new URL(import.meta.url)),
	'..'
);

import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../../.env') });
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, AIMessage, SystemMessage } from 'langchain/schema';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { DynamicTool } from 'langchain/tools';
import { WebBrowser } from 'langchain/tools/webbrowser';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import google from 'googlethis';

const embeddings = new OpenAIEmbeddings();

const model = new ChatOpenAI(
	{
		// openAIApiKey: 'sk-1111',
		openAIApiKey: process.env.OPENAI_API_KEY || 'sk-111111',
		// streaming: true,
		callbacks: [
			{
				// handleLLMNewToken(token, idx, runId) {
				// process.stdout.write(token);
				// },
			},
		],
	}
	// { basePath: 'http://127.0.0.1:5001/v1' }
);

const tools = [
	new DynamicTool({
		name: 'SEARCH',
		description:
			'call this to search google for something. input should be a string.',
		func: async (input) => {
			console.log(`Searching google for "${input}"`);
			const result = JSON.parse(JSON.stringify(await google.search(input)));
			const del = [
				'videos',
				'featured_snippet',
				'did_you_mean',
				'weather',
				'time',
				'location',
				'translation',
			];
			del.forEach((key) => {
				if (result[key]) delete result[key];
			});
			console.log(`${result.results.length} results found.`);
			return JSON.stringify(result);
		},
	}),
	new WebBrowser({ model, embeddings }),
];

(async () => {
	// const messages = [
	// 	new SystemMessage('You are a chatbot.'),
	// 	new HumanMessage('How are you?'),
	// ];

	const executor = await initializeAgentExecutorWithOptions(tools, model, {
		agentType: 'zero-shot-react-description',
		maxIterations: 2,
		verbose: true,
		callbacks: [
			{
				handleToolStart(toolName, input, runId) {
					console.log(`Starting tool ${toolName} with input ${input}`);
				},
				handleLLMNewToken(token, idx, runId) {
					process.stdout.write(token);
				},
			},
		],
	});
	// executor.tools = [];

	const input = 'What is mares cares?';

	const response = await executor.call({ input });
	console.log(response);
})();
