# porQpine portfolio

An honest, static portfolio for the public `opethician` GitHub profile. It
links working source repositories to their matching Freelancer service pages
without inventing clients, outcomes, ratings, or performance metrics.

## Why static

The portfolio does not need authentication, storage, analytics, or a contact
database. GitHub Pages is therefore the smallest reliable production surface.
The linked companion repositories contain the interactive frontend and
stateless API examples.

## Local preview

Serve `docs/` with any static server:

```bash
npx serve docs
```

Validation:

```bash
npm test
```

## Deployment

GitHub Pages publishes directly from `main/docs`. The repository contains no
deployment token, build-time secret, or third-party hosting dependency.

Expected public URL:

`https://opethician.github.io/porqpine-studio-portfolio/`

## Boundaries

- No analytics, cookies, forms, trackers, remote fonts, or stock imagery
- No private deployment links
- No off-platform payment request
- No unverified client, revenue, conversion, speed, or quality claim
