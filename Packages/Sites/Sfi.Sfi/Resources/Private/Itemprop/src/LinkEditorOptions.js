import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {$get, $transform} from "plow-js";

import {TextInput, DateInput, Button} from "@neos-project/react-ui-components";
import {executeCommand} from "@neos-project/neos-ui-ckeditor5-bindings";

import {selectors} from "@neos-project/neos-ui-redux-store";

function makeid(length) {
  var result = '';
  var characters = 'abcdef0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

@connect(
  $transform({
    formattingUnderCursor: selectors.UI.ContentCanvas.formattingUnderCursor
  })
)
export default class LinkEditorOptions extends PureComponent {
  static propTypes = {
    formattingUnderCursor: PropTypes.object,
    linkingOptions: PropTypes.object
  };

  render() {
    let signature = null
    const signatureJson = $get('signature', this.props.formattingUnderCursor)
    if (signatureJson) {
      try {
        signature = JSON.parse(signatureJson)
      } catch (e) { }
    }

    if (!signature) {
      return <div style={{
        flexBasis: '50%',
        padding: 8
      }}>
        <div>
          <Button onClick={() => {
            executeCommand("signature", JSON.stringify({
              signed: false,
              signee: 'Мазуров Алексей Борисович',
              signeePosition: 'Ректор',
              signDate: new Date(),
              signKey: makeid(40)
            }), false);
          }}>Подписать</Button>
        </div>
      </div>
    }

    const updateSignature = key => value => {
      signature[key] = value
      executeCommand("signature", JSON.stringify(signature), false);
    }
    return (
      <React.Fragment>
        <div style={{
          flexBasis: '50%',
          padding: 8
        }}>
          <label className={{marginBottom: 4}} htmlFor="signee">
            ФИО подписавшего документ
          </label>
          <div>
            <TextInput
              id="signee"
              value={signature.signee}
              placeholder={"ФИО подписавшего документ"}
              onChange={updateSignature('signee')}
            />
          </div>
        </div>
        <div style={{
          flexBasis: '50%',
          padding: 8
        }}>
          <label className={{marginBottom: 4}} htmlFor="signeePosition">
            Должность подписавшего
        </label>
          <div>
            <TextInput
              id="signeePosition"
              value={signature.signeePosition}
              placeholder={"ФИО подписавшего документ"}
              onChange={updateSignature('signeePosition')}
            />
          </div>
        </div>
        <div style={{
          flexBasis: '50%',
          padding: 8
        }}>
          <label className={{marginBottom: 4}} htmlFor="signDate">
            Дата подписания
        </label>
          <div>
            <DateInput
              id="signDate"
              value={signature.signDate}
              onChange={updateSignature('signDate')}
            />
          </div>
        </div>
        <div style={{
          flexBasis: '50%',
          padding: 8,
          marginTop: 20
        }}>
          <div>
            <Button onClick={() => {
              executeCommand("removeSignature");
            }}>Удалить подпись</Button>
          </div>
        </div>
      </React.Fragment>
    )
  }
}
