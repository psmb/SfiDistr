# Almanac article body

In the Neos editor, open an article from its issue and select the article’s `body` collection in the Content Tree. Blocks added there appear below the PDF link in the full view. The issue’s content collection controls the order of headings and article teasers.

Neos creates the collection automatically for new articles. After deploying the node type, backfill existing articles with the child-node repair scoped to `Sfi.Sfi:AlmanacEntry`:

```sh
FLOW_CONTEXT=Production ./flow flow:cache:flush --force
FLOW_CONTEXT=Production ./flow node:repair --node-type Sfi.Sfi:AlmanacEntry --only createMissingChildNodes --dry-run
FLOW_CONTEXT=Production ./flow node:repair --node-type Sfi.Sfi:AlmanacEntry --only createMissingChildNodes
FLOW_CONTEXT=Production ./flow flow:cache:flush --force
```

The command covers the language variants in the live workspace. For existing entries created or moved in another workspace, run the same repair with `--workspace <name>` after repairing its base workspace.
