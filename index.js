// vim: ai:ts=2:sw=2
const core = require('@actions/core');
const github = require('@actions/github');
const Handlebars = require("handlebars");
const https = require('https');


// most @actions toolkit packages have async methods
async function run() {
  try {
	  const githubToken = core.getInput("github_token");
	  const matrixToken = core.getInput("matrix_access_token");
		const roomId = core.getInput("room_id");
		const htmlTemplate = Handlebars.compile(core.getInput("html_template"));
		const textTemplate = Handlebars.compile(core.getInput("text_template"));

	  const octokit = github.getOctokit(githubToken);
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
					completed: job.status == "completed",
					neutral: job.conclusion == "neutral",
					success: job.conclusion == "success",
					skipped: job.conclusion == "skipped",
					timed_out: job.conclusion == "timed_out",
					failure: job.conclusion == "failure",
					cancelled: job.conclusion == "cancelled",
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

		// TODO hookshot integration here

		// UNTIL THEN:
		if (matrixToken != "") {
			const requestData = JSON.stringify({
			 "body": textTemplate(data),
       "format": "org.matrix.custom.html",
       "formatted_body": htmlTemplate(data),
       "msgtype": "m.text"
			});

			const txnId = "txn_"+Date.now();
			const options = {
			  hostname: "matrix-client.matrix.org",
				port: "443",
				path: `/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`,
				headers: { 
					"Authentication":`Bearer ${ matrixToken }`
				},
				method: "PUT"
			};

			const req = https.request(options, (res) => {
				core.info(`Got ${ res.statusCode }`);
			});
			req.write(requestData);
			req.end();
		} else {
		  core.info("Not continuing to send to matrix, no matrixToken set")
		}
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
