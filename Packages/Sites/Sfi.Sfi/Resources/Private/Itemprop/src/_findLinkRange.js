export default function findLinkRange(position, value, model) {
  return model.createRange(
    _findBound(position, value, true, model),
    _findBound(position, value, false, model)
  );
}

function _findBound(position, value, lookBack, model) {
  let node =
    position.textNode ||
    (lookBack ? position.nodeBefore : position.nodeAfter);

  let lastNode = null;

  while (node && node.getAttribute("linkHref") == value) {
    lastNode = node;
    node = lookBack ? node.previousSibling : node.nextSibling;
  }

  return lastNode
    ? model.createPositionAt(lastNode, lookBack ? "before" : "after")
    : position;
}
