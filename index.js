// vim: ai:ts=2:sw=2
const core = require('@actions/core');
const github = require('@actions/github');
const Handlebars = require("handlebars");
const https = require('https');
const url = require('url');

// most @actions toolkit packages have async methods
async function run() {
  try {
	  const githubToken = core.getInput("github_token");
	  const matrixToken = core.getInput("matrix_access_token");
		const matrixRoomId = core.getInput("matrix_room_id");
		const hookshotUrl = core.getInput("hookshotUrl");
		const htmlTemplate = Handlebars.compile(core.getInput("html_template"));
		const textTemplate = Handlebars.compile(core.getInput("text_template"));
	  Handlebars.registerHelper('icon', function (aString) {
			switch(aString) {
				case 'failure':
				case 'timed_out':
				  return '🔴';
			  case 'success':
				  return '🟢';
			  case 'neutral':
				case 'skipped':
				case 'cancelled':
				default:
				  return '⚪️';
			}
		});
	  Handlebars.registerHelper('color', function (aString) {
			switch(aString) {
				case 'failure':
				case 'timed_out':
				  return 'crimson';
			  case 'success':
				  return 'olive';
			  case 'neutral':
				case 'skipped':
				case 'cancelled':
				default:
				  return 'black';
		  }
		});
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

		// If you are looking for further data then please submit a PR to calculate and add it
		// Will accept any data additions that do not expose secrets or sensitive information
		// The action is designed to use a whitelist of acceptable data because it could be easily
		// used as part of a chain to exfiltrate secrets otherwise.

		const data = {
		   job_statuses: job_status,

		}
		core.startGroup('Rendering Source data to Text and HTML');
		core.info("Source: " + JSON.stringify(data));
    core.info("Text  : " + textTemplate(data));
		core.info("HTML  : " + htmlTemplate(data));
    core.endGroup();

		if (hookshotUrl != "") {
		  const url = new URL(hookshotUrl);
			const requestData = JSON.stringify({
			 "text": textTemplate(data),
       "html": htmlTemplate(data),
			});

			const options = {
			  hostname: target.hostname,
				port: target.port,
				path: target.path,
				method: "PUT"
			};

			const req = https.request(options, (res) => {
				core.info(`StatusCode: ${ res.statusCode }`);
				res.on("data", function(chunk) {
				  core.info(`Body: ${chunk}`);
				});
			});
			req.write(requestData);
			req.end();
			
		} else {
		  core.info("No hookshot URL, no notification sent")
		}

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
				path: `/_matrix/client/r0/rooms/${matrixRoomId}/send/m.room.message/${txnId}?access_token=${matrixToken}`,
				method: "PUT"
			};

			const req = https.request(options, (res) => {
				core.info(`Got ${ res.statusCode }`);
				res.on("data", function(chunk) {
				  core.info(`Got ${chunk}`);
				});
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
