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
        documentNode: selectors.CR.Nodes.documentNodeSelector,
    }),
)
export default class LinkEditorOptions extends PureComponent {
    static propTypes = {
        formattingUnderCursor: PropTypes.object,
        linkingOptions: PropTypes.object,
        documentNode: PropTypes.object,
    };

    getFolder = () => {
        const node = this.props.documentNode;
        if (!node || !node.properties) return "";
        return node.properties.specialityIdInternal
            || node.properties.specialityId
            || node.properties.title
            || "";
    };

    doSign = (signKey, sourceUrl) => {
        const signatureData = {
            signed: false,
            signee: "Копировский Александр Михайлович",
            signeePosition: "Ректор",
            signDate: new Date(),
            signKey: signKey,
        };

        // Persist signature metadata to SignatureRecord
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
                folder: this.getFolder(),
            }),
        }).catch((err) =>
            console.warn("Failed to store signature:", err),
        );

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

        // Check for /umo/ link - hash the path to get a SHA1 signKey
        if (href.includes("/umo/")) {
            const umoPath = href.split("/umo/")[1];
            if (umoPath) {
                const buffer = new TextEncoder().encode(umoPath);
                crypto.subtle.digest("SHA-1", buffer).then((hashBuffer) => {
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const sha1 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
                    this.doSign(sha1, href);
                });
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

            if (signature.signKey) {
                const signDate = signature.signDate instanceof Date
                    ? signature.signDate.toISOString()
                    : signature.signDate;
                fetch("/api/signature/store", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        signKey: signature.signKey,
                        signee: signature.signee || "",
                        signeePosition: signature.signeePosition || "",
                        signDate: signDate || "",
                    }),
                }).catch((err) =>
                    console.warn("Failed to update signature:", err),
                );
            }
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
