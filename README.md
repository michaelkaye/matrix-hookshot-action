# matrix-hookshot-action

A Github Action for sending updates to a matrix room via a [https://github.com/matrix-org/matrix-hookshot](matrix-hookshot) bot.

![A screenshot showing an example of output in element-desktop](https://user-images.githubusercontent.com/1917473/160877525-e1ffadf8-9013-4602-89fc-62b6bfab5a89.png)

The format of the update is templatable (both text and html) to your needs.

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

| Data   |  Purpose |
| -----  | ---- |
| job\_statuses | eg `{{#each job\_statuses }}...{{/each}}` Can be used to iterate over all job statuses to provide lists of responses |
| job\_statuses[name].name | Name of job |
| job\_statuses[name].conclusion | Conclusion of job (eg success, skipped, cancelled), can be null if status is not completed. |
| job\_statuses[name].status | Status of job (eg in\_progress / completed) |
| job\_statuses[name].started\_at | Start time |
| job\_statuses[name].completed\_at | Completion time |
| job\_statuses[name].html\_url | URL to github action result page |
| job\_statuses[name].completed | True if job status is completed |
| job\_statuses[name].neutral | True if job conclusion is neutral |
| job\_statuses[name].success | True if job conclusion is success |
| job\_statuses[name].skipped | True if job conclusion is skipped |
| job\_statuses[name].timed\_out | True if job conclusion is timed\_out |
| job\_statuses[name].failure | True if job conclusion is failure |
| job\_statuses[name].cancelled | True if job conclusion is cancelled |

| Function |  Purpose |
| -----  | ---- |
| color  | `{{color status}}` - Provides a html safe colour code for the given conclusion or status, eg {{color "success" }} would be green |
| icon   | `{{icon status}}` - Provides an appropriate emoji for the given conclusion or status, eg {{icon "success" }}} would be a '🟢' |

Further helpers / data can be exposed - open an issue or PR with an example of how you would use it.

## Alternative direct matrix client usage

TL;DR: This is dangerous if you do not correctly manage permissions. Try to use hookshot instead, which is what this action is built for.

Providing a matrix room ID and a matrix access token can act as an alternative to the hookshot url. This is inefficient, insecure and not the purpose of this action.

See the [.github/workflows/test.yml](github actions configuration) under `accessToken` for this project for a worked example of this.

Security: However, doing this provides anyone with access to the access token read write and edit access to the matrix room. If you must use this option, create a brand new user for the purpose and ensure it does not have elevated permissions in any room it is joined to.
