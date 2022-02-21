// vim: ai:ts=2:sw=2
const core = require('@actions/core');
const github = require('@actions/github');
const Handlebars = require("handlebars");


// most @actions toolkit packages have async methods
async function run() {
  try {
	  const myToken = core.getInput("github_token")
		
	  const octokit = github.getOctokit(myToken)
		const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
		const run_id = parseInt(process.env.GITHUB_RUN_ID)
		const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
  		owner,
		  repo,
			run_id,
		});
    core.info(JSON.stringify(jobs, null, 2))
		const job_status = jobs.data.jobs.reduce(
			function(map, job) {
				map[job.name] = job.status;
				return map;
			},
			{}
		)
		const data = {
		   job_status: job_status
		}
		const template = Handlebars.compile("Name: {{job_status}}");
    const output = template(data);
    core.info(output);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
