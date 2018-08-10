import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import {Command, Plugin, UpcastConverters, DowncastConverters, ModelRange as Range, ModelPosition as Position} from 'ckeditor5-exports';
const {downcastAttributeToElement, downcastAttributeToAttribute} = DowncastConverters;
const {upcastElementToAttribute, upcastAttributeToAttribute} = UpcastConverters;

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

    return lastNode ? Position.createAt(lastNode, lookBack ? 'before' : 'after') : position;
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
            this.value = parent.getAttribute(ITEMPROP);
        }
    }

    execute(value) {
        const model = this.editor.model;
        const doc = model.document;
        const selection = doc.selection;
        const toggleMode = value === undefined;
        value = toggleMode ? !this.value : value;

        model.change(writer => {
            if (toggleMode && !value) {
                const rangesToUnset = selection.isCollapsed ?
                    [findItemprop(selection.getFirstPosition(), selection.getAttribute(ITEMPROP))] : selection.getRanges();
                for (const range of rangesToUnset) {
                    writer.removeAttribute(ITEMPROP, range);
                }
            } else if (selection.isCollapsed) {
                const position = selection.getFirstPosition().parent;

                if (selection.hasAttribute(ITEMPROP)) {
                    const itempropRange = findItemprop(selection.getFirstPosition(), selection.getAttribute(ITEMPROP));
                    if (value === false) {
                        writer.removeAttribute(ITEMPROP, itempropRange);
                    } else {
                        writer.setAttribute(ITEMPROP, value, itempropRange);
                        writer.setSelection(itempropRange);
                    }
                } else if (value !== '') {
                    const attributes = toMap(selection.getAttributes());
                    attributes.set(ITEMPROP, value);
                    writer.setAttribute(ITEMPROP, value, position);
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
        editor.model.schema.extend('tableCell', {allowContentOf: '$root', allowAttributes: ITEMPROP});
        
        const schema = this.editor.model.schema;

        this.editor.conversion.for('upcast').add(upcastElementToAttribute({
            view: {
                name: 'span',
                key: ITEMPROP
            },
            model: ITEMPROP
        }));

        this.editor.conversion.for('upcast').add(upcastAttributeToAttribute({
            view: ITEMPROP,
            model: ITEMPROP
        }));

        this.editor.conversion.for('downcast').add(downcastAttributeToElement({
            model: {
                key: ITEMPROP,
                name: '$text'
            },
            view: (value, writer) => writer.createAttributeElement('span', { [ITEMPROP]: value })
        }));

        this.editor.conversion.for('downcast').add(downcastAttributeToAttribute({
            model: ITEMPROP,
            view: ITEMPROP
        }));

        editor.commands.add(ITEMPROP, new ItempropCommand(this.editor));
    }
}
