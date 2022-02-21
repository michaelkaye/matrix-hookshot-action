// vim: ai:ts=2:sw=2
const core = require('@actions/core');
const github = require('@actions/github');
const Handlebars = require("handlebars");


// most @actions toolkit packages have async methods
async function run() {
  try {
	  const myToken = core.getInput("github_token");
		const htmlTemplate = Handlebars.compile(core.getInput("html_template"));
		const textTemplate = Handlebars.compile(core.getInput("text_template"));

	  const octokit = github.getOctokit(myToken);
		const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
		const run_id = parseInt(process.env.GITHUB_RUN_ID);
		const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
  		owner,
		  repo,
			run_id,
		});
    core.debug(JSON.stringify(jobs, null, 2));

		// Whitelist data we allow into the template
		// as user-supplied templates are permitted
		const job_status = jobs.data.jobs.reduce(
			function(map, job) {
				map[job.name] = {
					id: job.id,
					html_url: job.html_url,
					conclusion: job.conclusion,
					status: job.status,
					started_at: job.started_at,
					completed_at: job.completed_at,
					name: job.name,
					// useful parameters for if blocks etc
					success: job.status == "success",
					failure: job.status == "failure",
					cancelled: job.status == "cancelled",
				};
				return map;
			},
			{}
		)
		const data = {
		   job_statuses: job_status,

		}
    core.info(textTemplate(data));
		core.info(htmlTemplate(data));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
