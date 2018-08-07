import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import {Command, Plugin, UpcastConverters, DowncastConverters, ModelRange as Range, ModelPosition as Position} from 'ckeditor5-exports';
const {downcastAttributeToElement} = DowncastConverters;
const {upcastElementToAttribute} = UpcastConverters;

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
    constructor(editor, attributeKey) {
        super(editor);

        this.attributeKey = attributeKey;
    }

    refresh() {
        const model = this.editor.model;
        const doc = model.document;

        this.value = doc.selection.getAttribute(this.attributeKey);
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, this.attributeKey);
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
                    writer.removeAttribute(this.attributeKey, range);
                }
            } else if (selection.isCollapsed) {
                const position = selection.getFirstPosition();

                if (selection.hasAttribute(ITEMPROP)) {
                    const itempropRange = findItemprop(selection.getFirstPosition(), selection.getAttribute(ITEMPROP));
                    if (value === false) {
                        writer.removeAttribute(this.attributeKey, itempropRange);
                    } else {
                        writer.setAttribute(this.attributeKey, value, itempropRange);
                        writer.setSelection(itempropRange);
                    }
                } else if (value !== '') {
                    const attributes = toMap(selection.getAttributes());
                    attributes.set(this.attributeKey, value);
                    const node = writer.createText(value, attributes);
                    writer.insert(node, position);
                    writer.setSelection(Range.createOn(node));
                }
            } else {
                const ranges = model.schema.getValidRanges(selection.getRanges(), this.attributeKey);

                for (const range of ranges) {
                    if (value === false) {
                        writer.removeAttribute(this.attributeKey, range);
                    } else {
                        writer.setAttribute(this.attributeKey, value, range);
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
        editor.model.schema.extend('$text', {allowAttributes: ITEMPROP});
        editor.conversion.for('downcast').add(downcastAttributeToElement({
            model: ITEMPROP,
            view: (itemprop, writer) => writer.createAttributeElement('span', {'itemprop': itemprop})
        }));
        editor.conversion.for('upcast')
            .add(upcastElementToAttribute({
                view: {
                    name: 'span',
                    attributes: {
                        'itemprop': true
                    }
                },
                model: {
                    key: ITEMPROP,
                    value: viewElement => viewElement.getAttribute('itemprop')
                }
            }));
        editor.commands.add(ITEMPROP, new ItempropCommand(this.editor, ITEMPROP));
    }
}
