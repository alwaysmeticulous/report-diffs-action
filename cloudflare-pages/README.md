# Cloudflare Pages Action

This GitHub Action will create a GitHub deployment from your Cloudflare Pages one, thus triggering Meticulous to run tests.

To use this Action please create a GitHub Actions workflow `.github/workflows/cloudflare-pages.yaml` with the contents:

```yaml
name: Trigger Meticulous
on: [push]
permissions:
  deployments: write
jobs:
  trigger-meticulous:
    name: Trigger Meticulous
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Meticulous
        uses: alwaysmeticulous/report-diffs-action/cloudflare-pages@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          cloudflare-account-id: << FILL THIS IN >>
          cloudflare-project-name: << FILL THIS IN >>
```

You should pass in:

- `github-token`: This is automatically created for your workflow by GitHub but still needs to be passed in to our step as shown above.
- `cloudflare-api-token`: This should be created as documented [here](https://developers.cloudflare.com/pages/configuration/api/) with the `Read` permission for `Cloudflare Pages` and stored in a [GitHub Actions secret](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) named `CLOUDFLARE_API_TOKEN`. Then it can be passed into our step as shown above.
- `cloudflare-account-id`: You can find this by following the instructions [here](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/#find-account-id-workers-and-pages), then paste it into the workflow file (it is not confidential).
- `cloudflare-project-name`: You can find this on the same dashboard your account ID is on, then paste it into the workflow file (it is not confidential).

### Notes

- This action will create deployments to a new environment named: **Cloudflare Pages: {cloudflare-project-name} ({environment})**. To ensure Meticulous triggers test runs from these deployments, please toggle on the checkbox for this environment in the **CI & Execution** section of your project's settings.
- In the example workflow file above, `on: [push]` means that this action will run every time you push to your repository. This job will hang for up to an hour if a Cloudflare preview is not created, so, if you only create Cloudflare previews in certain situations, you should modify this to use other [GitHub events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows). For example, if you only create Cloudflare previews for pushes to the `main` branch and for pull_request events, you can change this to:

```yaml
on:
  push:
    branches:
      - main
  pull_request: {}
```
