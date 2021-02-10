import {Command} from "ckeditor5-exports";

function _findRange(position, value, model, attributeKey) {
  return model.createRange(
    _findBound(position, value, true, model, attributeKey),
    _findBound(position, value, false, model, attributeKey)
  );
}

function _findBound(position, value, lookBack, model, attributeKey) {
  let node =
    position.textNode ||
    (lookBack ? position.nodeBefore : position.nodeAfter);

  let lastNode = null;

  while (node && node.getAttribute(attributeKey) == value) {
    lastNode = node;
    node = lookBack ? node.previousSibling : node.nextSibling;
  }

  return lastNode
    ? model.createPositionAt(lastNode, lookBack ? "before" : "after")
    : position;
}

export default class RemoveAttributeCommand extends Command {
  constructor(editor, attributeKey) {
    super(editor);

    this.attributeKey = attributeKey;
  }

  refresh() {
    const model = this.editor.model;
    const doc = model.document;

    this.value = doc.selection.getAttribute(this.attributeKey);
    this.isEnabled = model.schema.checkAttributeInSelection(
      doc.selection,
      this.attributeKey
    );
  }

  execute(value) {
    const model = this.editor.model;
    const doc = model.document;
    const selection = doc.selection;
    const toggleMode = value === undefined;
    value = toggleMode ? !this.value : value;

    model.change(writer => {
      const rangesToUnset = selection.isCollapsed
        ? [
          _findRange(
            selection.getFirstPosition(),
            selection.getAttribute(this.attributeKey),
            model,
            this.attributeKey
          )
        ]
        : selection.getRanges();
      for (const range of rangesToUnset) {
        writer.removeAttribute(this.attributeKey, range);
      }
    });
  }
}
