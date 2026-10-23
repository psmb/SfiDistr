
This package will help you to automatically link all occurrences of
your terms within given text. Great for SEO and stuff.

## Usage

### 1. Install the package

```
composer require psmb/term
```

### 2. Add `Psmb.Term:TermMixin` to the nodetypes that you want to use as terms

```
'Your.NodeTypes:Tag':
  superTypes:
    'Psmb.Term:TermMixin': true
```

### 3. Process any text you want with `Psmb.Term:ReplaceTerms` TS object

E.g. if you want terms to be replaced in all Text nodes:

```
prototype(Neos.Neos.NodeTypes:Text) {
	text.@process.replaceTags = Psmb.Term:ReplaceTerms
}
```

Processor has option `absolute` which would force creation of absolute uris.

### 4. Create term nodes

You may also fill-in their `replaceVariants` property for alternative spelling
variants, separated by comma, supporting regexp, "+" expands into "\w*?".
E.g. `duck+` matches `duck`, `ducks`, `ducklings` etc.
