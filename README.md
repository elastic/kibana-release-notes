# Kibana Release Notes

Tool to generate the Kibana release notes. Deployed at [release-notes.kibanateam.dev](https://release-notes.kibanateam.dev)

## Steps to test locally

1. Install dependencies:

```sh
yarn install
```

2. Start the tool:

```sh
yarn start
```

The app runs on port 4000 (configured in `package.json`).
After starting, it should open at http://localhost:4000.

NOTE: In order for the tool to generate release notes, you must provide a [Github token](https://github.com/settings/tokens) with the `public_repo` permission for public repos or the full `repo` scope for private repos.
