import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import {Command, Plugin, ModelRange as Range, ModelPosition as Position} from 'ckeditor5-exports';

const ITEMPROP = 'itemprop';

function findItemprop(position, value) {
    return new Range(_findBound(position, value, true), _findBound(position, value, false));
}

function _findBound(position, value, lookBack) {
    let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

    let lastNode = null;

    while (node && node.getAttribute(ITEMPROP) === value) {
        lastNode = node;
        node = lookBack ? node.previousSibling : node.nextSibling;
    }

    return lastNode ? Position._createAt(lastNode, lookBack ? 'before' : 'after') : position;
}

class ItempropCommand extends Command {
    refresh() {
        const model = this.editor.model;
        const doc = model.document;

        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, ITEMPROP);
        if (doc.selection.hasAttribute(ITEMPROP)) {
            this.value = doc.selection.getAttribute(ITEMPROP);
        } else {
            const parent = doc.selection.getFirstPosition().parent;
            if (parent && parent.hasAttribute(ITEMPROP)) {
                this.value = parent.getAttribute(ITEMPROP);
            } else {
                const grandParent = parent.parent;
                if (grandParent && grandParent.hasAttribute(ITEMPROP)) {
                    this.value = grandParent.getAttribute(ITEMPROP);
                } else {
                    this.value = undefined;
                }
            }
        }
    }

    execute(value) {
        const model = this.editor.model;
        const doc = model.document;
        const selection = doc.selection;
        value = value === undefined ? false : value;

        model.change(writer => {
            if (selection.isCollapsed) {
                const position = selection.getFirstPosition().parent;

                if (selection.hasAttribute(ITEMPROP)) {
                    const itempropRange = findItemprop(selection.getFirstPosition(), selection.getAttribute(ITEMPROP));
                    if (value === false) {
                        writer.removeAttribute(ITEMPROP, itempropRange);
                    } else {
                        writer.setAttribute(ITEMPROP, value, itempropRange);
                        writer.setSelection(itempropRange);
                    }
                } else {
                    if (value === false) {
                        writer.removeAttribute(ITEMPROP, position);
                    } else {
                        writer.setAttribute(ITEMPROP, value, position);
                    }
                }
            } else {
                const ranges = model.schema.getValidRanges(selection.getRanges(), ITEMPROP);

                for (const range of ranges) {
                    if (value === false) {
                        writer.removeAttribute(ITEMPROP, range);
                    } else {
                        writer.setAttribute(ITEMPROP, value, range);
                    }
                }
            }
        });
    }
}

export default class Itemprop extends Plugin {
    static get pluginName() {
        return 'Itemprop';
    }
    init() {
        const editor = this.editor;
        editor.model.schema.extend('$block', {allowAttributes: ITEMPROP});
        editor.model.schema.extend('$text', {allowAttributes: ITEMPROP});
        editor.model.schema.extend('tableCell', {allowAttributes: ITEMPROP});

        const schema = this.editor.model.schema;

        this.editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'span',
                key: ITEMPROP,
                attributes: {
                    [ITEMPROP]: true
                }
            },
            model: {
                key: ITEMPROP,
                value: viewElement => viewElement.getAttribute('itemprop')
            }
        });

        this.editor.conversion.for('upcast').attributeToAttribute({
            view: ITEMPROP,
            model: ITEMPROP
        });

        this.editor.conversion.for('downcast').attributeToElement({
            model: {
                key: ITEMPROP,
                name: '$text'
            },
            view: (value, writer) => writer.createAttributeElement('span', {[ITEMPROP]: value})
        });

        this.editor.conversion.for('downcast').attributeToAttribute({
            model: {
                key: ITEMPROP,
                name: 'tableCell'
            },
            view: ITEMPROP
        });

        this.editor.conversion.for('downcast').attributeToAttribute({
            model: {
                key: ITEMPROP,
                name: 'paragraph'
            },
            view: ITEMPROP
        });

        editor.commands.add(ITEMPROP, new ItempropCommand(this.editor));
    }
}
