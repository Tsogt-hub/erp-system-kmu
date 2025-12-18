import { runPipeline, listPipelines } from '../pipelines/registry';

async function main() {
  const [, , pipelineName, ...args] = process.argv;

  if (!pipelineName || pipelineName === '--help') {
    console.log('Verwendung: npm run pipeline <pipeline-name> [key=value]');
    console.log('\nVerfügbare Pipelines:');
    listPipelines()
      .filter((pipeline) => pipeline.enabled)
      .forEach((pipeline) => {
        console.log(`- ${pipeline.name} (${pipeline.displayName})`);
      });
    process.exit(0);
  }

  const options = args.reduce<Record<string, string>>((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const result = await runPipeline(pipelineName, options);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('Pipeline-Ausführung fehlgeschlagen:', error);
  process.exit(1);
});


