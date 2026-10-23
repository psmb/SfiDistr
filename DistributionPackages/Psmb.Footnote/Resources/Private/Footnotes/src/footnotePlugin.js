import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import {Command, Plugin, ModelRange as Range, ModelPosition as Position} from 'ckeditor5-exports';

const FOOTNOTE = 'footnote';

function findFootnote(position, value) {
    return new Range(_findBound(position, value, true), _findBound(position, value, false));
}

function _findBound(position, value, lookBack) {
    let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

    let lastNode = null;

    while (node && node.getAttribute(FOOTNOTE) === value) {
        lastNode = node;
        node = lookBack ? node.previousSibling : node.nextSibling;
    }

    return lastNode ? Position._createAt(lastNode, lookBack ? 'before' : 'after') : position;
}

class FootnoteCommand extends Command {
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
                    [findFootnote(selection.getFirstPosition(), selection.getAttribute(FOOTNOTE))] : selection.getRanges();
                for (const range of rangesToUnset) {
                    writer.removeAttribute(this.attributeKey, range);
                }
            } else if (selection.isCollapsed) {
                const position = selection.getFirstPosition();

                if (selection.hasAttribute(FOOTNOTE)) {
                    const footnoteRange = findFootnote(selection.getFirstPosition(), selection.getAttribute(FOOTNOTE));
                    if (value === false) {
                        writer.removeAttribute(this.attributeKey, footnoteRange);
                    } else {
                        writer.setAttribute(this.attributeKey, value, footnoteRange);
                        writer.setSelection(footnoteRange);
                    }
                } else if (value !== '') {
                    const attributes = toMap(selection.getAttributes());
                    attributes.set(this.attributeKey, value);
                    const node = writer.createText(value, attributes);
                    writer.insert(node, position);
                    writer.setSelection(Range._createOn(node));
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

export default class Footnote extends Plugin {
    static get pluginName() {
        return 'Footnote';
    }
    init() {
        const editor = this.editor;
        editor.model.schema.extend('$text', {allowAttributes: FOOTNOTE});
        editor.conversion.for('downcast').attributeToElement({
            model: FOOTNOTE,
            view: (footnote, writer) => writer.createAttributeElement('span', {'data-footnote': footnote})
        });

        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'span',
                attributes: {
                    'data-footnote': true
                }
            },
            model: {
                key: FOOTNOTE,
                value: viewElement => viewElement.getAttribute('data-footnote')
            }
        });
        editor.commands.add(FOOTNOTE, new FootnoteCommand(this.editor, FOOTNOTE));
    }
}
