This package provides a footnote plugin for CKeditor5 integraion in Neos CMS.

![footnotes](https://user-images.githubusercontent.com/837032/43721125-a3566a00-999a-11e8-92af-d049c889951d.gif)

## Installation

1. Switch to using CKeditor 5
2. `composer require 'psmb/footnote'`
3. Enable footnote button on node properties that should support it, e.g.:

```
'Neos.NodeTypes:TextMixin':
  properties:
    text:
      ui:
        inline:
          editorOptions:
            formatting:
              footnote: true
```

4. Add Fusion processor over the needed content collection, from which the footnotes should be gathered and rendered (or write your own Fusion or JS solution), e.g.:

```
prototype(Neos.Neos:PrimaryContent) {
  @process.footnotes = Psmb.Footnote:FootnoteProcessor
}
```

5. Optionally add some styling to footnotes in backend, e.g.:

```
.neos-backend span[data-footnote]:after {
  content: '*';
  color: orange;
  border-bottom: orange solid 1px;
}
```
