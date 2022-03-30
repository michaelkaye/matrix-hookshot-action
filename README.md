# matrix-hookshot-action

A Github Action for sending updates to a matrix room via a [https://github.com/matrix-org/matrix-hookshot](matrix-hookshot) bot.


## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: michaelkaye/matrix-hookshot-action@<version>
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  hookshot_url: ${{ secrets.HOOKSHOT_URL }}
  text_template: "Handlebars Template"
  html_template: "HTML Handlebars Template"
```

The hookshot URL should be stored as a github Secret on the repository, and this will prevent general access to the endpoint.

## Handlebars Template

This project uses handlebars to template out the notification messages.

We provide a few helper methods and make some data available.

|| Data   ||  Purpose ||
|| job\_statuses || {{#each job\_statuses }}...{{/each}} . Can be used to iterate over all job statuses to provide lists of responses ||
|| job\_statuses[n].name || Name of job ||
|| job\_statuses[n].conclusion || Conclusion of job (eg success, skipped, cancelled), can be null if status is not completed. ||
|| job\_statuses[n].status || Status of job (eg in\_progress / completed) ||
|| job\_statuses[n].started\_at || Start time ||
|| job\_statuses[n].completed\_at || Completion time ||
|| job\_statuses[n].html\_url || URL to github action result page ||
|| job\_statuses[n].completed || True if job status is completed ||
|| job\_statuses[n].neutral || True if job conclusion is neutral ||
|| job\_statuses[n].success || True if job conclusion is success ||
|| job\_statuses[n].skipped || True if job conclusion is skipped ||
|| job\_statuses[n].timed\_out || True if job conclusion is timed\_out ||
|| job\_statuses[n].failure || True if job conclusion is failure ||
|| job\_statuses[n].cancelled || True if job conclusion is cancelled ||


|| Helper || Example || Purpose ||
|| color  || {{color conclusion }} || Provides a html safe colour code for the given conclusion or status, eg {{color "success" }} would be green ||
|| icon   || {{icon conclusion }} || Provides an appropriate emoji for the given conclusion or status, eg {{icon "success" }}} would be a '🟢'

Further helpers / data can be exposed - open an issue or PR with an example of how you would use it.

## Alternative direct matrix client usage

TL;DR: This is dangerous if you do not correctly manage permissions. Try to use hookshot instead.

Providing a matrix room ID and a matrix access token can act as an alternative to the hookshot url. This is inefficient, insecure and not the purpose of this action.

See the [.github/workflows/test.yml](github actions configuration) under `accessToken` for this project for a worked example of this.

Security: However, doing this provides anyone with access to the access token read write and edit access to the matrix room. If you must use this option, create a brand new user for the purpose and ensure it does not have elevated permissions in any room it is joined to.

