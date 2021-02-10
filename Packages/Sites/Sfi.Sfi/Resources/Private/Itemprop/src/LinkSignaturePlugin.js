import {Plugin} from "ckeditor5-exports";
import LinkAttributeCommand from "./linkAttributeCommand";
import RemoveAttributeCommand from "./removeAttributeCommand";

const attributeName = 'signature'

export default class SignaturePlugin extends Plugin {
  static get pluginName() {
    return "Signature";
  }

  init() {
    const editor = this.editor;
    editor.model.schema.extend("$text", {
      allowAttributes: [attributeName]
    });

    this.editor.commands.get("unlink").on("execute", (evt, args) => {
      editor.execute("removeSignature");
    });

    editor.conversion.for("downcast").attributeToElement({
      model: attributeName,
      view: (attributeValue, writer) => {
        const linkElement = writer.createAttributeElement(
          "a",
          attributeValue
            ? {
              [`data-${attributeName}`]: attributeValue
            }
            : {},
          {priority: 5}
        );
        return linkElement;
      }
    });
    editor.conversion.for("upcast").elementToAttribute({
      view: {
        name: "a",
        attributes: {
          [`data-${attributeName}`]: true
        }
      },
      model: {
        key: attributeName,
        value: viewElement => viewElement.getAttribute([`data-${attributeName}`])
      }
    });

    editor.commands.add(
      attributeName,
      new LinkAttributeCommand(this.editor, attributeName)
    );
    editor.commands.add(
      "removeSignature",
      new RemoveAttributeCommand(this.editor, attributeName)
    );
  }
}
