import React, {PureComponent, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {$get, $transform} from 'plow-js';

import {IconButton, TextArea} from '@neos-project/react-ui-components';
import {neos} from '@neos-project/neos-ui-decorators';
import {executeCommand} from '@neos-project/neos-ui-ckeditor5-bindings';

import {selectors} from '@neos-project/neos-ui-redux-store';

import style from './style.css';

@connect($transform({
    formattingUnderCursor: selectors.UI.ContentCanvas.formattingUnderCursor
}))
@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
export default class FootnoteButton extends PureComponent {
    static propTypes = {
        formattingUnderCursor: PropTypes.objectOf(PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.bool,
            PropTypes.string,
            PropTypes.object
        ])),
        inlineEditorOptions: PropTypes.object,
        i18nRegistry: PropTypes.object.isRequired
    };

    state = {
        isOpen: false
    };

    componentWillReceiveProps(nextProps) {
        // if new selection doesn't have a footnote, close the footnote dialog
        if (!$get('footnote', nextProps.formattingUnderCursor)) {
            this.setState({isOpen: false});
        }
    }

    handleFootnoteButtonClick = () => {
        if (this.isOpen()) {
            if ($get('footnote', this.props.formattingUnderCursor) !== undefined) {
                executeCommand('footnote');
            }
            this.setState({isOpen: false});
        } else {
            this.setState({isOpen: true});
        }
    }

    render() {
        const {i18nRegistry, formattingUnderCursor, inlineEditorOptions } = this.props;

        return (
            <div>
                <IconButton
                    title={this.getFootnote() ? `${i18nRegistry.translate('Psmb.Footnote:Main:removeFootnote', 'Remove footnote')}` : `${i18nRegistry.translate('Psmb.Footnote:Main:insertFootnote', 'Insert footnote')}`}
                    isActive={this.isOpen()}
                    icon={this.getFootnote() ? 'ban' : 'asterisk'}
                    onClick={this.handleFootnoteButtonClick}
                />
                {this.isOpen() ? <FootnoteTextField footnoteValue={this.getFootnote()} formattingUnderCursor={formattingUnderCursor} inlineEditorOptions={inlineEditorOptions} /> : null}
            </div>
        );
    }

    isOpen() {
        return Boolean(this.state.isOpen || this.getFootnote());
    }

    getFootnote() {
        return $get('footnote', this.props.formattingUnderCursor) || '';
    }
}

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
class FootnoteTextField extends PureComponent {
    static propTypes = {
        i18nRegistry: PropTypes.object,
        footnoteValue: PropTypes.string,
        inlineEditorOptions: PropTypes.object
    };

    render() {
        return (
            <div className={style.flyout}>
                <TextArea
                    value={this.props.footnoteValue}
                    autoFocus
                    placeholder={this.props.i18nRegistry.translate('Psmb.Footnote:Main:placeholder', 'Enter footnote text')}
                    onChange={value => {
                        executeCommand('footnote', value, false);
                    }}
                />
            </div>
        );
    }
}
