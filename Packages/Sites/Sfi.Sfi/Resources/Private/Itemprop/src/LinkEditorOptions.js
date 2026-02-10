import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { $get, $transform } from "plow-js";

import {
    TextInput,
    DateInput,
    Button,
} from "@neos-project/react-ui-components";
import { executeCommand } from "@neos-project/neos-ui-ckeditor5-bindings";

import { selectors } from "@neos-project/neos-ui-redux-store";

@connect(
    $transform({
        formattingUnderCursor: selectors.UI.ContentCanvas.formattingUnderCursor,
    }),
)
export default class LinkEditorOptions extends PureComponent {
    static propTypes = {
        formattingUnderCursor: PropTypes.object,
        linkingOptions: PropTypes.object,
    };

    doSign = (signKey, sourceUrl) => {
        const signatureData = {
            signed: false,
            signee: "Копировский Александр Михайлович",
            signeePosition: "Ректор",
            signDate: new Date(),
            signKey: signKey,
        };

        // Persist signature metadata for SHA1 keys (inline asset links)
        if (/^[a-f0-9]{40}$/.test(signKey)) {
            fetch("/api/signature/store", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    signKey: signKey,
                    signee: signatureData.signee,
                    signeePosition: signatureData.signeePosition,
                    signDate: signatureData.signDate.toISOString(),
                    sourceUrl: sourceUrl,
                }),
            }).catch((err) =>
                console.warn("Failed to store signature:", err),
            );
        }

        executeCommand("signature", JSON.stringify(signatureData), false);
    };

    handleSign = () => {
        const href = $get("link", this.props.formattingUnderCursor);
        if (!href) return;

        // Check for asset:// link (Neos internal format) - resolve to SHA1
        const assetMatch = href.match(/^asset:\/\/(.+)$/);
        if (assetMatch) {
            fetch(`/api/asset-sha1?identifier=${assetMatch[1]}`, {
                credentials: "same-origin",
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.sha1) {
                        this.doSign(data.sha1, href);
                    } else {
                        alert("Не удалось получить SHA1 файла");
                    }
                })
                .catch(() => alert("Ошибка при получении SHA1 файла"));
            return;
        }

        // Check for Neos resource URL with SHA1 in path
        const sha1Match = href.match(/\/([a-f0-9]{40})\//i);
        if (sha1Match) {
            this.doSign(sha1Match[1].toLowerCase(), href);
            return;
        }

        // Check for /umo/ link
        if (href.includes("/umo/")) {
            const umoPath = href.split("/umo/")[1];
            if (umoPath) {
                this.doSign("u:" + btoa(umoPath), href);
                return;
            }
        }

        alert("Невозможно подписать эту ссылку");
    };

    render() {
        let signature = null;
        const signatureJson = $get(
            "signature",
            this.props.formattingUnderCursor,
        );
        if (signatureJson) {
            try {
                signature = JSON.parse(signatureJson);
            } catch (e) {}
        }

        if (!signature) {
            return (
                <div
                    style={{
                        flexBasis: "50%",
                        padding: 8,
                    }}
                >
                    <div>
                        <Button onClick={this.handleSign}>Подписать</Button>
                    </div>
                </div>
            );
        }

        const updateSignature = (key) => (value) => {
            signature[key] = value;
            executeCommand("signature", JSON.stringify(signature), false);
        };
        return (
            <div
                style={{
                    maxHeight: 450,
                    overflow: "auto",
                    display: "flex",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        flexBasis: "50%",
                        padding: 8,
                    }}
                >
                    <label className={{ marginBottom: 4 }} htmlFor="signee">
                        ФИО подписавшего документ
                    </label>
                    <div>
                        <TextInput
                            id="signee"
                            value={signature.signee}
                            placeholder={"ФИО подписавшего документ"}
                            onChange={updateSignature("signee")}
                        />
                    </div>
                </div>
                <div
                    style={{
                        flexBasis: "50%",
                        padding: 8,
                    }}
                >
                    <label
                        className={{ marginBottom: 4 }}
                        htmlFor="signeePosition"
                    >
                        Должность подписавшего
                    </label>
                    <div>
                        <TextInput
                            id="signeePosition"
                            value={signature.signeePosition}
                            placeholder={"ФИО подписавшего документ"}
                            onChange={updateSignature("signeePosition")}
                        />
                    </div>
                </div>
                <div
                    style={{
                        flexBasis: "50%",
                        padding: 8,
                    }}
                >
                    <label className={{ marginBottom: 4 }} htmlFor="signDate">
                        Дата подписания
                    </label>
                    <div>
                        <DateInput
                            id="signDate"
                            value={signature.signDate}
                            onChange={updateSignature("signDate")}
                        />
                    </div>
                </div>
                <div
                    style={{
                        flexBasis: "50%",
                        padding: 8,
                        marginTop: 20,
                    }}
                >
                    <div>
                        <Button
                            onClick={() => {
                                executeCommand("removeSignature");
                            }}
                        >
                            Удалить подпись
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
