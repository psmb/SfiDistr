export default CKEDITOR => {
    CKEDITOR.plugins.add('itemprop', {
        init(editor) {
            editor.addCommand('itemprop', new CKEDITOR.dialogCommand('itempropDialog', {
                allowedContent: '*[itemprop]'
            }));

            CKEDITOR.dialog.add('itempropDialog', editor => {
                return {
                    title: 'Itemprop',
                    contents: [
                        {
                            id: 'tab-main',
                            label: 'Itemprop',
                            elements: [
                                {
                                    type: 'text',
                                    id: 'itemprop',
                                    label: 'Itemprop',
                                    setup(element) {
                                        this.setValue(element.getAttribute('itemprop'));
                                    },
                                    commit(element) {
                                        element.setAttribute('itemprop', this.getValue());
                                    }
                                }
                            ]
                        }
                    ],
                    onShow() {
                        const selection = editor.getSelection();
                        const element = selection.getStartElement();
                        this.element = element;
                        this.setupContent(this.element);
                    },
                    onOk() {
                        this.commitContent(this.element);
                    }
                };
            });
        }
    });
};
